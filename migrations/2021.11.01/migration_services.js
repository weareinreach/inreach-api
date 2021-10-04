/**********************************************************************************
 *  Release 2021-11-01
 *  Issue:  https://app.asana.com/0/1132189118126148/1176142788936875
 *  Description: This schema change will add is_deleted: false to all 
 *               organizations services. When an organization service 
 *               is soft deleted by a data manager it will not show up 
 *              on General Org/Services queries
 * ********************************************************************************
 


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

//Script
mongoose.Organization.updateMany(
	{},
	{$set: {'services.$[].is_deleted': false}},
	{arrayFilters: []}
)
	.then((result) => {
		console.log('Number of modified rows ' + result.nModified);
		console.log('Migration executed');
		process.exit();
	})
	.catch((error) => {
		console.log('Error applying the migration. Failed with error: ' + error);
		process.exit();
	});

//Rollback Script
// mongoose.Organization.updateMany(
//     {},
//     { $unset: { "services.$[].is_deleted" : "" } },
//     {arrayFilters:[]}
// ).then((result)=>{
//     console.log("Number of modified rows "+ result.nModified);
//     console.log("Rollback executed");
//     process.exit();
// }).catch(error=>{
//     console.log("Error applying the rollback script. Failed with error: "+ error);
//     process.exit();
// });
