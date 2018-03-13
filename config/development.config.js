module.exports = {
  port: process.env.NODE_PORT || process.env.PORT || 1985,

  // require or not github authentication to see test results
  privateAccess: process.env.PRIVATE_ACCESS,

  scanInterval: process.env.SCAN_INTERVAL || 1000 * 60 * 60, // (1 hour)
  scanOnServerStart: process.env.SCAN_ON_START || true,
  scanPersistentDriver: process.env.SCAN_DRIVER || 'memory',

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

  // needed only in case you use 's3' or 'dynamodb' as scanPersistentDriver
  aws: {
    key: process.env.AWS_KEY,
    secret: process.env.AWS_SECRET,

    // only for `s3` scanPersistentDriver
    s3BucketName: process.env.S3_BUCKET_NAME,
    s3BucketKey: process.env.S3_BUCKET_KEY
  },

  // needed only in case you use 'mongodb' as scanPersistentDriver
  mongodb: {
    url: process.env.MONGODB_URL,
    collection: process.env.MONGODB_COLLECTION
  }
};
