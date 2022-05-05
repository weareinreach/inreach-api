import {Organization} from '../mongoose';
import {handleBadRequest, handleErr} from '../utils';
import {
	getServiceNationalOrgs,
	getServiceNationalServices,
	getServiceStateOrgs,
	getServiceBySupportCategory,
	getServiceStateServices
} from '../utils/report';
const path = 'resources/';
import * as fs from 'fs';
import * as pathModule from 'path';
const supportedCountries = ['united-states', 'mexico', 'canada'];

const createCountryQuery = (country) => {
	let countryString = `services.tags.${country}`;
	let queryString = {};
	queryString['$and'] = [];
	let exists = {},
		not = {},
		notEqual = {};
	exists[countryString] = {$exists: true};
	not[countryString] = {$not: {$size: 0}};
	notEqual[countryString] = {$ne: {}};
	queryString['$and'].push(exists);
	queryString['$and'].push(not);
	queryString['$and'].push(notEqual);
	queryString['$and'].push({is_published: true});
	return queryString;
};
export const getVerifiedOrgsCountryCount = async (req, res) => {
	if (!req?.params?.country) return handleBadRequest(res);
	try {
		const {country} = req.params;
		let queryString = createCountryQuery(country);
		const count = await Organization.countDocuments(queryString);
		return res.json({count: count || 0});
	} catch (err) {
		handleErr(err, res);
	}
};

export const getServicesCountryCount = async (req, res) => {
	if (!req?.params?.country) return handleBadRequest(res);
	try {
		const {country} = req.params;
		let queryString = createCountryQuery(country);
		const count = await Organization.aggregate([
			{$match: queryString},
			{$unwind: '$services'},
			{$count: 'services'}
		]);
		return res.json({count: count[0].services || 0});
	} catch (err) {
		handleErr(err, res);
	}
};

export const getOrgsWithNationalServices = async (req, res) => {
	//handle empty param
	if (!req?.params?.country) return handleBadRequest(res);
	//handle non supported/malformed country
	if (!supportedCountries.includes(req?.params?.country))
		return handleBadRequest(res);
	try {
		let result = await getServiceNationalOrgs(Organization, req.params.country);
		return res.json({country: result.country, count: result.count});
	} catch (err) {
		handleErr(err, res);
	}
};

export const getServicesWithNationalServices = async (req, res) => {
	//handle empty param
	if (!req?.params?.country) return handleBadRequest(res);
	//handle non supported/malformed country
	if (!supportedCountries.includes(req?.params?.country))
		return handleBadRequest(res);
	try {
		let result = await getServiceNationalServices(
			Organization,
			req.params.country
		);
		return res.json({country: result.country, count: result.count});
	} catch (err) {
		handleErr(err, res);
	}
};

export const getOrgsByStateInCountry = async (req, res) => {
	//handle empty param
	if (!req?.params?.country) return handleBadRequest(res);
	//handle non supported/malformed country
	if (!supportedCountries.includes(req?.params?.country))
		return handleBadRequest(res);

	const reqPath = __dirname + path + `${req?.params?.country}-states.json`;
	const resolvePath = pathModule.resolve(reqPath);
	if (!resolvePath.startsWith(__dirname + path)) return handleBadRequest(res);
	const states = fs.readFileSync(resolvePath, {encoding: 'utf8', flag: 'r'});
	try {
		let result = await getServiceStateOrgs(
			states,
			Organization,
			req.params.country.replace(/-/g, '_'),
			[]
		);
		return res.json({result});
	} catch (err) {
		handleErr(err, res);
	}
};

export const getServicesByStateInCountry = async (req, res) => {
	//handle empty param
	if (!req?.params?.country) return handleBadRequest(res);
	//handle non supported/malformed country
	if (!supportedCountries.includes(req?.params?.country))
		return handleBadRequest(res);

	const reqPath = __dirname + path + `${req?.params?.country}-states.json`;
	const resolvePath = pathModule.resolve(reqPath);
	if (!resolvePath.startsWith(__dirname + path)) return handleBadRequest(res);
	const states = fs.readFileSync(resolvePath, {encoding: 'utf8', flag: 'r'});

	try {
		let result = await getServiceStateServices(
			states,
			Organization,
			req.params.country.replace(/-/g, '_'),
			[]
		);
		return res.json({result});
	} catch (err) {
		handleErr(err, res);
	}
};

export const getServicesByCategories = async (req, res) => {
	//handle empty param
	if (!req?.params?.country) return handleBadRequest(res);
	//handle non supported/malformed country
	if (!supportedCountries.includes(req?.params?.country))
		return handleBadRequest(res);
	const reqPath = __dirname + path + 'categories.json';
	const resolvePath = pathModule.resolve(reqPath);
	if (!resolvePath.startsWith(__dirname + path)) return handleBadRequest(res);
	const categories = fs.readFileSync(resolvePath, {
		encoding: 'utf8',
		flag: 'r'
	});

	try {
		let result = await getServiceBySupportCategory(
			categories,
			Organization,
			req.params.country.replace(/-/g, '_'),
			[]
		);
		return res.json({result});
	} catch (err) {
		handleErr(err, res);
	}
};
