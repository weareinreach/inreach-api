import {Octokit} from '@octokit/rest';
const OWNER = 'asylum-connect';
import moment from 'moment';

export const githubClient = async () => {
	return new Octokit({
		auth: process.env.TOKEN,
		log: console
	});
};

export const getAllReleases = async (repo) => {
	const client = await githubClient();
	return await client.rest.repos.listReleases({
		owner: OWNER,
		repo: repo
	});
};

export const deleteBranchInRepo = async (branch, repo) => {
	const client = await githubClient();
	const ref = await client.rest.git.deleteRef({
		owner: OWNER,
		repo: repo,
		ref: `heads/${branch}`
	});
};

export const createReleaseInRepo = async (
	repo,
	releaseBranch,
	sourceBranch,
	targetBranch,
	title
) => {
	const client = await githubClient();
	//Get Ref sha from source
	const ref = await client.rest.git.getRef({
		owner: OWNER,
		repo: repo,
		ref: `heads/${sourceBranch}`
	});

	//create release branch
	const createdReleaseBranch = await client.rest.git.createRef({
		owner: OWNER,
		repo: repo,
		ref: `refs/heads/${releaseBranch}`,
		sha: ref.data.object.sha
	});
	//PR into target branch
	const createdPR = await client.rest.pulls.create({
		owner: OWNER,
		repo: repo,
		title: title,
		head: releaseBranch,
		base: targetBranch,
		draft: false
	});

	return {
		repo: repo,
		branch_url: createdReleaseBranch.data.url,
		pr_title: createdPR.data.title,
		pr_url: createdPR.data.url,
		pr_state: createdPR.data.state
	};
};

export const getReposContributors = async (repo) => {
	const client = await githubClient();
	return await client.rest.repos.listContributors({
		owner: OWNER,
		repo: repo
	});
};

export const createHallFameObject = (data) => {
	return {
		username: data.login,
		avatar_url: data.avatar_url,
		total_contributions: data.contributions,
		profile_username_url: data.html_url
	};
};

export const createReleaseObject = (data) => {
	return {
		release_name: data.name,
		release_tag: data.tag_name,
		release_description: data.body,
		release_date: moment(data.created_at).format('MM/DD/YYYY, hh:mm A'),
		release_url: data.html_url
	};
};
