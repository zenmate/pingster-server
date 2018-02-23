# Pingster Server

> API and scheduled Pingster test runner for your GitHub projects.

## Usage

Clone this repository and run your own instance of Pingster server:

```bash
npm install
npm start

# or for development
npm run watch
```

## Endpoints

- `GET /auth/github` - login user with GitHub OAuth flow
- `GET /auth/github/callback` - GitHub OAuth callback URL
- `GET /list` _(requires GitHub user access token)_ - list last run repositories test results
- `POST /rescan` _(requires GitHub user access token)_ - force rescan of the repositories and re-run the tests 

#### List response example

Here is example response that `GET /list` endpoint returns. It could be useful if you'd like to create your UI for showing the results (instead of [pingster-ui](https://github.com/zenmate/pingster-ui))

```js
{
  // list of user/org repos with pingster config 
  "repos": [{
    // repo data provided by github
    "url": "https://github.com/username/app-with-pingster",
    "name": "app-with-pingster",
    "fullName": "username/app-with-pingster",
    "description": "App that has pingster config",
    "private": false,
    "stars": 2305,
    "watchers": 803,
    "language": "lua",
    "defaultBranch": "master",
    "updatedAt": 1519394619000,

    // actual pingster config that was used to run tests
    "pingsterConfig": {
      "httpbin": {
        "url": "https://httpbin.org/get?hello=world",
        "expect": {
          "status": 200,
          "data": {
            "url": "https://httpbin.org/get?hello=world"
          },
          "headers": {
            "content-type": "application/json"
          }
        }
      }
    },

    // status of last test run and its' results
    "status": "SUCCESS",
    "testResults": [{
      "success": true,
      "response": { ... }, // complete http response
      "name": "httpbin",
      "url": "https://httpbin.org/get?hello=world",
      "expect": {
        "status": 200,
        "data": {
          "url": "https://httpbin.org/get?hello=world"
        },
        "headers": {
          "content-type": "application/json"
        }
      }
    ]
  }],

  // scheduler data
  "lastRunAt": 1519395278563,
  "nextRunAt": 1519398878563
}
```

## Configuration

Most of the options are self-descriptive and you can also extend it with your own if you plan to update the server (configuration powered by [c0nfig](https://github.com/voronianski/c0nfig) module):

```js
module.exports = {
  port: process.env.NODE_PORT || process.env.PORT || 1985,

  scanInterval: 1000 * 60 * 60, // msecs (1 hour)
  scanOnServerStart: true,
  scanPersistenDriver: 'memory',

  github: {
    // github organization to scan (higher priority)
    org: process.env.GITHUB_ORG,

    // or github user to scan
    user: process.env.GITHUB_USER,

    // api user github authentication
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,

    // pingster scanner github authentication
    personalAccessToken: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  }
};
```

You can create as many config files as you have Node.js environments, just follow this simple file name rule - `{NODE_ENV}.config.js`.

## Scanner Authorization

Repository scanner uses [GitHub OAuth non-web application flow](https://developer.github.com/apps/building-oauth-apps/authorization-options-for-oauth-apps/#non-web-application-flow) which means that you can simply create a personal token of the user that has access to organization here - https://github.com/settings/tokens and add it to proper configuration file.

## User Authorization 

Firstly in order to authorize a user you need to register a new GitHub OAuth application here - https://github.com/settings/applications/new. 

Please provide `Authorization callback URL` which in our case will be - `https://your.domain/auth/github/callback`.

User needs to open `https://your.domain/auth/github` in the browser and go with GitHub OAuth flow. There's optional `redirect_uri` param which will be used to redirect the user:

```js
'https://your.domain/auth/github?redirect_uri=https://youranother.domain/application'

// will redirect to =>
'https://youranother.domain/application?access_token=ca9d891fa4bdf7ae5039e689c26370a192422541'
```

If param is not provided, JSON response will be provided:

```json
{"access_token": "ca9d891fa4bdf7ae5039e689c26370a192422541"}
```

You need to save `access_token` in browser's cookies or localStorage and pass it in all requests that require authentication as `x-access-token` header or `access_token` query param.

## Persistent Drivers

## User Interface

---
