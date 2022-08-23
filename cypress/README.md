# Automation Tests

We are using Cypress as our automation tool, it is a very versatile tool that allows testing of both frontend and backend. [Check here](https://docs.cypress.io/) for more documentation.

## How Automation tests are run

Automation tests, are set to be run locally first and they will run automatically in every Pull Requests. These are required to pass in order for Pull Requests to be merged into dev.

To run the tests locally it can be run 2 ways. It can be run against the staging database or the locally host database. **The recommendation is to run against the locally hosted database.**

Check [docker documentation](../docker/README.md) on how to set up docker locally.

These are the important variables to running automation locally. On the .env file(Please get an example of the .env file from one of the developers):

- PROFILE=LOCAL

To run the tests you must first have the application locally, then initiate tests.

Use command to start app:

- yarn dev-background

To run the tests you can run:

- yarn e2e
- yarn e2eUI
