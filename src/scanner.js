const GithubAPI = require('github-api');
const pingsterCore = require('pingster');
const parallelLimit = require('async/parallelLimit');
const intersectionBy = require('lodash.intersectionby');

const {
  github,
  privateAccess,
  scanInterval,
  scanPersistentDriver
} = require('c0nfig');

const { getPingsterRepos } = require('./utils');
const cacheDriver = require(`./drivers/${scanPersistentDriver}`);

let timeout;
let lastRunAt;

function scan () {
  console.log('scanning with personal access token', github.personalAccessToken);

  clearTimeout(timeout);

  // scan only if interval is added to config
  if (scanInterval) {
    timeout = setTimeout(() => scan(), scanInterval);
  }

  return new Promise((resolve, reject) => {
    if (!github.personalAccessToken) {
      return reject('github pesronal access token is missing');
    }

    getPingsterRepos(github.personalAccessToken)
      .then(({repos, type}) => {
        if (type === 'org') {
          _run(github.org, repos);
        } else if (type === 'user') {
          _run(github.user, repos);
        }
      })
      .catch(err => reject(err));

    // runner gets all repos of github org or user
    // checks default branch for pingster.yml config file
    // if it's present starts pingster test from config
    // saves test results into cache driver
    function _run (orgOrUser, repos) {
      const githubApi = new GithubAPI({token: github.personalAccessToken});

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

function list (userAccessToken) {
  return new Promise((resolve, reject) => {
    if (privateAccess) {
      if (!userAccessToken) {
        return reject('github user access token is missing');
      }

      getPingsterRepos(userAccessToken)
        .then(({ repos }) => {
          cacheDriver.get().then(cacheData => {
            const allRepos = cacheData.repos;
            const userRepos = repos.data.map(r => {
              return {fullName: r.full_name};
            });

            const accessedTestableRepos = intersectionBy(allRepos, userRepos, 'fullName');

            resolve({repos: accessedTestableRepos || []});
          });
        })
        .catch(err => reject(err));
    } else {
      cacheDriver.get()
        .then(data => {
          if (!data) {
            return resolve({repos: []});
          }

          resolve(data);
        })
        .catch(err => reject(err));
    }
  });
}

module.exports = {
  scan,
  list
};
