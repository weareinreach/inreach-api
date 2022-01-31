require('babel-register')({
	presets: ['env']
});
require('regenerator-runtime/runtime');
require('dotenv').config({
	path: '.env'
});

const reportFunctions = require('./reportFunctions');
const mongoose = require('../../src/mongoose');
const categories = require('../resources/categories.json');

const csvHeaders = [
	{id: 'category', title: 'Category'},
	{id: 'count', title: 'Count'}
];

async function generateServiceBySupportCategoryReport() {
	let usa_data = await reportFunctions.getServiceBySupportCategory(
		categories,
		mongoose.Organization,
		'united_states',
		[]
	);
	let mexico_data = await reportFunctions.getServiceBySupportCategory(
		categories,
		mongoose.Organization,
		'mexico',
		[]
	);
	let canada_data = await reportFunctions.getServiceBySupportCategory(
		categories,
		mongoose.Organization,
		'canada',
		[]
	);

	//Write Reports
	await reportFunctions.writeFilesCsv(
		csvHeaders,
		'usa_category_services.csv',
		usa_data
	);
	await reportFunctions.writeFilesCsv(
		csvHeaders,
		'mexico_category_services.csv',
		mexico_data
	);
	await reportFunctions.writeFilesCsv(
		csvHeaders,
		'canada_category_services.csv',
		canada_data
	);
	console.log('Finished generating report...');
	process.exit(0);
}

//Reports Invocation
generateServiceBySupportCategoryReport();
