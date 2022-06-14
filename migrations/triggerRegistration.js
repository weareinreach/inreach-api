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
	'Circle-Token': '3c3294f066ee854d0538006acef0af627d12207a',
	'Content-Type': 'application/json'
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
console.log(process.env.PERSONAL_TOKEN);
console.log('3c3294f066ee854d0538006acef0af627d12207a');
axios.post(URL, BODY, HEADERS);
