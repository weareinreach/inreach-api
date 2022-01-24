require('babel-register')({
	presets: ['env']
});
require('regenerator-runtime/runtime');
require('dotenv').config({
	path: '.env'
});

const reportFuntions = require('./reportFunctions');
const mongoose = require('../../src/mongoose');
const usa_states = require('../resources/usa_states.json');
const mexico_states = require('../resources/mexico_states.json');
const canada_states = require('../resources/canada_states.json');
const csvHeaders = [
	{id: 'state', title: 'State'},
	{id: 'count', title: 'Count'}
];

async function generateReportNational() {
	let usa_data_orgs = await reportFuntions.getServiceNationalOrgs(
		usa_states,
		mongoose.Organization,
		'united_states',
		[]
	);
	let usa_data_services = await reportFuntions.getServiceNationalServices(
		usa_states,
		mongoose.Organization,
		'united_states',
		[]
	);
	let mexico_data_orgs = await reportFuntions.getServiceNationalOrgs(
		mexico_states,
		mongoose.Organization,
		'mexico',
		[]
	);
	let mexico_data_services = await reportFuntions.getServiceNationalServices(
		mexico_states,
		mongoose.Organization,
		'mexico',
		[]
	);
	let canada_data_orgs = await reportFuntions.getServiceNationalOrgs(
		canada_states,
		mongoose.Organization,
		'canada',
		[]
	);
	let canada_data_services = await reportFuntions.getServiceNationalServices(
		canada_states,
		mongoose.Organization,
		'canada',
		[]
	);

	//Write Reports
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'usa_orgs_national.csv',
		usa_data_orgs
	);
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'usa_services_national.csv',
		usa_data_services
	);
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'mexico_orgs_national.csv',
		mexico_data_orgs
	);
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'mexico_services_national.csv',
		mexico_data_services
	);
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'canada_orgs_national.csv',
		canada_data_orgs
	);
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'canada_services_national.csv',
		canada_data_services
	);
	console.log('Finished generating report...');
	process.exit(0);
}

//Reports Invocation
generateReportNational();
