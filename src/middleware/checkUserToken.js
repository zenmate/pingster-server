const { privateAccess } = require('c0nfig');

module.exports = function checkUserToken (req, res, next) {
  if (!privateAccess) {
    return next();
  }

  const accessToken = req.headers['x-access-token'] || req.query.access_token;

  if (!accessToken) {
    return next({status: 401, error: 'access token is missing'});
  }

  req.userAccessToken = accessToken;

  next();
};
