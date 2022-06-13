# Migrations

## How migrations are coordinated

Migrations files should follow the naming convention:

```
yyyy.mm.01.{a|z}._{short_description}.js
```

yyyy - year(2022, 2023, etc.)
mm - month(01, 02, ...12)
dd - day(01) - we try to release at the end of the month, every month.

{a|z} - letters (a, b, c, ...z) - this determines the order of execution (alphabetical) of the scripts. Use this from migrations that have dependencies.

{short_description} - string - this gives a quick overview of the migration.

While developing note the month you are developing and create the migration file with next months date.

ex: Developing in January 2022, migration file should be: 2022.02.01.

## How migrations are run locally?

In order to run a single migration file locally against the Docker database in package.json there are 2 scripts you can use:

Please ensure that you export the $MIGRATION_FILE.

```
"run-migration": "MIGRATION=true node $MIGRATION_FILE",
"rollback-migration":"ROLLBACK=true node $MIGRATION_FILE",
```

To run all the migrations of a release use the script at the path below. Please read the file as there are changes in order to run the correct release:

```
./migrations/runReleaseMigrations.sh
```

NOTE: Ensure you update the DATE_PATTERN variable to run the correct release set of migration files.

If you receive an error for permission denied, cd into migrations and run:

```
chmod u+x runReleaseMigrations.sh
```

## Update your .env file

```
PROFILE=LOCAL
```

## Docker updates

With the docker data layer capabilities. Please update the docker DB with any migrations needed.

Ex:

- Compound indexes are an example of migrations that are needed.
- Schema keys changes(adding/updating) are good example
- Schema field indexes are not good examples

## How migrations are run in Staging?

In circle CI there are workflows to run migration_stage/rollback_stage. They are triggered by a Postman or CURL Request to CircleCI API when migration is merged into dev branch. Add the files necessary separated by a comma for the migration to run under the key files.

[Creating your CircleCI Token](https://circleci.com/docs/2.0/managing-api-tokens/)

CURL example:

```
curl --request POST \
  --url https://circleci.com/api/v2/project/gh/asylum-connect/inreach-api/pipeline \
  --header 'Circle-Token: ***********************************' \
  --header 'content-type: application/json' \
  --data '{"branch":"dev",
      "parameters":{"run_rollback_staging": true,
	  "run_branch_pipeline":false,
    "files": "migration_file_1.js,migration_file_2.js,migration_file_3.js"}}'
```

## How migrations are run in Production?

In circle CI there are workflows to run migration_prod/rollback_prod. They are triggered by a Postman to CircleCI API when the migration is merged into main branch. This will trigger the pipeline that will require an approval. Navigate to Circle CI to approve the migration. This migration differently from staging will run the series of migrations for the release. We use date_pattern instead of files.

CURL example:

```
curl --request POST \
  --url https://circleci.com/api/v2/project/gh/asylum-connect/inreach-api/pipeline \
  --header 'Circle-Token: ***********************************' \
  --header 'content-type: application/json' \
  --data '{"branch":"main",
    "parameters":{"run_migration_prod": true,
    "date_pattern": "2022.02.01"}}'
```

## Migration files

This folder will contain all the migrations to the MongoDB. Schema changes that require default values to be set should be addressed with a migration.

The file should follow this template:

```
/**********************************************************************************
 *  Release 2021-11-01
 *  Issue:  https://app.asana.com/0/1132189118126148/1176142788936875
 *  Description: This schema change will add is_deleted: false to all
 *               organizations. When an organization is soft deleted by
 *               a data manager it will not show up on General Org queries
 * ********************************************************************************


/* eslint-disable no-console */
require('babel-register')({
	presets: ['env']
});

// Import .env file
require('dotenv').config({
	path: '.env'
});
// Import DB Connection
require('../src/db');
var migrationFunctions = require('./migrationsFunctions')
var mongoose = require('../src/mongoose');

if (process.env.MIGRATION) {
	switch (process.env.PROFILE) {
		case 'CI':
			migrationFunctions.checkIfMigrationHasRun().then(hasRun => {
				if (!hasRun) {
					runMigrationScript();
				}
			});
			break;
		default:
			runMigrationScript();
			break;
	}
}

if (process.env.ROLLBACK) {
	switch (process.env.PROFILE) {
		case 'CI':
			migrationFunctions.checkIfMigrationHasRun().then(hasRun => {
				if (!hasRun) {
					runRollbackScript();
				}
			});
			break;
		default:
			runRollbackScript();
			break;
   }
}

//Scripts
function runMigrationScript() {
	//Define the migration
}

function runRollbackScript() {
	//Define the rollback
}

```

Inside the runMigrationScript/runRollbackScript functions add the actual migration to the schema.

## Released folder

All released migrations are put in the released folder. Look in there for examples of other migration scripts.
