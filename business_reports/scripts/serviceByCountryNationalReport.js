require('babel-register')({
	presets: ['env']
});
require('regenerator-runtime/runtime');
require('dotenv').config({
	path: '.env'
});

const reportFunctions = require('./reportFunctions');
const mongoose = require('../../src/mongoose');
const csvHeaders = [
	{id: 'country', title: 'Country'},
	{id: 'count', title: 'Count'}
];

async function generateReportNational() {
	let usa_data_orgs = await reportFunctions.getServiceNationalOrgs(
		mongoose.Organization,
		'united-states'
	);
	let usa_data_services = await reportFunctions.getServiceNationalServices(
		mongoose.Organization,
		'united-states'
	);
	let mexico_data_orgs = await reportFunctions.getServiceNationalOrgs(
		mongoose.Organization,
		'mexico'
	);
	let mexico_data_services = await reportFunctions.getServiceNationalServices(
		mongoose.Organization,
		'mexico'
	);
	let canada_data_orgs = await reportFunctions.getServiceNationalOrgs(
		mongoose.Organization,
		'canada'
	);
	let canada_data_services = await reportFunctions.getServiceNationalServices(
		mongoose.Organization,
		'canada'
	);

	//Write Reports
	await reportFunctions.writeFilesCsv(
		csvHeaders,
		'usa_orgs_national.csv',
		usa_data_orgs
	);
	await reportFunctions.writeFilesCsv(
		csvHeaders,
		'usa_services_national.csv',
		usa_data_services
	);
	await reportFunctions.writeFilesCsv(
		csvHeaders,
		'mexico_orgs_national.csv',
		mexico_data_orgs
	);
	await reportFunctions.writeFilesCsv(
		csvHeaders,
		'mexico_services_national.csv',
		mexico_data_services
	);
	await reportFunctions.writeFilesCsv(
		csvHeaders,
		'canada_orgs_national.csv',
		canada_data_orgs
	);
	await reportFunctions.writeFilesCsv(
		csvHeaders,
		'canada_services_national.csv',
		canada_data_services
	);
	console.log('Finished generating report...');
	process.exit(0);
}

//Reports Invocation
generateReportNational();
