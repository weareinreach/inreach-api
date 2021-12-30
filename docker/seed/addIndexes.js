/*******************************************************************
 *  This document will keep track of all indexes
 *  that are added via migrations, to be executed in docker
 * ******************************************************************/

//
require('babel-register')({
	presets: ['env']
});
const mongoose = require('../../src/mongoose');
const seedFunctions = require('./generateSeedFunction');

//Compound Indexes
const organizationsAddedIndexes = [{name: 'text'}];

//Organization Indexes
seedFunctions.createIndex(
	'Organization',
	mongoose.Organization,
	organizationsAddedIndexes
);
