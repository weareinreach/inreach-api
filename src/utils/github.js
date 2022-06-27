import {Octokit} from '@octokit/rest';
import {normalizeUnits} from 'moment';

export const githubClient = async () => {
	return new Octokit({
		auth: process.env.TOKEN,
		log: console
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
		owner: 'asylum-connect',
		repo: repo,
		ref: `heads/${sourceBranch}`
	});

	//create release branch
	const createdReleaseBranch = await client.request(
		'POST /repos/{owner}/{repo}/git/refs',
		{
			owner: 'asylum-connect',
			repo: repo,
			ref: `refs/heads/${releaseBranch}`,
			sha: ref.data.object.sha
		}
	);
	//PR into target branch
	const createdPR = await client.rest.pulls.create({
		owner: 'asylum-connect',
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
