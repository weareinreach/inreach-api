import faker from 'faker';
import mongoose from 'mongoose';
/* eslint-disable no-console */
require('babel-register')({
	presets: ['env']
});

// Import .env file
require('dotenv').config({
	path: '.env'
});
//Static variables
const BACKUP_PATH = 'backup/inreach';
const PROD = 'PROD';
const STAGING = 'STAGING';
const LOCAL = 'LOCAL';
const STAGING_DB_NAME = 'heroku_tn9l3cc3';
const PROD_DB_NAME = 'heroku_52km7d5h';
//Update your Local DB name here
const LOCAL_DB_NAME = '';

const {MongoTools} = require('node-mongotools');
const mongoTools = new MongoTools();
const mongooseSchemas = require('../src/mongoose');

//Connect to DB
const connectDB = (uri) => {
	mongoose.connect(uri, {
		useFindAndModify: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true
	});

	mongoose.connection.once('open', () => {
		console.log('Connected to MongoDB');
	});
};

//Backup
export const backUpDatabase = async (options) => {
	return mongoTools
		.mongodump(options)
		.then((success) => {
			console.log(
				`Backup finished with status ${success.status}, with filename: ${success.fileName} at location: ${success.fullFileName}`
			);
			console.log('\n');
			console.log(`Here is the output: \n ${success.stderr}`);
			console.log(`proceeding...`);
			//Return backup file name and path to be used
			return success.fullFileName;
		})
		.catch((err) => {
			console.error('Failed to backup DB', err);
		});
};

export const restoreDatabase = async (options) => {
	return mongoTools
		.mongorestore(options)
		.then((success) => {
			console.log('Restore completed');
			console.log(success);
			return success;
		})
		.catch((err) => {
			console.error('Failed to restore DB', err);
		});
};

export const createSourceOptionsObject = (env) => {
	return {
		uri: env == PROD ? process.env.DB_URI_PROD : process.env.DB_URI_STAGING,
		path: BACKUP_PATH
	};
};

export const createTargetOptionsObject = (file, env) => {
	const DB_CONNECTION =
		env == STAGING ? process.env.DB_URI_STAGING : process.env.DB_URI_LOCAL;
	const OPTIONS =
		env == STAGING
			? `--nsFrom "${PROD_DB_NAME}.*" --nsTo "${STAGING_DB_NAME}.*"`
			: `--nsFrom "${STAGING_DB_NAME}.*" --nsTo "${LOCAL_DB_NAME}.*"`;
	return {
		dumpFile: file,
		uri: `${DB_CONNECTION} ${OPTIONS}`,
		dropBeforeRestore: true,
		deleteDumpAfterRestore: true,
		showCommand: true
	};
};

export const maskCollection = async (env, maskingOptions) => {
	//Connect to DB
	connectDB(
		env == STAGING ? process.env.DB_URI_STAGING : process.env.DB_URI_LOCAL
	);

	console.log(`Beginning masking for ${maskingOptions.schema}`);
	try {
		let bulkOperations = [];
		const collection = await mongooseSchemas[`${maskingOptions.schema}`].find(
			{}
		);
		//Masking
		collection.forEach((item) => {
			bulkOperations.push({
				updateOne: {
					filter: {
						_id: item._id
					},
					update: maskingOptions.masking
				}
			});
		});
		//Bulk update
		const updateResponse = await mongooseSchemas[
			`${maskingOptions.schema}`
		].bulkWrite(bulkOperations);
		console.log(
			`Number of modified rows: ${JSON.stringify(updateResponse.nModified)}`
		);
		console.log(`Finished masking for schema ${maskingOptions.schema}`);
		process.exit(0);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
};

export const getMaskingOptions = (schema) => {
	switch (schema) {
		case 'User':
			return {
				schema: 'User',
				masking: {
					name: faker.name.findName(),
					email: faker.internet.email(),
					currentLocation: faker.address.streetAddress(),
					age: faker.datatype.number(99)
				}
			};
		default:
			throw `${schema} is not a supported masking option`;
	}
};
