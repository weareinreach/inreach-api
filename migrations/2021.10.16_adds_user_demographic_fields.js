/*******************************************************************
 *  Release 2021-11-01
 *  Issue:  https://app.asana.com/0/1200689352502326/1201008564404725
 *  Description: This schema change will update 4 fields 
 *              in the users db.
 *
 *              Updated fields:
 *              homeLocation -> countryOfOrigin
 *              identityPrimary -> sogIdentity
 *              identitySupplimental -> immigrationStatus
 *              orgAreaOfWork -> orgType
 * ******************************************************************



/* eslint-disable no-console */
require('babel-register')({
	presets: ['env']
});

// Import .env file
//Replace .env with a {.env-prod} file with DB_URI env var pointing to Prod
require('dotenv').config({path: '.env'});
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
	mongoose.Users.updateMany(
		{},
		{
			$rename: {
				homeLocation: 'countryOfOrigin',
				identityPrimary: 'sogIdentity',
				identitySupplimental: 'immigrationStatus',
				orgAreaOfWork: 'orgType'
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
	mongoose.Users.updateMany(
		{},
		{
			$rename: {
				countryOfOrigin: 'homeLocation',
				sogIdentity: 'identityPrimary',
				immigrationStatus: 'identitySupplimental',
				orgType: 'orgAreaOfWork'
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
