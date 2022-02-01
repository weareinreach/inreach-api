/**********************************************************************************
  *  Release 2021-11-01
  *  Issue:  https://app.asana.com/0/1132189118126148/1198892993658136
  *  Description: This schema change will add a geolocation field to organization
  *               locations. This geolocation field will then be used a geospatial
  *               index to support sorting organization results by distance from the
  *               search location.
  * ********************************************************************************
  

 /* eslint-disable no-console */
require('babel-register')({
	presets: ['env']
});

// Import .env file
//Replace .env with a {.env-prod} file with DB_URI env var pointing to Prod
require('dotenv').config({
	path: '.env'
});
// Import DB Connection
require('../../src/db');

var mongoose = require('../../src/mongoose');

//Scripts
const runMigrationScript = () => {
	mongoose.Organization.updateMany(
		{},
		{
			$set: {
				'locations.$[].geolocation': []
			}
		}
	)
		.then((result) => {
			console.log('Number of modified rows ' + result.nModified);
			console.log('Migration executed');
			process.exit();
		})
		.catch((error) => {
			console.log('Error applying the migration. Failed with error: ' + error);
			process.exit();
		});
};

//Rollback Script
const runRollbackScript = () => {
	mongoose.Organization.updateMany(
		{},
		{
			$unset: {
				'locations.$[].geolocation': ''
			}
		}
	)
		.then((result) => {
			console.log('Number of modified rows ' + result.nModified);
			console.log('Rollback script executed');
			process.exit();
		})
		.catch((error) => {
			console.log(
				'Error applying the rollback script. Failed with error: ' + error
			);
			process.exit();
		});
};

if (process.env.MIGRATION) {
	runMigrationScript();
}

if (process.env.ROLLBACK) {
	runRollbackScript();
}
