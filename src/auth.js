const crypto = require('crypto');
const express = require('express');
const Cache = require('node-cache');
const { github } = require('c0nfig');
const request = require('superagent');
const appendQuery = require('append-query');

const githubUrl = 'https://github.com/login/oauth';

module.exports = function () {
  const router = express.Router();
  const nonceCache = new Cache({
    stdTTL: 60, // 1 min
    checkperiod: 90 // 1.5 min
  });

  router.get('/github', (req, res) => {
    if (req.query.redirect_uri) {
      res.cookie('redirect_uri', encodeURIComponent(req.query.redirect_uri));
    }

    res.redirect(`${githubUrl}/authorize?client_id=${github.clientId}&scope=user,repo`);
  });

  router.get('/github/callback', (req, res, next) => {
    const query = {
      client_id: github.clientId,
      client_secret: github.clientSecret,
      code: req.query.code
    };

    request.get(`${githubUrl}/access_token`)
      .query(query)
      .then(apiRes => {
        const accessToken = apiRes.body.access_token;
        const redirectUrl = req.cookies.redirect_uri;

        if (redirectUrl) {
          const nonce = crypto.randomBytes(20).toString('hex');

          nonceCache.set(nonce, accessToken);
          res.clearCookie('redirect_uri');
          res.redirect(appendQuery(decodeURIComponent(redirectUrl), {github_nonce: nonce}));
        } else {
          res.json({access_token: accessToken});
        }
      })
      .catch(err => {
        next(err);
      });
  });

  router.get('/github/token', (req, res, next) => {
    if (!req.query.github_nonce) {
      return next({status: 401, error: 'nonce param is missing'});
    }

    const accessToken = nonceCache.get(req.query.github_nonce);

    if (!accessToken) {
      return next({status: 401, error: 'nonce is expired or invalid'});
    }

    res.json({access_token: accessToken});
  });

  return router;
};

