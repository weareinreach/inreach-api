# InReach catalog-api

**NOTE:**

In some locations you will encounter asylum-connect references vs inreach references. The application/organization used to be called asylum-connect, and during a rebrand in May 2022, it is now inReach/inreach,

## CI/CD

The development lifecycle is controlled by these tools:

- [Source Control](https://github.com/asylum-connect)
- [Orchestration Tool](https://app.circleci.com/pipelines/github/asylum-connect)
- [Automation Tool](https://docs.cypress.io/)
- [Code Coverage](https://app.codecov.io/gh/asylum-connect)
- [Code Quality](https://sonarcloud.io/organizations/asylum-connect/projects)

In order to run the app you need a [.env](https://www.npmjs.com/package/dotenv) file with a valid `MONGODB_URI` value for the mongodb connection string.

CircleCI is being used to enforce Code quality in all pull requests. Passed status checks are necessary in order to merge a PR.

In order to enforce code standards we use [eslint](https://eslint.org/) and [prettier](https://prettier.io/). Setting up eslint in your code editor is the easiest way to adhere to guidlines while programming but we also lint and prettify code during the commit process using [lint-staged](https://github.com/okonet/lint-staged).

## Technologies

- [Node](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [Backpack](https://github.com/jaredpalmer/backpack)
- [Yarn](https://yarnpkg.com/)

Please check the README.md docs to the components of the App to learn more:

- [Automation](./cypress/README.md)
- [Docker](./docker/README.md)
- [Migrations](./migrations/README.md)
