import {User} from '../mongoose';
import {handleBadRequest, handleErr, handleNotFound} from '../utils';
import {createReleaseInRepo} from '../utils/github';
//OAuth Callback
export const oauthCallback = async (req, res) => {};

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
		return res.json({created: true, result: result});
	} catch (err) {
		handleErr(err, res);
	}
};

//Get Hall of fame

//clean merged branches
