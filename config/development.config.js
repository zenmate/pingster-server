module.exports = {
  port: process.env.NODE_PORT || process.env.PORT || 1985,
  github: {
    org: process.env.GITHUB_ORG,
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET
  }
};
