module.exports = {
  port: process.env.NODE_PORT || process.env.PORT || 1985,

  scanInterval: 1000 * 60 * 60, // (1 hour)
  scanOnServerStart: true,
  scanPersistenDriver: 's3',

  github: {
    // github organization or user to scan
    org: process.env.GITHUB_ORG, // higher priority
    user: process.env.GITHUB_USER,

    // github user authentication
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,

    // organization scanner bot authentication
    // make sure your user-bot has proper access to org
    personalAccessToken: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  },

  // needed only in case you use 's3' or 'dynamodb' as scanPersistenDriver
  aws: {
    key: process.env.AWS_KEY,
    secret: process.env.AWS_SECRET,

    // only for `s3` scanPersistenDriver
    s3BucketName: process.env.S3_BUCKET_NAME,
    s3BucketKey: process.env.S3_BUCKET_KEY
  }
};
