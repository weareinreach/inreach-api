/**********************************************************************************
  *  Release 2022-10-01
  *  Issue:  https://app.asana.com/0/1202317426899416/1202941078104394
  *  Replace the existing services with the "Trans Health" tag with:
  *  Trans Health - Primary Care
  *  Trans Health - Hormone
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
var migrationFunctions = require('./migrationsFunctions');
var mongoose = require('../src/mongoose');

let renameKeys = (keysMap, object) =>
	Object.keys(object).reduce(
		(acc, key) => ({
			...acc,
			...{
				[keysMap[key] || key]: object[key]
			}
		}),
		{}
	);

//Scripts
async function runMigrationScript() {
	try {
		const result = await mongoose.Organization.aggregate([
			{
				$unwind: {
					path: '$services',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$match: {
					'services.tags.united_states.Medical.Trans health': {
						$exists: true
					}
				}
			},
			{
				$project: {
					service_id: '$services._id',
					tags: '$services.tags.united_states.Medical'
				}
			}
		]);
		let bulkOperations = [];
		let updateOne = {};
		result.forEach((org) => {
			let updatedTags = renameKeys(
				{
					'Trans health': 'Trans Health - Primary Care'
				},
				org.tags
			);
			// The operations for creating a new tag and renaming tags had to be pushed to bulkOperations
			// separately as well as done in the order of having the rename be done first, then the
			// addition of the new tag. Other seamingly simpler and less redundant versions of this operation
			// failed to work properly and only resulted in errors within the database.
			updateOne = {
				filter: {
					_id: org._id
				},
				update: {
					'services.$[elem].tags.united_states.Medical': updatedTags
				},
				arrayFilters: [{'elem._id': {$eq: org.service_id}}]
			};
			bulkOperations.push({
				updateOne
			});

			updateOne = {
				filter: {
					_id: org._id
				},
				update: {
					$set: {
						'services.$[elem].tags.united_states.Medical.Trans Health - Hormone Therapy':
							'true'
					}
				},
				arrayFilters: [{'elem._id': {$eq: org.service_id}}]
			};
			bulkOperations.push({
				updateOne
			});
		});

		const updateResponse = await mongoose.Organization.bulkWrite(
			bulkOperations
		);

		console.log(
			`Number of modified rows: ${JSON.stringify(updateResponse.nModified)}`
		);
		console.log(
			'Migration to add the "Trans Health - Hormone Therapy" tag and rename "Trans health" to "Trans Health - Primary Care" complete'
		);
		process.exit(0);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
}

// Rollback Script
async function runRollbackScript() {
	try {
		const result = await mongoose.Organization.aggregate([
			{
				$unwind: {
					path: '$services',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$match: {
					$and: [
						{
							'services.tags.united_states.Medical.Trans Health - Primary Care':
								'true'
						},
						{
							'services.tags.united_states.Medical.Trans Health - Hormone Therapy':
								'true'
						}
					]
				}
			},
			{
				$project: {
					service_id: '$services._id',
					tags: '$services.tags.united_states.Medical'
				}
			}
		]);
		let bulkOperations = [];
		let updateOne = {};
		result.forEach((org) => {
			let updatedTags = renameKeys(
				{
					'Trans Health - Primary Care': 'Trans health'
				},
				org.tags
			);

			// The same problem as the migration appears here in the rollback where the removal of a tag
			// had to be done separately and after the renaming of a tag or else equivalent errors would
			// occur
			updateOne = {
				filter: {
					_id: org._id
				},
				update: {
					'services.$[elem].tags.united_states.Medical': updatedTags
				},
				arrayFilters: [{'elem._id': {$eq: org.service_id}}]
			};

			bulkOperations.push({
				updateOne
			});

			updateOne = {
				filter: {
					_id: org._id
				},
				update: {
					$unset: {
						'services.$[elem].tags.united_states.Medical.Trans Health - Hormone Therapy':
							''
					}
				},
				arrayFilters: [{'elem._id': {$eq: org.service_id}}]
			};
			bulkOperations.push({
				updateOne
			});
		});

		const updateResponse = await mongoose.Organization.bulkWrite(
			bulkOperations
		);

		console.log(
			`Number of modified rows: ${JSON.stringify(updateResponse.nModified)}`
		);
		console.log(
			'Rollback to remove the "Trans Health - Hormone Therapy" tag and rename "Trans Health - Primary Care" to "Trans health" complete'
		);
		process.exit(0);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
}

if (process.env.MIGRATION) {
	switch (process.env.PROFILE) {
		case 'CI':
			migrationFunctions.checkIfMigrationHasRun().then((hasRun) => {
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
			migrationFunctions.checkIfMigrationHasRun().then((hasRun) => {
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
