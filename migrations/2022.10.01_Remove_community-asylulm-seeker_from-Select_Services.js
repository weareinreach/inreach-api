/**********************************************************************************
  *  Release 2022-10-11
  *  Issue:  https://app.asana.com/0/1202317426899416/1202920064990508
  *  This migration uses two provided .json files:
  *  1. services-keep-property.json to identify the organizations that should keep the 
  *  "commuinity-asylum-seeker" property and updates those that do not have the property.
  *  
  *  2. services-remove-property.json to identify the services that need the 
  *  "community-asylum-seeker" property removed, and if the associated organization
  *  has no services that do have the property, the organization itself will have
  *  this property removed from it as well.
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
var servicesRemove = require('./services-remove-property.json');
var servicesKeep = require('./services-keep-property.json');
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const path = require('path');
var orgs = [];
var keepService = [];
var removeService = [];
const changelog = {
	metadata: {},
	changes: []
};
/**
 * Appends to the changelog.
 * @param {Object} filter - Key value pair(s) used as the record filter
 * @param {Object} from - Original value(s) of record
 * @param {Object} to - New value(s) of record
 */
const addChange = (filter, from, to) => {
	changelog.changes.push({
		filter,
		from,
		to
	});
};

//Scripts
async function runMigrationScript() {
	for (let i in servicesRemove) {
		removeService.push(servicesRemove[i].id);
	}
	for (let i in servicesKeep) {
		keepService.push(servicesKeep[i].id);
	}

	try {
		const result = await mongoose.Organization.aggregate([
			{
				$unwind: {
					path: '$organizations',
					preserveNullAndEmptyArrays: true
				}
			},
			/** There is no match query here so that organizations that do not have services that are specified to
			 * be either removed or kept are also checked so that if there are organizations which do not have services
			 * with the 'community-asylum-seeker' property will have their 'community-asylum-seeker' organization
			 * property removed
			 * */
			// {
			// 	$project: {
			// 		service_id: '$services._id',
			// 		properties: '$services.properties',
			// 		org_property: '$properties.community-asylum-seeker'
			// 	}
			// }

			/** Unwinding the services and then regrouping them makes the data easier to work with.
			 *
			 * The data structure becomes
			 * 	{
			 * 		_id: org id
			 * 		services: {
			 * 			_id: service id
			 * 			community-asylum-seeker: value - null if property not set
			 * 		}
			 * 		org_property: org level community-asylum-seeker value
			 * 	}
			 *
			 * The initial verision was trying to index two separate arrays in tandem, but would fail
			 * if the 'community-asylum-seeker' was missing in the 'properties' array.
			 *
			 * Example: an organization could have returned 5 results, but properties could have returned 4.
			 *		If org #2 was missing the community-asylum-seeker property, it would appear that org #5
			 * 		was missing the property.
			 *
			 */
			{
				$unwind: {
					path: '$services',
					includeArrayIndex: 'string',
					preserveNullAndEmptyArrays: false
				}
			},
			{
				$group: {
					_id: '$_id',
					services: {
						$push: {
							_id: '$services._id',
							'community-asylum-seeker': {
								$ifNull: ['$services.properties.community-asylum-seeker', null]
							}
						}
					},
					org_property: {
						$first: '$properties.community-asylum-seeker'
					}
				}
			}
		]);

		let bulkOperations = [];
		let updateOne = {};
		console.log(result.length);
		result.forEach((org) => {
			let orgRemove = org.org_property;
			let orgPush = true;
			for (let index in org.services) {
				if (keepService.includes(org.services[index]._id.toString())) {
					orgRemove = false;
					/** if the property already has the 'true' condition, then it is removed from the keepService array
					 * so that it is not removed in the consequent rollback
					 */
					if (org.services[index]['community-asylum-seeker'] === 'true') {
						keepService.splice(
							keepService.indexOf(org.services[index]._id.toString()),
							1
						);
					} else {
						updateOne = {
							filter: {
								_id: org._id,
								'services._id': org.services[index]._id
							},
							update: {
								$set: {
									'services.$.properties.community-asylum-seeker': 'true'
								}
							}
						};
						addChange(
							{
								_id: org._id,
								'services._id': org.services[index]._id
							},
							{
								'services.$.properties.community-asylum-seeker': null
							},
							{
								$set: {
									'services.$.properties.community-asylum-seeker': 'true'
								}
							}
						);
						bulkOperations.push({
							updateOne
						});
						/** this pushes the organization to the orgs array only once so that only the organizations
						 * that have undergone changes will be queried in the rollback
						 */
						if (orgPush) {
							orgPush = false;
							orgs.push({
								org: org._id.toString(),
								service: org.services[index]._id.toString(),
								org_status: org.org_property
							});
						}
					}
				} else if (removeService.includes(org.services[index]._id.toString())) {
					/** if the property already does not exist or has the condition set to an empty string,
					 * then it is removed from the removeService array so that it is added back in the
					 * consequent rollback
					 */
					if (
						!org.services[index]['community-asylum-seeker'] ||
						org.services[index]['community-asylum-seeker'] === ''
					) {
						removeService.splice(
							removeService.indexOf(org.services[index]._id.toString()),
							1
						);
					} else {
						updateOne = {
							filter: {
								_id: org._id,
								'services._id': org.services[index]._id
							},
							update: {
								$unset: {
									'services.$.properties.community-asylum-seeker': ''
								}
							}
						};
						addChange(
							{
								_id: org._id,
								'services._id': org.services[index]._id
							},
							{
								'services.$.properties.community-asylum-seeker':
									org.services[index]['community-asylum-seeker']
							},
							{
								$unset: {
									'services.$.properties.community-asylum-seeker': ''
								}
							}
						);
						bulkOperations.push({
							updateOne
						});
						/** this pushes the organization to the orgs array only once so that only the organizations
						 * that have undergone changes will be queried in the rollback
						 */
						if (orgPush) {
							orgPush = false;
							orgs.push({
								org: org._id.toString(),
								service: org.services[index]._id.toString(),
								org_status: org.org_property
							});
						}
					}
					/** this final branch of this if/else statement tests for services not specified to be
					 * removed or added to see if any of the services have the 'community-asylum-seeker' property
					 * so that it can be deteremined whether or not the parent organization property should be
					 * removed
					 */
				} else if (org.services[index]['community-asylum-seeker'] === 'true') {
					orgRemove = false;
				}
			}

			/** if the organization does not have any services which contain the 'community-asylum-seeker' service
			 * property and the organization is not already lacking the 'community-asylum-seeker' organization
			 * property, then the organization property will be removed
			 */
			if (orgRemove) {
				/** this adds the organization to the orgs array so that it can be accounted for in the rollback to
				 * have it's 'community-asylum-seeker' organization property reinstated
				 */
				if (orgPush) {
					orgs.push({
						org: org._id,
						org_status: org.org_property
					});
				}
				updateOne = {
					filter: {
						_id: org._id
					},
					update: {
						$unset: {
							'properties.community-asylum-seeker': ''
						}
					}
				};
				addChange(
					{
						_id: org._id
					},
					{
						'properties.community-asylum-seeker': org.org_property
					},
					{
						$unset: {
							'properties.community-asylum-seeker': ''
						}
					}
				);
				bulkOperations.push({
					updateOne
				});
			}
		});

		fs.writeFile(
			'./migrations/rollbackOrganizations.json',
			JSON.stringify(orgs),
			(error) => {
				if (error) throw error;
			}
		);

		fs.writeFile(
			'./migrations/rollbackKeep.json',
			JSON.stringify(keepService),
			(error) => {
				if (error) throw error;
			}
		);

		fs.writeFile(
			'./migrations/rollbackRemove.json',
			JSON.stringify(removeService),
			(error) => {
				if (error) throw error;
			}
		);
		const updateResponse = await mongoose.Organization.bulkWrite(
			bulkOperations
		);

		const currTime = new Date();
		changelog.metadata = {
			time: currTime.toString(),
			result: updateResponse.nModified,
			changelogLength: changelog.changes.length,
			migrationFile: path.basename(__filename)
		};

		fs.writeFileSync(
			`./migrations/changelogs/migration-${path
				.basename(__filename)
				.replace('.js', '.json')}`,
			JSON.stringify(changelog, null, 2),
			(error) => {
				if (error) throw error;
			}
		);
		console.log(
			`Number of modified rows: ${JSON.stringify(updateResponse.nModified)}`
		);
		console.log(
			'Migration to remove and add the "community-asylum-seeker" property from specified services and resultant organizations complete'
		);

		process.exit(0);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
}

// Rollback Script - revised
/**
 * It reads the migration changelog, parses it, and then uses the data to perform a bulkWrite operation on
 * the database
 */
async function rollback() {
	try {
		/* Load changelog, parse as JSON */
		const transactions = JSON.parse(
			fs.readFileSync(
				`./migrations/changelogs/migration-${path
					.basename(__filename)
					.replace('.js', '.json')}`,
				'utf8'
			)
		);

		/**
		 * > It returns true if the string is a hexadecimal number, otherwise it returns false
		 * @param {string} str - The string to be tested.
		 * @returns {boolean} The function isHex is being returned.
		 */
		const isHex = (str) => {
			const regexp = /^[0-9a-fA-F]+$/;
			return regexp.test(str) ? true : false;
		};

		/* Value is the opposite action of the key */
		const undo = {
			$set: '$unset',
			$unset: '$set'
		};

		const bulkOperations = transactions.changes.map((item) => {
			/* Look for hex values in the filters, convert to ObjectID if found */

			for (const [key, value] of Object.entries(item.filter)) {
				item.filter[key] = isHex(value)
					? new ObjectID.createFromHexString(value)
					: value;
			}

			const update = {};

			/* Loop through the actions , prepping to do the opposite. */
			for (const [key, value] of Object.entries(item.to)) {
				const action = undo[key];
				update[action] = {};

				/* Loop through items in the "to" block, setting their value to the corresponding key from the "from" block */

				for (const [subkey, subval] of Object.entries(value)) {
					update[action][subkey] =
						item.from[subkey] === null ? '' : item.from[subkey];
				}
			}
			return {
				updateOne: {
					filter: item.filter,
					update
				}
			};
		});
		const updateResponse = await mongoose.Organization.bulkWrite(
			bulkOperations
		);

		const currTime = new Date();
		changelog.metadata = {
			time: currTime.toString(),
			result: updateResponse.nModified,
			changelogLength: changelog.changes.length,
			migrationFile: path.basename(__filename)
		};
		fs.writeFileSync(
			`./migrations/changelogs/rollback-${path
				.basename(__filename)
				.replace('.js', '.json')}`,
			JSON.stringify(changelog, null, 2),
			(error) => {
				if (error) throw error;
			}
		);
		console.log(
			`Number of modified rows: ${JSON.stringify(updateResponse.nModified)}`
		);
		console.log(
			'Rollback to reinstate and take away the "community-asylum-seeker" service and organization property from the services and organizatons affected by the migration'
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
					rollback();
				}
			});
			break;
		default:
			rollback();
			break;
	}
}
