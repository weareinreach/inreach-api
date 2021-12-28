/**********************************************************************************
  *  Release: 2021-12-31
  *  Issue:  https://app.asana.com/0/1132189118126148/1198892993658136
  *  Description: This schema change updates the data for the geospatial
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

var schemas = require('../src/mongoose');
//Scripts
const runMigrationScript = async () => {
	try {
		const result = await schemas.Organization.aggregate([
			{
				$match: {
					$and: [
						{
							locations: {
								$ne: {
									$size: 0
								}
							}
						},
						{
							'locations.lat': {
								$ne: ''
							}
						},
						{
							'locations.long': {
								$ne: ''
							}
						},
						{
							'locations.lat': {
								$ne: null
							}
						},
						{
							'locations.long': {
								$ne: null
							}
						}
					]
				}
			},
			{
				$project: {
					org: '$$ROOT',
					locations: '$locations'
				}
			},
			{
				$unwind: {
					path: '$locations',
					preserveNullAndEmptyArrays: false
				}
			},
			{
				$set: {
					'locations.geolocation': {
						type: 'Point',
						coordinates: [
							{
								$toDecimal: {
									$trim: {
										input: '$locations.long'
									}
								}
							},
							{
								$toDecimal: {
									$trim: {
										input: '$locations.lat'
									}
								}
							}
						]
					}
				}
			},
			{
				$group: {
					_id: '$_id',
					updated_locations: {
						$addToSet: '$locations'
					},
					org: {
						$mergeObjects: '$$ROOT'
					}
				}
			},
			{
				$replaceRoot: {
					newRoot: {
						$mergeObjects: [
							'$org.org',
							{
								locations: '$updated_locations'
							}
						]
					}
				}
			}
		]);
		let bulkOperations = [];
		result.forEach((org) => {
			console.log(`${JSON.stringify(org.locations)}`);
			bulkOperations.push({
				updateOne: {filter: {_id: org._id}, update: {locations: org.locations}}
			});
		});
		const updateResponse = await schemas.Organization.bulkWrite(bulkOperations);
		console.log(`Number of modified rows: ${JSON.stringify(updateResponse)}`);
		console.log('Migration executed');
		process.exit();
	} catch (error) {
		console.log(`Error applying the migration. Failed with error:  ${error}`);
		process.exit();
	}
};

//Rollback Script
const runRollbackScript = async () => {
	try {
		console.log('Unsetting geolocation');
		await schemas.Organization.collection.updateMany(
			{},
			{$unset: {'locations.$[].geolocation': ''}}
		);
		console.log('Rollback script executed');
		process.exit();
	} catch (error) {
		console.log(`Error applying the migration. Failed with error:  ${error}`);
		process.exit();
	}
};

if (process.env.MIGRATION) {
	runMigrationScript();
}

if (process.env.ROLLBACK) {
	runRollbackScript();
}
