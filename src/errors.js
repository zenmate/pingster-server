const { env } = require('c0nfig');

function handleNotFound (req, res, next) {
  next({
    status: 404,
    error: 'not found'
  });
}

function handleErrors (err, req, res, _) {
  if ('development' === env && err.stack) {
    console.error(err.stack);
  }

  // defaults
  const error = {
    status: err.status || 500,
    error: err.error || 'internal server error'
  };

  // check for github-api response as well
  if (err.response) {
    error.status = err.response.status;
    error.error = err.response.statusText.toLowerCase();
    error.data = err.response.data;
    error.source = 'github-api';
  }

  res.status(error.status).json(error);
}

module.exports = {
  handleNotFound,
  handleErrors
};
