require('babel-register')({
	presets: ['env']
});
require('regenerator-runtime/runtime');
require('dotenv').config({
	path: '.env'
});
const MIGRATION_STAGE = 'migration_stage';
const MIGRATION_PROD = 'migration_prod';
var BODY;

const axios = require('axios');
const URL =
	'https://circleci.com/api/v2/project/gh/asylum-connect/inreach-api/pipeline';
const HEADERS = {
	headers: {
		'Circle-Token': process.env.PERSONAL_TOKEN,
		'Content-Type': 'application/json'
	}
};

switch (process.env.TYPE) {
	case MIGRATION_PROD:
		BODY = {
			branch: process.env.BRANCH,
			parameters: {
				register_migration: true,
				pipeline_id: process.env.PIPELINE_ID,
				run_branch_pipeline: false,
				files: process.env.FILES,
				date_pattern: process.env.DATE_PATTERN
			}
		};
		break;
	case MIGRATION_STAGE:
		BODY = {
			branch: process.env.BRANCH,
			parameters: {
				register_migration: true,
				pipeline_id: process.env.PIPELINE_ID,
				run_branch_pipeline: false,
				files: process.env.FILES
			}
		};
		break;
}

axios.post(URL, BODY, HEADERS);
