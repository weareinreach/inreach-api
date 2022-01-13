require('babel-register')({
	presets: ['env']
});

const seedFunctions = require('./generateSeedFunction');
const faker = require('faker');
const mongoose = require('../../src/mongoose');

//Functions
const numberOfOrgs = seedFunctions.getNumberBetween(8, 3);
const randNumber = seedFunctions.getNumberBetween(4, 2);

class OrgData {
	#uniqueOrgID = faker.datatype.number();
	#uniqueServiceId = faker.datatype.number();
	#serviceTagsUnitedStates = {
		Medical: {'HIV and sexual health': 'true'},
		'Mental Health': {'Support groups': 'true'}
	};
	#serviceTagsMexico = {Medical: {'HIV and sexual health': 'true'}};
	#serviceTagsCanada = {'Mental Health': {'Support groups': 'true'}};

	constructor(param) {
		this.is_published = Math.random() < 0.9;
		this.description = `Organization ${this.#uniqueOrgID} description`;
		this.name = faker.company.companyName();
		this.is_deleted = Math.random() < 0.1;
		this.slug = `organization-seeded-number-${this.#uniqueOrgID}`;
		this.slug_ES = `organization-seeded-number-${this.#uniqueOrgID}`;
		this.verified_at = faker.date.past();
		this.website = faker.internet.url();
		(this.website_ES = Math.random() < 0.5 ? faker.internet.url() : ''),
			(this.services = seedFunctions.getArray(randNumber).map(() => {
				return {
					description: faker.lorem.sentence(),
					is_published: true,
					is_deleted: Math.random() < 0.5,
					name: faker.company.companyName(),
					slug: `service-slug-${this.#uniqueServiceId}`,
					slug_ES: `service-slug-${this.#uniqueServiceId}`,
					tags: {
						united_states:
							Math.random() < 0.5 ? this.#serviceTagsUnitedStates : {},
						mexico: Math.random() < 0.5 ? this.#serviceTagsMexico : {},
						canada: Math.random() < 0.5 ? this.#serviceTagsCanada : {}
					}
				};
			}));
		this.emails = seedFunctions.getArray(randNumber).map(() => {
			return {
				email: faker.internet.email(),
				first_name: faker.name.firstName(),
				last_name: faker.name.lastName(),
				show_on_organization: false,
				is_primary: false,
				title: ''
			};
		});
		this.locations = seedFunctions.getArray(randNumber).map(() => {
			return {
				geolocation: {
					coordinates: [faker.address.longitude(), faker.address.latitude()],
					type: 'Point'
				},
				address: faker.address.streetAddress(),
				city: faker.address.city(),
				is_primary: false,
				lat: faker.address.latitude(),
				long: faker.address.longitude(),
				name: faker.company.companyName(),
				show_on_organization: true,
				state: faker.address.stateAbbr(),
				zip_code: faker.address.zipCode()
			};
		});
		(this.phones = seedFunctions.getArray(randNumber).map(() => {
			return {
				digits: faker.phone.phoneNumber(),
				is_primary: false,
				phone_type: faker.company.companyName(),
				phone_type_ES: Math.random() < 0.5 ? faker.company.companyName() : '',
				show_on_organization: Math.random() < 0.9
			};
		})),
			(this.notes_log = seedFunctions.getArray(randNumber).map(() => {
				return {
					note: faker.lorem.sentence(),
					created_at: faker.date.recent()
				};
			}));
	}
}
//Execute Seeding
seedFunctions.generateSeedData(
	numberOfOrgs,
	OrgData,
	mongoose.Organization,
	'Organization',
	null
);
