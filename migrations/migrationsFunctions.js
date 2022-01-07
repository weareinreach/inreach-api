require('babel-register')({
	presets: ['env']
});
require('regenerator-runtime/runtime');
require('dotenv').config({
	path: '.env'
});
require('../src/db');
const axios = require('axios');
const mongoose = require('../src/mongoose');
const options = {headers: {'Circle-Token': process.env.TOKEN}};

const makeGetRequest = async (url, options) => {
	try {
		const response = await axios.get(url, options);
		return response.data;
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

const createMigrationObject = (workflow, approver, approverInfo) => {
	return {
		migration_file: process.env.MIGRATION_FILE,
		pipeline_reference: `https://app.circleci.com/pipelines/github/asylum-connect/catalog-api/${workflow.items[0].pipeline_number}/workflows/${workflow.items[0].id}`,
		approver: approverInfo.name,
		migration_type: process.env.TYPE
	};
};

export const checkIfMigrationHasRun = async () => {
	return mongoose.Migration.findOne({
		migration_file: process.env.MIGRATION_FILE,
		migration_type: process.env.TYPE
	})
		.then((data) => {
			if (data === null) {
				return false;
			}
			console.log(
				`Migration found. ${data.migration_file} ran on ${data.created_at}. Please verify migration ran properly previously.`
			);
			process.exit();
		})
		.catch((err) => {
			console.log(err);
			process.exit(1);
		});
};

const saveMigration = async (migration) => {
	console.log(`Saving migration for file ${migration.migration_file}`);
	new mongoose.Migration(migration)
		.save()
		.then(() => {
			console.log('Migration saved');
			process.exit();
		})
		.catch((err) => {
			console.error(`Failed to save migration: ${err}`);
			process.exit(1);
		});
};

export const registerMigration = async () => {
	console.log('Gathering Data...');
	const workflowResponse = await makeGetRequest(
		`https://circleci.com/api/v2/pipeline/${process.env.PIPELINE_ID}/workflow`,
		options
	);
	const pipelineApproverResponse = await makeGetRequest(
		`https://circleci.com/api/v2/workflow/${workflowResponse.items[0].id}/job`,
		options
	);
	const pipelineApproverInfoResponse = await makeGetRequest(
		`https://circleci.com/api/v2/user/${pipelineApproverResponse.items[0].approved_by}`,
		options
	);
	saveMigration(
		createMigrationObject(
			workflowResponse,
			pipelineApproverResponse,
			pipelineApproverInfoResponse
		)
	);
};
