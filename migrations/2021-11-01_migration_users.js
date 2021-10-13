/*******************************************************************
 *  Release 2021-11-01
 *  Issue:  https://app.asana.com/0/1200689352502326/1201008564404725
 *  Description: This schema change will update 4 fields 
 *              in the users db.
 *
 *              Updated fields:
 *              homeLocation -> countryOfOrigin
 *              identityPrimary -> sogIdentity
 *              identitySupplimental -> immigrationStatus
 *              orgAreaOfWork -> orgType
 * ******************************************************************



/* eslint-disable no-console */
require('babel-register')({
	presets: ['env']
});

// Import .env file
//Replace .env with a {.env-prod} file with DB_URI env var pointing to Prod
require('dotenv').config({path: '.env'});
// Import DB Connection
require('../../src/db');

var mongoose = require('../../src/mongoose');

console.log('Updating users, changing the name of these fields: ');
console.log('FROM -> TO');
console.log('homeLocation -> countryOfOrigin');
console.log('identityPrimary -> sogIdentity');
console.log('identitySupplimental -> immigrationStatus');
console.log('orgAreaOfWork -> orgType');

//use this to update existing documents
db.collection('users').updateMany(
	{},
	{$rename: {homeLocation: 'countryOfOrigin'}}
);
db.collection('users').updateMany(
	{},
	{$rename: {identityPrimary: 'sogIdentity'}}
);
db.collection('users').updateMany(
	{},
	{$rename: {identitySupplimental: 'immigrationStatus'}}
);
db.collection('users').updateMany({}, {$rename: {orgAreaOfWork: 'orgType'}});

//use this to revert the update to existing documents
//db.collection('users').updateMany({}, {$rename: {"countryOfOrigin": "homeLocation"}});
//db.collection('users').updateMany({}, {$rename: {"sogIdentity": "identityPrimary"}});
//db.collection('users').updateMany({}, {$rename: {"immigrationStatus": "identitySupplimental"}});
//db.collection('users').updateMany({}, {$rename: {"orgType": "orgAreaOfWork"}});
