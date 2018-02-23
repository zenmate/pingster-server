const GithubAPI = require('github-api');
const pingsterCore = require('pingster');
const parallelLimit = require('async/parallelLimit');

const {
  github,
  scanInterval,
  scanPersistenDriver
} = require('c0nfig');

const cacheDriver = require(`./drivers/${scanPersistenDriver}`);

let timeout;
let lastRunAt;

function scan (token) {
  console.log('scanning with token', token);

  clearTimeout(timeout);

  // scan only if interval is added to config
  if (scanInterval) {
    timeout = setTimeout(() => scan(token), scanInterval);
  }

  return new Promise((resolve, reject) => {
    if (!token) {
      return reject('github token is missing');
    }

    const githubApi = new GithubAPI({ token });

    // organizations are in higher priority
    if (github.org) {
      return githubApi
        .getOrganization(github.org)
        .getRepos()
        .then(repos => _run(github.org, repos))
        .catch(err => reject(err));
    }

    if (github.user) {
      return githubApi
        .getUser(github.user)
        .listRepos()
        .then(repos => _run(github.user, repos))
        .catch(err => reject(err));
    }

    reject('github organization or user should be added to config');

    // runner gets all repos of github org or user
    // checks default branch for pingster.yml config file
    // if it's present starts pingster test from config
    // saves test results into cache driver
    function _run (orgOrUser, repos) {
      const repoRequests = repos.data.map(repo => {
        return done => {
          githubApi
            .getRepo(orgOrUser, repo.name)
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

        const nextRunAt = lastRunAt + scanInterval;
        const data = {
          repos,
          lastRunAt,
          nextRunAt
        };

        cacheDriver.set(data);
        resolve(data);
      });
    }
  });
}

function list () {
  return cacheDriver
    .get()
    .then(data => {
      if (!data) {
        return {repos: []};
      }

      return data;
    });
}

module.exports = {
  scan,
  list
};
