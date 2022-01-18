/**********************************************************************************
 *  Release 20212-01-17
 *  Issue:  https://app.asana.com/0/1132189118126148/1201669631215226
 *  Description: This schema change will add empty photos array. To all organizations
 *  where control panel is expecting a photos array
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

var mongoose = require('../src/mongoose');

if (process.env.MIGRATION) {
	runMigrationScript();
}

if (process.env.ROLLBACK) {
	runRollbackScript();
}

//Scripts
function runMigrationScript() {
	mongoose.Organization.updateMany(
		{photos: {$exists: false}},
		{
			$set: {
				photos: []
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
		{photos: []},
		{
			$unset: {
				photos: ''
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
