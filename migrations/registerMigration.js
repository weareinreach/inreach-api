/* eslint-disable no-console */
require('babel-register')({
	presets: ['env']
});

// Import .env file
//Replace .env with a {.env-prod} file with DB_URI env var pointing to Prod
require('dotenv').config({
	path: '.env'
});

const MIGRATION_STAGE = 'migration_stage';
const MIGRATION_PROD = 'migration_prod';

var migrationFunctions = require('./migrationsFunctions');

switch (process.env.TYPE) {
	case MIGRATION_PROD:
		migrationFunctions.registerMigrationProd();
		break;
	case MIGRATION_STAGE:
		migrationFunctions.registerMigrationStage();
		break;
}
