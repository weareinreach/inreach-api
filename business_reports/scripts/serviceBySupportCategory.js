require('babel-register')({
	presets: ['env']
});
require('regenerator-runtime/runtime');
require('dotenv').config({
	path: '.env'
});

const reportFuntions = require('./reportFunctions');
const mongoose = require('../../src/mongoose');
const usa_categories = require('../resources/usa_categories.json');
const mexico_categories = require('../resources/mexico_categories.json');
const canada_categories = require('../resources/canada_categories.json');

const csvHeaders = [
	{id: 'category', title: 'Category'},
	{id: 'count', title: 'Count'}
];

async function generateServiceBySupportCategoryReport() {
	let usa_data = await reportFuntions.getServiceBySupportCategory(
		usa_categories,
		mongoose.Organization,
		'united_states',
		[]
	);
	let mexico_data = await reportFuntions.getServiceBySupportCategory(
		mexico_categories,
		mongoose.Organization,
		'mexico',
		[]
	);
	let canada_data = await reportFuntions.getServiceBySupportCategory(
		canada_categories,
		mongoose.Organization,
		'canada',
		[]
	);

	//Write Reports
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'usa_category_services.csv',
		usa_data
	);
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'mexico_category_services.csv',
		mexico_data
	);
	await reportFuntions.writeFilesCsv(
		csvHeaders,
		'canada_category_services.csv',
		canada_data
	);
	console.log('Finished generating report...');
	process.exit(0);
}

//Reports Invocation
generateServiceBySupportCategoryReport();
