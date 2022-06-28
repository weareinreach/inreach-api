import {Octokit} from '@octokit/rest';
const OWNER = 'asylum-connect';

export const githubClient = async () => {
	return new Octokit({
		auth: process.env.TOKEN,
		log: console
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
