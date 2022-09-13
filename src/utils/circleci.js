import axios from 'axios';
const PIPELINE_URL =
	'https://circleci.com/api/v2/project/gh/weareinreach/inreach-api/pipeline';
const CIRCLECI_TOKEN = process.env.PERSONAL_TOKEN;

export const runCircleCIPostCommand = async (body) => {
	const headers = {
		'Circle-Token': CIRCLECI_TOKEN,
		'Content-Type': 'application/json'
	};
	return axios.post(PIPELINE_URL, body, {headers});
};
