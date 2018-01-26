# ZenMate Pingster Server

> Server for our new awesome url dependency checker tool.

## Usage

Clone this repository and run your own instance of Pingster server:

```bash
npm install
npm start
# or for development
npm run watch
```

## Endpoints

`GET /auth/github` - login user with GitHub OAuth flow
`GET /auth/github/callback` - GitHub OAuth callback URL
`GET /list` _(requires GitHub user authorization)_ - list last run repositories test results
`POST /rescan` _(requires GitHub user authorization)_ - force rescan of the repositories and re-run the tests 

## Configuration

Most of the options are self-descriptive, you can also extend it with your own if you plan to update the server somehow ([c0nfig](https://github.com/voronianski/c0nfig) module is used here):

```js
module.exports = {
  port: process.env.NODE_PORT || process.env.PORT || 1985,

  scanInterval: 1000 * 60 * 60, // msecs (1 hour)
  scanOnServerStart: true,
  scanPersistenDriver: 'memory',

  github: {
    // github organization to scan
    org: process.env.GITHUB_ORG,

    // github user authentication
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,

    // organization scanner bot authentication
    // make sure your user-bot has proper access to org
    personalAccessToken: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  }
};
```

## Scanner Authorization

Repository scanner uses [GitHub OAuth non-web application flow](https://developer.github.com/apps/building-oauth-apps/authorization-options-for-oauth-apps/#non-web-application-flow) which means that you can simply create a personal token of the user that has access to organization here - https://github.com/settings/tokens.

## User Authorization 

Firstly in order to authorize a user you need to register a new GitHub OAuth application here - https://github.com/settings/applications/new. Please provide `Authorization callback URL` which in our case will be - `https://your.domain/auth/github/callback`.

User needs to open `https://your.domain/auth/github` in the browser and go with the flow. There's optional `redirect_uri` param which will be used to redirect the user:

```js
'https://your.domain/auth/github?redirect_uri=https://your.domain2/application'

// will redirect to =>
'https://your.domain2/application?access_token=ca9d891fa4bdf7ae5039e689c26370a192422541'
```

if param is not provided, JSON response will be provided:

```json
{"access_token": "ca9d891fa4bdf7ae5039e689c26370a192422541"}
```

You need to save `access_token` in browser's cookies or localStorage and pass it in all requests that require authentication as `x-access-token` header or `access_token` query param.

## Persistent Drivers

---
