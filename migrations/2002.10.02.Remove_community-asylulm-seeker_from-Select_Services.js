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
var rollbackOrgs = [];
var allOrgs = [];
var keepService = [];
var removeService = [];

//Scripts
async function runMigrationScript() {
	for (var i in servicesRemove) {
		removeService.push(servicesRemove[k].id);
	}
	for (var i in servicesKeep) {
		keepService.push(servicesKeep[j].id);
	}
	for (var i in organizations) {
		if (
			removeService.includes(organizations[i].service) ||
			keepService.includes(organizations[i].service)
		) {
			allOrgs.push({
				org: organizations[i].org,
				service: organizations[i].service
			});
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
			for (let i in org.service_id) {
				if (keepService.includes(org.service_id[i].toString())) {
					orgRemove = false;
					if (org.properties[i][key] === 'true') {
						keepService.splice(
							keepService.indexOf(org.service_id[i].toString()),
							1
						);
					}
					updateOne = {
						filter: {
							_id: org._id,
							'services._id': org.service_id[i],
							'services.properties.community-asylum-seeker': '' || null
						},
						update: {
							$set: {
								'services.$.properties.community-asylum-seeker': 'true'
							}
						}
					};
				} else if (removeService.includes(org.service_id[i].toString())) {
					if (
						!('community-asylum-seeker' in org.properties[i]) ||
						org.properties[i]['community-asylum-seeker'] === ''
					) {
						removeService.splice(
							removeService.indexOf(org.service_id[i].toString()),
							1
						);
					}
					updateOne = {
						filter: {
							_id: org._id,
							'services._id': org.service_id[i]
						},
						update: {
							$unset: {
								'services.$.properties.community-asylum-seeker': ''
							}
						}
					};
				} else if (org.properties[i] === 'true') {
					orgRemove = false;
				}
				bulkOperations.push({
					updateOne
				});
			}

			if (orgRemove) {
				allOrgs.push({org: org._id, service: org.service_id[0]});
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

		let rollbackKeep = [];
		for (let i in keepService) {
			rollbackKeep.push({
				id: keepService[i]
			});
		}

		let rollbackRemove = [];
		for (let i in removeService) {
			rollbackServices.push({
				id: removeService[i]
			});
		}

		fs.writeFile(
			'./migrations/rollbackOrganizations.json',
			JSON.stringify(allOrgs),
			(error) => {
				if (error) throw error;
			}
		);

		fs.writeFile(
			'./migrations/rollbackKeep.json',
			JSON.stringify(rollbackKeep),
			(error) => {
				if (error) throw error;
			}
		);

		fs.writeFile(
			'./migrations/rollbackRemove.json',
			JSON.stringify(rollbackRemove),
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
	var organizations = require('./rollbackOrganizations.json');
	var keep = require('./rollbackKeep.json');
	var remove = require('./rollbackRemove.json');

	for (var i in keep) {
		keepService.push(keep[i].id);
	}

	for (var i in remove) {
		removeService.push(keep[i].id);
	}

	for (var i in organizations) {
		if (
			remove.includes(organizations[i].service) ||
			keep.includes(organizations[i].service)
		) {
			rollbackOrgs.push(new ObjectID.createFromHexString(organizations[i].org));
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
					_id: {$in: rollbackOrgs}
				}
			},
			{
				$project: {
					service_id: '$services._id',
					properties: '$services.properties',
					org_property: '$properties'
				}
			}
		]);

		let bulkOperations = [];
		let updateOne = {};
		result.forEach((org) => {
			for (let i in org.service_id) {
				if (keepService.includes(org.service_id[i].toString())) {
					updateOne = {
						filter: {
							_id: org._id,
							'services._id': org.service_id[i]
						},
						update: {
							$unset: {
								'services.$.properties.community-asylum-seeker': ''
							}
						}
					};
				} else if (removeService.includes(org.service_id[i].toString())) {
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
					updateOne = {
						filter: {
							_id: org._id,
							'services._id': org.service_id[i]
						},
						update: {
							$set: {
								'services.$.properties.community-asylum-seeker': 'true'
							}
						}
					};
				}
			}
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
