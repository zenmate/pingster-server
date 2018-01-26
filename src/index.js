const cors = require('cors');
const logger = require('morgan');
const express = require('express');
const { port, env } = require('c0nfig');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const auth = require('./auth');
const errors = require('./errors');

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
app.post('/rescan', (req, res) => {
  res.sendStatus(204);
});

app.use(errors.handleNotFound);
app.use(errors.handleErrors);

app.listen(port, () => {
  console.log(`api is listening on http://localhost:${port} env=${env}`);
});
