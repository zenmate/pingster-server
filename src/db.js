const dynasty = require('dynasty');

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-central-1'
};

var connection = null;

exports.init = function() {
  connection = dynasty(credentials);
};

exports.get = function() {
  return connection;
};
