const { env } = require('c0nfig');

function handleNotFound (req, res, next) {
  next({status: 404, error: 'not found'});
}

function handleErrors (err, req, res, _) {
  if ('development' === env && err.stack) {
    console.log(err.stack);
  }

  if (err.error && err.error.text) {
    try {
      const obj = JSON.parse(err.error.text);

      if (obj.error) {
        err.error = obj.error;
      }
    } catch (e) {
      // fail silently
    }
  }

  // check for github-api response as well
  const error = {
    status: (
      err.status ||
      err.response && err.response.status ||
      500
    ),
    error: (
      err.error ||
      'internal server error'
    )
  };

  if (err.response) {
    error.source = 'external-api';
  }

  res.status(error.status).json(error);
}

module.exports = {
  handleNotFound,
  handleErrors
};
