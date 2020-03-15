# AsylumConnect catalog-api

[![Build Status](https://travis-ci.org/asylum-connect/catalog-api.svg?branch=master)](https://travis-ci.org/asylum-connect/catalog-api)

## Development

```
$ cd to catalog-api

$ npm i

$ npm start
```

In order to run the app you need a [.env][https://www.npmjs.com/package/dotenv] file with a valid mongodb connection string

## Codebase

Our routes documentation can be found at /docs on staging and production.

Folder structure

```
catalog-api/
├── src             # All of the source code for the server
├── src/routes      # Server's routes used in the router
├── src/utils       # Shared utilities
└── src/index.js    # Initializes the Express server
```

Technologies

- [Express](https://expressjs.com/)
- [Backpack](https://github.com/jaredpalmer/backpack)
