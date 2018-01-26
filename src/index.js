const cors = require('cors');
const logger = require('morgan');
const express = require('express');
const compression = require('compression');
const { port, env } = require('c0nfig');

const app = express();

if ('development' === env) {
  app.use(logger('dev'));
}

app.disable('x-powered-by');
app.use(cors());
app.use(compression());

app.use('/ping', (req, res) => res.send('pong ^.^'));

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

app.listen(port, () => {
  console.log(`api is listening on http://localhost:${port} env=${env}`);
});
