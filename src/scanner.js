const { github } = require('c0nfig');
const GithubAPI = require('github-api');
const parallelLimit = require('async/parallelLimit');

let interval;

function scan (token) {
  return new Promise((resolve, reject) => {
    if (!token) {
      return reject('github token is missing');
    }

    const githubApi = new GithubAPI({ token });

    githubApi
      .getOrganization(github.org)
      .getRepos()
      .then(orgData => {
        const repoRequests = orgData.data.map(o => {
          // console.log(1, o);

          return done => {
            githubApi
              .getRepo(github.org, o.name)
              .getContents(o.default_branch, 'pingster.yml')
              .then(repo => {
                const ymlString = Buffer.from(repo.data.content, 'base64');
                console.log('found', repo.data, ymlString);

                done(null, repo.data, ymlString);
              })
              .catch(err => {
                // if file's missing just fail silently
                if (err.response.status === 404) {
                  return done(null);
                }

                done(err);
              });
          };
        });

        parallelLimit(repoRequests, 20, (err, data) => {
          if (err) {
            return reject(err);
          }

          resolve(data);
        });
      })
      .catch(err => {
        reject(err);
      });
  });
}

function list () {
}

function time () {
  // body...
}

module.exports = {
  scan,
  list,
  time
};
