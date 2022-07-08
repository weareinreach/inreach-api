import {User} from '../mongoose';
import {handleBadRequest, handleErr, handleNotFound} from '../utils';
import {
	createReleaseInRepo,
	deleteBranchInRepo,
	getAllReleases,
	createReleaseObject,
	getReposContributors,
	createHallFameObject
} from '../utils/github';
import {
	triggerStagingMigration,
	triggerProductionMigration
} from '../utils/circleci';

//Add dev Access

//Remove dev Access

//Create Release
export const createRelease = async (req, res) => {
	const {repos, releaseBranch, sourceBranch, targetBranch, title} = req?.body;
	if (!repos || !releaseBranch || !sourceBranch || !targetBranch || !title)
		return handleBadRequest(res);
	let result = [];
	try {
		for (const repo in repos) {
			result.push(
				await createReleaseInRepo(
					repos[repo],
					releaseBranch,
					sourceBranch,
					targetBranch,
					title
				)
			);
		}
		return res.json({created: true, data: result});
	} catch (err) {
		handleErr(err, res);
	}
};

//Delete Branch
export const deleteBranch = async (req, res) => {
	const {branch, repo} = req?.body;

	if (!branch || !repo) return handleBadRequest(res);

	try {
		await deleteBranchInRepo(branch, repo);
		return res.json({deleted: true});
	} catch (err) {
		handleErr(err, res);
	}
};

//Get Repo Releases
export const getRepoReleases = async (req, res) => {
	const {repo} = req?.params;
	if (!repo) return handleBadRequest(res);
	let counter = 0;
	try {
		let data = [];
		const result = await getAllReleases(repo);
		for (const release in result.data) {
			if (counter == 5) break;
			data.push(createReleaseObject(result.data[release]));
			counter++;
		}
		return res.json({data: data});
	} catch (err) {
		handleErr(err, res);
	}
};

//Get Hall of fame
export const getRepoContributors = async (req, res) => {
	const {repo} = req?.params;
	if (!repo) return handleBadRequest(res);
	let counter = 0;
	try {
		let data = [];
		const result = await getReposContributors(repo);
		for (const contributor in result.data) {
			if (counter == 5) break;
			data.push(createHallFameObject(result.data[contributor]));
			counter++;
		}
		return res.json({data: data});
	} catch (err) {
		handleErr(err, res);
	}
};

export const triggerStagMigration = async (req, res) => {
	const {branch, parameters} = req?.body;
	if (!branch || !parameters || branch !== 'dev') return handleBadRequest(res);
	try {
		const result = await triggerStagingMigration(req?.body);
		return res.json({message: 'Staging Migration Triggered'});
	} catch (err) {
		handleErr(err, res);
	}
};

export const triggerProdMigration = async (req, res) => {
	const {branch, parameters} = req?.body;
	if (!branch || !parameters || branch !== 'main') return handleBadRequest(res);
	try {
		const result = await triggerProdMigration(req?.body);
		return res.json({message: 'Production Migration Triggered'});
	} catch (err) {
		handleErr(err, res);
	}
};
