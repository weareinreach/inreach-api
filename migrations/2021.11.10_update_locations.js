/**********************************************************************************
 *  Release 2021-11-10
 *  Issue:  https://app.asana.com/0/1132189118126148/1196919992002187
 *  Description: This schema change will cause locations get a new field country. 
 *  Locations that have country set to United States will be updated to use USA for
 *  normalization purposes.
 *  This field should be populated depending on current state value. Depending on 
 *  the value it will populate the value with USA, Canada or Mexico.
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
	// runRollbackScript();
}

//Script
function runMigrationScript() {
	// Variables
	const USStates = require('./data/2021.11.10_update_locations.json').us_states;
	const CanadaStates = require('./data/2021.11.10_update_locations.json')
		.canada_states;
	const MexicoStates = require('./data/2021.11.10_update_locations.json')
		.mexico_states;

	//Update all the locations that have United States to use USA
	UpdateLocationsFromUnitedStatesToUSA();

	//Update All locations with a State and No country with their respective country
	UpdateAllLocationWithStateAndNoCountry(USStates, 'USA');
	UpdateAllLocationWithStateAndNoCountry(CanadaStates, 'Canada');
	UpdateAllLocationWithStateAndNoCountry(MexicoStates, 'Mexico');

	//Update all locations that do not have country nor state
}

// //Rollback Script
// function runRollbackScript() {}

//Update all the locations that have United States to use USA
function UpdateLocationsFromUnitedStatesToUSA() {
	mongoose.Organization.updateMany(
		{
			$or: [
				{'locations.country': 'United States'},
				{'locations.country_ES': 'United States'}
			]
		},
		{
			$set: {
				'locations.country': 'USA',
				'locations.country_ES': 'USA'
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

//Update All locations with a State and No country with their respective country
function UpdateAllLocationWithStateAndNoCountry(countryArray, country) {
	mongoose.Organization.updateMany(
		{'location.state': {$in: countryArray}},
		{
			$set: {
				'location.country': country,
				'location.country_ES': country
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

//Update all locations that do not have country nor state
//Query will be updated and return less orgs once the first 2 migrations run
// Query {$or:[{'locations.state':{$eq:null}},{'locations.country':{$eq:null}}]}
