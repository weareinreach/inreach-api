export interface Data {
	data: ApiResult[];
}

export interface ApiResult {
	results: Result[];
	query: Query;
}

interface Query {
	/** @mockType {lorem.words(5)} */
	text: string;
	parsed: Parsed;
}

interface Parsed {
	/** @mockType {random.number} */
	housenumber: string;
	/** @mockType {address.streetName} */
	street: string;
	/** @mockType {address.zipCode} */
	postcode: string;
	/** @mockType {address.city} */
	city: string;
	/** @mockType {address.state} */
	state: string;
	/** @mockType {address.country} */
	country: string;
	/** @mockType {lorem.word} */
	expected_type: string;
}

interface Result {
	/** @mockType {address.countryCode} */
	country_code: string;
	/** @mockType {address.country} */
	country: string;
	/** @mockType {address.county} */
	county?: string;
	datasource: Datasource;
	/** @mockType {address.state} */
	state?: string;
	/** @mockType {address.city} */
	city: string;
	/** @mockType {address.longitude} */
	lon: number;
	/** @mockType {address.latitude} */
	lat: number;
	/** @mockType {address.stateAbbr} */
	state_code?: string;
	/** @mockType {address.streetAddress} */
	formatted: string;
	/** @mockType {address.streetAddress} */
	address_line1: string;
	/** @mockType {address.secondaryAddress} */
	address_line2: string;
	timezone: Timezone;
	/** @mockType {random.word} */
	result_type: string;
	rank: Rank;
	/** @mockType {random.word} */
	place_id: string;
	bbox: Bbox;
}

interface Bbox {
	/** @mockType {address.longitude} */
	lon1: number;
	/** @mockType {address.longitude} */
	lat1: number;
	/** @mockType {address.latitude} */
	lon2: number;
	/** @mockType {address.latitude} */
	lat2: number;
}

interface Datasource {
	/** @mockType {random.word} */
	sourcename: string;
	/** @mockType {internet.url} */
	url: string;
}

interface Rank {
	popularity: number;
	confidence: number;
	confidence_city_level: number;
	/** @mockType {random.word} */
	match_type: string;
}

interface Timezone {
	/** @mockType {random.word} */
	name: string;
	/** @mockType {random.word} */
	offset_STD: string;
	offset_STD_seconds: number;
	/** @mockType {random.word} */
	offset_DST: string;
	offset_DST_seconds: number;
	/** @mockType {random.word} */
	abbreviation_STD: string;
	/** @mockType {random.word} */
	abbreviation_DST: string;
}
