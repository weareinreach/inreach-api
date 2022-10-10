/**********************************************************************************
  *  Release 2022-10-01
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
var organizations = require('./allOrganizations.json');
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
var orgs = [];
var keepService = [];
var removeService = [];

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
			{
				$project: {
					service_id: '$services._id',
					properties: '$services.properties',
					org_property: '$properties.community-asylum-seeker'
				}
			}
		]);

		let bulkOperations = [];
		let updateOne = {};

		result.forEach((org) => {
			let orgRemove = true;
			for (let index in org.service_id) {
				if (keepService.includes(org.service_id[index].toString())) {
					orgRemove = false;
					if (org.properties[index]['community-asylum-seeker'] === 'true') {
						keepService.splice(
							keepService.indexOf(org.service_id[index].toString()),
							1
						);
					}
					updateOne = {
						filter: {
							_id: org._id,
							'services._id': org.service_id[index]
						},
						update: {
							$set: {
								'services.$.properties.community-asylum-seeker': 'true'
							}
						}
					};
				} else if (removeService.includes(org.service_id[index].toString())) {
					if (
						org.properties[index] &&
						(!('community-asylum-seeker' in org.properties[index]) ||
							org.properties[index]['community-asylum-seeker'] === '')
					) {
						removeService.splice(
							removeService.indexOf(org.service_id[index].toString()),
							1
						);
					}
					updateOne = {
						filter: {
							_id: org._id,
							'services._id': org.service_id[index]
						},
						update: {
							$unset: {
								'services.$.properties.community-asylum-seeker': ''
							}
						}
					};
				} else if (
					org.properties[index] &&
					'community-asylum-seeker' in org.properties[index] &&
					org.properties[index]['community-asylum-seeker'] === 'true'
				) {
					orgRemove = false;
				}
				bulkOperations.push({
					updateOne
				});
			}

			if (orgRemove) {
				orgs.push({org: org._id, service: 'keep me'});
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
				bulkOperations.push({
					updateOne
				});
			}
		});

		for (let i in organizations) {
			if (
				removeService.includes(organizations[i].service) ||
				keepService.includes(organizations[i].service) ||
				organizations[i].service === 'keep me'
			) {
				orgs.push({
					org: organizations[i].org,
					service: organizations[i].service
				});
			}
		}

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

// Rollback Script
async function runRollbackScript() {
	var organizationsRollback = require('./rollbackOrganizations.json');
	var keep = require('./rollbackKeep.json');
	var remove = require('./rollbackRemove.json');

	for (let i in organizationsRollback) {
		if ([keep, remove, 'keep me'].includes(organizationsRollback[i].service)) {
			orgs.push(new ObjectID.createFromHexString(organizationsRollback[i].org));
		}
	}

	try {
		const result = await mongoose.Organization.aggregate([
			{
				$unwind: {
					path: '$organizations',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$match: {
					_id: {$in: orgs}
				}
			},
			{
				$project: {
					service_id: '$services._id',
					properties: '$services.properties',
					org_property: '$properties.community-asylum-seeker'
				}
			}
		]);

		let bulkOperations = [];
		let updateOne = {};
		result.forEach((org) => {
			let id = org._id.toString();
			for (let index in org.service_id) {
				if (keep.includes(org.service_id[index].toString())) {
					updateOne = {
						filter: {
							_id: org._id,
							'services._id': org.service_id[index]
						},
						update: {
							$unset: {
								'services.$.properties.community-asylum-seeker': ''
							}
						}
					};
					bulkOperations.push({
						updateOne
					});
				} else if (
					remove.includes(org.service_id[index].toString()) ||
					organizationsRollback.find(
						(org) => org['service'] === 'keep me' && org['org'] === id
					)
				) {
					updateOne = {
						filter: {
							_id: org._id
						},
						update: {
							$set: {
								'properties.community-asylum-seeker': 'true'
							}
						}
					};
					bulkOperations.push({
						updateOne
					});

					if (remove.includes(org.service_id[index].toString())) {
						updateOne = {
							filter: {
								_id: org._id,
								'services._id': org.service_id[index]
							},
							update: {
								$set: {
									'services.$.properties.community-asylum-seeker': 'true'
								}
							}
						};
						bulkOperations.push({
							updateOne
						});
					}
				}
			}
		});

		const updateResponse = await mongoose.Organization.bulkWrite(
			bulkOperations
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
					runRollbackScript();
				}
			});
			break;
		default:
			runRollbackScript();
			break;
	}
}
