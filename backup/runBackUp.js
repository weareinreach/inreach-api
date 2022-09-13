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
	var backupOptions = backUpFunctions.createSourceOptionsObject(
		backUpFunctions.PROD
	);
	var filePath = await backUpFunctions.backUpDatabase(backupOptions);
	var restoreOptions = backUpFunctions.createTargetOptionsObject(
		filePath,
		backUpFunctions.LOCAL
	);
	var restore = await backUpFunctions.restoreDatabase(restoreOptions);
	//Mask Data
	backUpFunctions.maskCollection(
		backUpFunctions.STAGING,
		backUpFunctions.getMaskingOptions('User')
	);
}

//if STAGING TO LOCAL
async function runStagingToLocalBackup() {
	var backupOptions = backUpFunctions.createSourceOptionsObject(
		backUpFunctions.STAGING
	);
	var filePath = await backUpFunctions.backUpDatabase(backupOptions);
	var restoreOptions = backUpFunctions.createTargetOptionsObject(
		filePath,
		backUpFunctions.LOCAL
	);
	await backUpFunctions.restoreDatabase(restoreOptions);
}

if (process.env.PROD_TO_STAGING) {
	runProdToStagingBackup();
}

if (process.env.STAGING_TO_LOCAL) {
	runStagingToLocalBackup();
}
