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
- `GET /list` _(requires GitHub user access token in `privateAccess`)_ - list last run repositories test results
- `POST /rescan` _(requires GitHub user access token in `privateAccess`)_ - force rescan of the repositories and re-run the tests 

#### List response example

Here is example response from `GET /list` endpoint. It could be useful if you'd like to create your own UI for showing test results (instead of [pingster-ui](user-interface))

```js
{
  // list of user/org repos with pingster config 
  "repos": [{
    // repo data provided by github
    "url": "https://github.com/user/app-with-pingster",
    "name": "app-with-pingster",
    "fullName": "user/app-with-pingster",
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

Most of the options are self-descriptive (configuration is powered by [c0nfig](https://github.com/voronianski/c0nfig) module):

```js
module.exports = {
  port: process.env.NODE_PORT || process.env.PORT || 1985,
  
  // set to `true` if you want to validate user has proper access to repos
  privateAccess: false,

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

    // organization scanner bot authentication
    // make sure your user-bot has proper access to org
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

```js
{"access_token": "ca9d891fa4bdf7ae5039e689c26370a192422541"}
```

You need to save `access_token` in browser's cookies or `localStorage` and pass it in all requests that require authentication as `x-access-token` header or `access_token` query param.

## Persistent Drivers

Pingster server comes with several built-in persistency drivers that will save the results of your last test run in order to be able to show this data later. 

Though in most cases `'memory'` driver will be enough to make the app display correct data but you might want to consider other options as well:

- `'memory'` - saves last test results in memory (after server restart data is lost until next rescan)
- `'s3'` - saves last test results in [AWS S3](https://aws.amazon.com/s3) bucket as one JSON file which is get replaced on every run (you will need to provide `aws` configuration object in config file)
- `'mongodb'` - saves last test results in [MongoDB](https://www.mongodb.com) collection as the only document which is get replaced on every run (you will need to provide `mongodb` configuration object in config file)

More drivers to come and PRs are welcome!

### Writing Your Own Driver

You are free to write your own drivers in case you have some specific requirements. 

Generally driver should conform to the simple `get/set` API and here is a boilerplate:

```js
function get () {
  // `get` should always return a Promise
  // even if you are doing sync operation
  return new Promise((resolve, reject) => {

  });
}

// `set` is not returning anything in any case
function set (obj) {

}

module.exports = { get, set };
```

## User Interface

[Pingster UI](https://github.com/zenmate/pingster-ui) is a single-page app writen in React.js that uses [pingser-server](#endpoints) to display test results.

---
