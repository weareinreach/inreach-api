/* eslint-disable no-undef */
/// <reference types="cypress" />

//TODO CHECK FOR KEYS IN REPONSE

//Instantiate up Server variable
const port = process.env.PORT || 8080;
const url = process.env.HOST || `http://localhost:${port}`;
const filesPath = './cypress/temp_data';
const version = '/v1';

//compound url
let compoundURL = null;

//Route Constants
const route_organizations = '/organizations';
const route_ratings = '/ratings';
const route_services = '/services';

describe('Comments Routers', () => {
	before(() => {
		//Add Org
		cy.fixture('org_good_format.json').then((org) => {
			//Add Automation Org
			cy.addOrg(org).then((response) => {
				//Add Services to that org
				cy.fixture('org_services.json').then((service) => {
					cy.addServiceToOrg(response.body.organization._id, service);
					//get Org Info and save it
					cy.getOrgById(response.body.organization._id).then((response) => {
						cy.writeFile(`${filesPath}/org_created.json`, response.body);
					});
				});
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/ratings - Add Ratings - Bad Ratings No Body', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org._id}${route_ratings}`;
			cy.request({
				method: 'PATCH',
				url: compoundURL,
				failOnStatusCode: false,
				body: {}
			}).should((response) => {
				expect(response.status).to.be.eq(400);
				expect(response.body.error).to.be.an('boolean');
				expect(response.body.error).to.be.eq(true);
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/ratings - Add Ratings - Good Ratings', () => {
		cy.fixture('auth_user_id.json').then((user) => {
			cy.readFile(`${filesPath}/org_created.json`).then((org) => {
				compoundURL = `${url}${version}${route_organizations}/${org._id}${route_ratings}`;
				let rating = {
					userId: user.id,
					rating: 9,
					source: 'Test Source'
				};
				//save rating
				cy.writeFile(`${filesPath}/rating.json`, rating);

				cy.request({
					method: 'PATCH',
					url: compoundURL,
					body: rating
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body.updated).to.be.an('boolean');
					expect(response.body.updated).to.be.eq(true);
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/ratings - Get Organization ratings', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org._id}${route_ratings}`;
			cy.request({
				method: 'GET',
				url: compoundURL
			}).should((response) => {
				expect(response.status).to.be.eq(200);
				expect(response.body.ratings).to.be.an('array');
				expect(response.body.ratings).to.have.lengthOf(1);
				expect(response.body.ratings[0]._id).to.be.an('string');
				expect(response.body.ratings[0].rating).to.be.an('number');
				expect(response.body.ratings[0].source).to.be.an('string');
				expect(response.body.ratings[0].userId).to.be.an('string');
				cy.readFile(`${filesPath}/rating.json`).then((rating) => {
					expect(response.body.ratings[0].rating).to.be.eq(rating.rating);
					expect(response.body.ratings[0].source).to.be.eq(rating.source);
					expect(response.body.ratings[0].userId).to.be.eq(rating.userId);
				});
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/services/:servicesId/ratings - Add ratings To Service - Bad rating No Body', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org._id}${route_services}/${org.services[0]._id}${route_ratings}`;
			cy.request({
				method: 'PATCH',
				url: compoundURL,
				failOnStatusCode: false,
				body: {}
			}).should((response) => {
				expect(response.status).to.be.eq(400);
				expect(response.body.error).to.be.an('boolean');
				expect(response.body.error).to.be.eq(true);
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/services/:servicesId/ratings - Add ratings To Org Services - Good Rating', () => {
		cy.fixture('auth_user_id.json').then((user) => {
			cy.readFile(`${filesPath}/org_created.json`).then((org) => {
				compoundURL = `${url}${version}${route_organizations}/${org._id}${route_services}/${org.services[0]._id}${route_ratings}`;
				let rating = {
					userId: user.id,
					rating: 3,
					source: 'Test Service Source'
				};
				//save rating
				cy.writeFile(`${filesPath}/rating_service.json`, rating);

				cy.request({
					method: 'PATCH',
					url: compoundURL,
					body: rating
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body.updated).to.be.an('boolean');
					expect(response.body.updated).to.be.eq(true);
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services/:serviceId/ratings - Get Organization Service ratings', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org._id}${route_services}/${org.services[0]._id}${route_ratings}`;
			cy.request({
				method: 'GET',
				url: compoundURL
			}).should((response) => {
				expect(response.status).to.be.eq(200);
				expect(response.body.ratings).to.be.an('array');
				expect(response.body.ratings).to.have.lengthOf(1);
				expect(response.body.ratings[0]._id).to.be.an('string');
				expect(response.body.ratings[0].rating).to.be.an('number');
				expect(response.body.ratings[0].source).to.be.an('string');
				expect(response.body.ratings[0].userId).to.be.an('string');
				cy.readFile(`${filesPath}/rating_service.json`).then((rating) => {
					expect(response.body.ratings[0].rating).to.be.eq(rating.rating);
					expect(response.body.ratings[0].source).to.be.eq(rating.source);
					expect(response.body.ratings[0].userId).to.be.eq(rating.userId);
				});
			});
		});
	});

	after(() => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			cy.deleteOrgById(org._id);
			//Delete temp_data folder
			cy.exec(`rm -fr ${filesPath}`);
		});
	});
});
