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
//Replace .env with a {.env-prod} file with DB_URI env var pointing to Prod
require('dotenv').config({
	path: '.env'
});
// Import DB Connection
require('../../src/db');

var mongoose = require('../../src/mongoose');

if (process.env.MIGRATION) {
	runMigrationScript();
}

if (process.env.ROLLBACK) {
	runRollbackScript();
}

//Scripts
function runMigrationScript() {
	mongoose.Organization.updateMany(
		{},
		{
			$set: {
				is_deleted: false
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
}

function runRollbackScript() {
	//Rollback Script
	mongoose.Organization.updateMany(
		{},
		{
			$unset: {
				is_deleted: ''
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
}
