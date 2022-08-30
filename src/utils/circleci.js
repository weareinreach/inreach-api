import axios from 'axios';
const PIPELINE_URL =
	'https://circleci.com/api/v2/project/gh/asylum-connect/inreach-api/pipeline';
const CIRCLECI_TOKEN = process.env.PERSONAL_TOKEN;

export const runStagingMigration = async (body) => {
	const headers = {
		'Circle-Token': CIRCLECI_TOKEN,
		'Content-Type': 'application/json'
	};
	return axios.post(PIPELINE_URL, body, {headers});
};

export const runProductionMigration = async (body) => {
	const headers = {
		'Circle-Token': CIRCLECI_TOKEN,
		'Content-Type': 'application/json'
	};
	return axios.post(PIPELINE_URL, body, {headers});
};
