const cors = require('cors');
const logger = require('morgan');
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const { port, env, github } = require('c0nfig');

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
  res.json({
    lastRunAt: 1516971192249,
    projects: [{
      repo: 'https://github.com/zenmate/zenadmin',
      name: 'zenadmin',
      status: 'SUCCESS',
      updatedAt: 1510151900021
    }, {
      repo: 'https://github.com/zenmate/websites',
      name: 'websites',
      status: 'SUCCESS',
      updatedAt: 1508517530181
    }, {
      repo: 'https://github.com/zenmate/crm-crud-api',
      name: 'crm-crud-api',
      status: 'ERROR',
      updatedAt: 1506095673353
    }]
  });
});

app.post('/rescan', (req, res, next) => {
  // scanner.scan(github.personallAccessToken)
    // .then(() => {
      res.sendStatus(204);
    // })
    // .catch(err => {
      // next(err);
    // });
});

app.use(errors.handleNotFound);
app.use(errors.handleErrors);

// scanner.scan(github.personalAccessToken)
//   .then(() => {
    app.listen(port, () => {
      console.log(`api is listening on http://localhost:${port} env=${env}`);
    });
  // })
  // .catch(err => {
  //   console.error(`cannot start api http://localhost:${port} env=${env} due to error:`, err);
  // });
