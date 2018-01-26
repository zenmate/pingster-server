const express = require('express');
const { github } = require('c0nfig');
const request = require('superagent');
const appendQuery = require('append-query');

const githubUrl = 'https://github.com/login/oauth';

module.exports = function () {
  const router = express.Router();

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
          res.redirect(appendQuery(decodeURIComponent(redirectUrl), {access_token: accessToken}));
        } else {
          res.json({access_token: accessToken});
        }
      })
      .catch(err => {
        next(err);
      });
  });
  return router;
};
