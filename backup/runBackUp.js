require('babel-register')({
	presets: ['env']
});
require('regenerator-runtime/runtime');
require('dotenv').config({
	path: '.env'
});
var backUpFunctions = require('./helperFunctions');

//if PROD TO STAGING
async function runProdToStagingBackup() {
	console.info(`Running backup for ${backUpFunctions.PROD}`);
	var backupOptions = backUpFunctions.createSourceOptionsObject(
		backUpFunctions.PROD
	);
	var filePath = await backUpFunctions.backUpDatabase(backupOptions);
	var restoreOptions = backUpFunctions.createTargetOptionsObject(
		filePath,
		backUpFunctions.STAGING
	);
	console.info(`Running restore for ${backUpFunctions.STAGING}`);

	await backUpFunctions.restoreDatabase(restoreOptions);
	//Mask Data
	console.info(`Running data masking for ${backUpFunctions.STAGING}`);

	await backUpFunctions.maskCollection(
		backUpFunctions.STAGING,
		backUpFunctions.getMaskingOptions('User')
	);
	console.info('Done!');
}

//if STAGING TO LOCAL
async function runStagingToLocalBackup() {
	console.info(`Running backup for ${backUpFunctions.STAGING}`);
	var backupOptions = backUpFunctions.createSourceOptionsObject(
		backUpFunctions.STAGING
	);
	var filePath = await backUpFunctions.backUpDatabase(backupOptions);

	var restoreOptions = backUpFunctions.createTargetOptionsObject(
		filePath,
		backUpFunctions.LOCAL
	);
	console.info(`Running restore for ${backUpFunctions.LOCAL}`);
	await backUpFunctions.restoreDatabase(restoreOptions);
	console.info('Done!');
}

if (process.env.PROD_TO_STAGING) {
	console.info('Backing up PROD to STAGING');
	runProdToStagingBackup();
}

if (process.env.STAGING_TO_LOCAL) {
	console.info('Backing up STAGING to LOCAL');
	runStagingToLocalBackup();
}
