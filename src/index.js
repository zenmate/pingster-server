const cors = require('cors');
const logger = require('morgan');
const express = require('express');
const compression = require('compression');
const { port, env } = require('c0nfig');
const db = require('./db');

const app = express();

if ('development' === env) {
  app.use(logger('dev'));
}

app.disable('x-powered-by');
app.use(cors());
app.use(compression());

db.init();

app.use('/ping', (req, res) => res.send('pong ^.^'));

app.listen(port, () => {
  console.log(`api is listening on http://localhost:${port} env=${env}`);
});
