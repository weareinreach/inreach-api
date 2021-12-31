/**********************************************************************************
  *  Release: 2021-12-31
  *  Issue:  https://app.asana.com/0/1132189118126148/1198892993658136
  *  Description: This schema change adds a geospatial
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
require('../src/db');

var mongoose = require('../src/mongoose');

//Scripts
const runMigrationScript = () => {
	mongoose.Organization.collection
		.createIndex({'locations.geolocation': '2dsphere'}, {sparse: true})
		.then((result) => {
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
	mongoose.Organization.collection
		.dropIndex({'locations.geolocation': '2dsphere'})
		.then((result) => {
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
