require('babel-register')({
	presets: ['env']
});
require('regenerator-runtime/runtime');
require('dotenv').config({
	path: '.env'
});

const axios = require('axios');
const URL =
	'https://circleci.com/api/v2/project/gh/asylum-connect/inreach-api/pipeline';
const HEADERS = {
	headers: {
		'Circle-Token': process.env.PERSONAL_TOKEN,
		'Content-Type': 'application/json'
	}
};

const BODY = {
	branch: process.env.BRANCH,
	parameters: {
		register_migration: true,
		pipeline_id: process.env.PIPELINE_ID,
		run_branch_pipeline: false,
		files: process.env.FILES
	}
};
axios.post(URL, BODY, HEADERS);
