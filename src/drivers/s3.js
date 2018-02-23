const AWS = require('aws-sdk');
const { aws } = require('c0nfig');

AWS.config.update({
  accessKeyId: aws.key,
  secretAccessKey: aws.secret
});

const s3 = new AWS.S3();
const options = {
  Bucket: aws.s3BucketName,
  Key: aws.s3BucketKey
};

function get () {
  return new Promise((resolve, reject) => {
    s3.getObject({
      ...options,
      ResponseContentType: 'application/json'
    }, (err, res) => {
      if (err) {
        return reject(err);
      }

      let data;
      try {
        data = JSON.parse(res.Body.toString('utf-8'));
      } catch (e) {
        return reject(e);
      }

      resolve(data);
    });
  });
}

function set (obj = {}) {
  s3.upload({
    ...options,
    Body: JSON.stringify(obj),
    ContentType: 'application/json'
  });
}

module.exports = { get, set };
