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
		Medical: {'HIV and sexual health': 'true', "Women's Health": 'true'},
		'Mental Health': {'Support groups': 'true'}
	};
	#serviceTagsMexico = {
		Medical: {'HIV and sexual health': 'true', "Women's Health": 'true'}
	};
	#serviceTagsCanada = {
		Medical: {'HIV and sexual health': 'true', "Women's Health": 'true'},
		'Mental Health': {'Support groups': 'true'}
	};

	constructor(param) {
		this.is_published = Math.random() < 0.9;
		this.description = `Organization ${this.#uniqueOrgID} description`;
		this.name = faker.company.companyName().split('.').join('');
		this.is_deleted = Math.random() < 0.1;
		this.owners = seedFunctions.getArray(randNumber).map(() => {
			return {
				isApproved: Math.random() < 0.7,
				name: faker.name.firstName(),
				email: faker.internet.email(),
				userId: randNumber
			};
		});
		this.slug = `organization-seeded-number-${this.#uniqueOrgID}`;
		this.slug_ES = `organization-seeded-number-${this.#uniqueOrgID}`;
		this.verified_at = faker.date.past();
		this.website = faker.internet.url();
		this.website_ES = Math.random() < 0.5 ? faker.internet.url() : '';
		let national_us =
			Math.random() < 0.5 ? {'service-national-united-states': 'true'} : {};
		let state_1 =
			Math.random() < 0.8
				? {
						[`service-${faker.address
							.state()
							.toLowerCase()
							.replace(/[^a-zA-Z0-9 ]/g, '')
							.replace(/\s+/g, '-')}`]: 'true'
				  }
				: {};
		let state_2 =
			Math.random() < 0.8
				? {
						[`service-${faker.address
							.state()
							.toLowerCase()
							.replace(/[^a-zA-Z0-9 ]/g, '')
							.replace(/\s+/g, '-')}`]: 'true'
				  }
				: {};
		let city_1 =
			Math.random() < 0.8
				? {
						[`service-${faker.address
							.city()
							.toLowerCase()
							.replace(/[^a-zA-Z0-9 ]/g, '')
							.replace(/\s+/g, '-')}`]: 'true'
				  }
				: {};
		let city_2 =
			Math.random() < 0.8
				? {
						[`service-${faker.address
							.city()
							.toLowerCase()
							.replace(/[^a-zA-Z0-9 ]/g, '')
							.replace(/\s+/g, '-')}`]: 'true'
				  }
				: {};
		this.services = seedFunctions.getArray(randNumber).map(() => {
			return {
				description: faker.lorem.sentence(),
				is_published: true,
				is_deleted: Math.random() < 0.5,
				name: faker.company.companyName().split('.').join(''),
				slug: `service-slug-${this.#uniqueServiceId}`,
				slug_ES: `service-slug-${this.#uniqueServiceId}`,

				properties: Object.assign(
					{},
					national_us,
					state_1,
					state_2,
					city_1,
					city_2
				),
				tags: {
					united_states:
						Math.random() < 0.5 ? this.#serviceTagsUnitedStates : {},
					mexico: Math.random() < 0.5 ? this.#serviceTagsMexico : {},
					canada: Math.random() < 0.5 ? this.#serviceTagsCanada : {}
				}
			};
		});
		this.properties = Object.assign(
			{},
			national_us,
			state_1,
			state_2,
			city_1,
			city_2
		);
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
		this.locations = seedFunctions
			.getArray(randNumber)
			.map((element, index) => {
				return {
					geolocation: {
						coordinates: [faker.address.longitude(), faker.address.latitude()],
						type: 'Point'
					},
					address: faker.address.streetAddress(),
					city: faker.address.city(),
					//First entry is always the primary
					is_primary: index == 0 ? true : false,
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
