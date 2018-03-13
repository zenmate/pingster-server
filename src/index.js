const cors = require('cors');
const logger = require('morgan');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const {
  env,
  port,
  scanOnServerStart,
  scanPersistentDriver
} = require('c0nfig');

const auth = require('./auth');
const scanner = require('./scanner');
const errors = require('./middleware/errors');
const checkUserToken = require('./middleware/checkUserToken');

const app = express();

if ('development' === env) {
  app.use(logger('dev'));
}

app.disable('x-powered-by');
app.use(cors());
app.use(compression());
app.use(cookieParser());

app.use('/ping', (req, res) => {
  res.send('pong ^.^');
});

app.use('/auth', auth());

app.get('/list',
  checkUserToken,
  (req, res, next) => {
    scanner.list(req.userAccessToken)
      .then(data => res.json(data))
      .catch(err => next(err));
  });

app.post('/rescan',
  checkUserToken,
  (req, res, next) => {
    scanner.list(req.userAccessToken)
      .then(data => {
        if (!data.repos.length) {
          return next({status: 403, message: 'github user has no repos access'});
        }

        scanner.scan()
          .then(() => res.sendStatus(204))
          .catch(err => next(err));
      })
      .catch(err => next(err));
  });

// handle errors
app.use(errors.handleNotFound);
app.use(errors.handleErrors);

if (scanOnServerStart) {
  scanner.scan()
    .then(() => {
      startServer();
    })
    .catch(err => {
      console.error(`cannot start api http://localhost:${port} env=${env} due to error:`, err);
    });
} else {
  startServer();
}

function startServer () {
  app.listen(port, () => {
    console.log(`api is listening on http://localhost:${port} env=${env} driver=${scanPersistentDriver}`);
  });
}
