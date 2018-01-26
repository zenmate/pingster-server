const {
  github,
  scanInterval,
  scanPersistenDriver
} = require('c0nfig');
const GithubAPI = require('github-api');
const pingsterCore = require('pingster');
const parallelLimit = require('async/parallelLimit');

const cacheDriver = require(`./drivers/${scanPersistenDriver}`);

let timeout;
let lastRunAt;

function scan (token) {
  console.log('scanning with token', token);
  clearTimeout(timeout);

  timeout = setTimeout(() => scan(token), scanInterval);

  return new Promise((resolve, reject) => {
    if (!token) {
      return reject('github token is missing');
    }

    const githubApi = new GithubAPI({ token });

    githubApi
      .getOrganization(github.org)
      .getRepos()
      .then(orgRepos => {
        const repoRequests = orgRepos.data.map(repo => {
          return done => {
            githubApi
              .getRepo(github.org, repo.name)
              .getContents(repo.default_branch, 'pingster.yml')
              .then(pingsterFile => {
                const ymlString = Buffer.from(pingsterFile.data.content, 'base64').toString('utf8');

                let parsedConfig;
                try {
                  parsedConfig = pingsterCore.parseConfig(ymlString);
                } catch (err) {
                  return done(err);
                }

                pingsterCore.tester(parsedConfig)
                  .then(testResults => {
                    const hasErrorTest = testResults.find(r => !r.success);
                    const projectData = {
                      url: repo.html_url,
                      name: repo.name,
                      fullName: repo.full_name,
                      description: repo.description,
                      private: repo.private,
                      stars: repo.stargazers_count,
                      watchers: repo.watchers_count,
                      language: repo.language,
                      defaultBranch: repo.default_branch,
                      updatedAt: new Date(repo.updated_at).getTime(),
                      pingsterConfig: parsedConfig,
                      status: hasErrorTest ? 'ERROR' : 'SUCCESS',
                      testResults
                    };

                    lastRunAt = Date.now();
                    done(null, projectData);
                  })
                  .catch(err => {
                    done(err);
                  });
              })
              .catch(err => {
                // if file's missing just fail silently
                if (err.response &&
                    err.response.status === 404) {
                  return done();
                }

                done(err);
              });
          };
        });

        parallelLimit(repoRequests, 30, (err, repos) => {
          if (err) {
            return reject(err);
          }

          // filter out repos without pingster
          repos = repos.filter(r => r);

          const data = { lastRunAt, repos };

          cacheDriver.set(data);
          resolve(data);
        });
      })
      .catch(err => {
        reject(err);
      });
  });
}

function list () {
  const data = cacheDriver.get();

  if (!data) {
    return {lastRunAt, repos: []};
  }

  return data;
}

function time () {
  // body...
}

module.exports = {
  scan,
  list,
  time
};
