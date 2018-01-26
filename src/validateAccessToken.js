module.exports = function (req, res, next) {
  const accessToken = req.headers['x-access-token'] || req.query.access_token;

  if (!accessToken) {
    return next({status: 401, error: 'access token is missing'});
  }

  // we cannot actually validate the token here 'cause it's GitHub token
  req.accessToken = accessToken;

  next();
};
