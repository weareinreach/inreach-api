# AsylumConnect catalog-api

[![Build Status](https://travis-ci.org/asylum-connect/catalog-api.svg?branch=master)](https://travis-ci.org/asylum-connect/catalog-api)

## Development

```
$ cd to catalog-api

$ npm i

$ npm start
```

In order to run the app you need a [.env][https://www.npmjs.com/package/dotenv] file with a valid `MONGODB_URI` value for the mongodb connection string.

## Codebase

Our routes documentation can be found at `/docs` on staging and production.

Folder structure

```
catalog-api/
├── src               # All of the source code for the server
├── src/middleware    # Middleware for intercepting & manipulating requests
├── src/routes        # Server's routes and router functions
├── src/utils         # Shared utilities
├── src/db.js         # Initializes connection to database
├── src/mongoose.js   # Mongoose Schemas
├── src/swagger.json  # Swagger spec
└── src/index.js      # Initializes the Express server
```

Technologies

- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [Backpack](https://github.com/jaredpalmer/backpack)

Testing
Project uses both Unit Testing and E2E Testing to ensure quality and coverage standards.

- [Jest](https://jestjs.io/)
- [Cypress](https://www.cypress.io/)
- [Istanbul](https://istanbul.js.org/)

- Running Unit Testing
Run these package.json scripts:
 - pre-unit-test
 - unit-test
 

- Running E2E
Run these package.json scripts:
 - pre-e2e-test
 - e2e or e2eUI
 - post-e2e-test


CI/CD
CircleCI is being used to enforce Code quality in all pull requests. Passed status checks are necessary in order to merge a PR.

- [CircleCI](https://circleci.com/)

Code Standards

In order to enforce code standards we use [eslint](https://eslint.org/) and [prettier](https://prettier.io/). Setting up eslint in your code editor is the easiest way to adhere to guidlines while programming but we also lint and prettify code during the commit process using [lint-staged](https://github.com/okonet/lint-staged).

Deployment Notes

- Initial deployment requires a "text index required for \$text query"
