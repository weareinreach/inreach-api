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

async function generateReportSate() {
	let usa_data_orgs = await reportFuntions.getServiceState(
		usa_states,
		mongoose.Organization,
		'united_states',
		[]
	);
	let usa_data_services = await reportFuntions.getServiceState(
		usa_states,
		mongoose.Organization,
		'united_states',
		[]
	);
	let mexico_data_orgs = await reportFuntions.getServiceState(
		mexico_states,
		mongoose.Organization,
		'mexico',
		[]
	);
	let mexico_data_services = await reportFuntions.getServiceState(
		mexico_states,
		mongoose.Organization,
		'mexico',
		[]
	);
	let canada_data_orgs = await reportFuntions.getServiceState(
		canada_states,
		mongoose.Organization,
		'canada',
		[]
	);
	let canada_data_services = await reportFuntions.getServiceState(
		canada_states,
		mongoose.Organization,
		'canada',
		[]
	);

	//Write Reports
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'usa_orgs_state.csv',
		usa_data_orgs
	);
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'usa_services_state.csv',
		usa_data_services
	);
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'mexico_orgs_state.csv',
		mexico_data_orgs
	);
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'mexico_services_state.csv',
		mexico_data_services
	);
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'canada_orgs_state.csv',
		canada_data_orgs
	);
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'canada_services_state.csv',
		canada_data_services
	);
	console.log('Finished generating report...');
	process.exit(0);
}
//Reports Invocation
generateReportSate();
