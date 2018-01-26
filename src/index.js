const cors = require('cors');
const logger = require('morgan');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const {
  env,
  port,
  github,
  scanOnServerStart
} = require('c0nfig');

const auth = require('./auth');
const errors = require('./errors');
const scanner = require('./scanner');

const app = express();

if ('development' === env) {
  app.use(logger('dev'));
}

app.disable('x-powered-by');
app.use(cors());
app.use(compression());
app.use(cookieParser());

app.use('/ping', (req, res) => res.send('pong ^.^'));
app.use('/auth', auth());

// mock api for now
app.get('/list', (req, res) => {
  res.json(scanner.list());
});

app.get('/next-scan', (req, res, next) => {

});

app.post('/rescan', (req, res, next) => {
  scanner.scan(github.personalAccessToken)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

app.use(errors.handleNotFound);
app.use(errors.handleErrors);

if (scanOnServerStart) {
  scanner.scan(github.personalAccessToken)
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
    console.log(`api is listening on http://localhost:${port} env=${env}`);
  });
}
