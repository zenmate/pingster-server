const GithubAPI = require('github-api');
const { github } = require('c0nfig');

function getPingsterRepos (token) {
  const githubApi = new GithubAPI({ token });

  return new Promise((resolve, reject) => {
    // organizations are in higher priority
    if (github.org) {
      return githubApi
        .getOrganization(github.org)
        .getRepos()
        .then(repos => resolve({repos, type: 'org'}))
        .catch(err => reject(err));
    }

    if (github.user) {
      return githubApi
        .getUser(github.user)
        .listRepos()
        .then(repos => resolve({repos, type: 'user'}))
        .catch(err => reject(err));
    }

    reject('github organization or user should be added to config');
  });
}

module.exports = {
  getPingsterRepos
};
