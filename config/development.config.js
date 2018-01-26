module.exports = {
  port: process.env.NODE_PORT || process.env.PORT || 1985,

  scanInterval: 1000 * 60 * 60, // (1 hour)
  scanOnServerStart: false,
  scanPersistenDriver: 'memory',

  github: {
    // github organization to scan
    org: process.env.GITHUB_ORG,

    // github user authentication
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,

    // organization scanner bot authentication
    // make sure your user-bot has proper access to org
    personalAccessToken: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  }
};
