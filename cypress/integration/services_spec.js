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

//Routes constants
const route_services = '/services';
const route_services_count = '/services/count';
const route_organizations = '/organizations';

//Test Suite
describe('Services Routers', () => {
	before(() => {
		cy.fixture('org_good_format.json').then((org) => {
			//Add Automation Org
			cy.addOrg(org).then((response) => {
				cy.writeFile(`${filesPath}/org_created.json`, response.body);
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services - Get Organization Services - Good Org ID', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org.organization._id}${route_services}`;
			cy.request({
				method: 'GET',
				url: compoundURL
			}).should((response) => {
				expect(response.status).to.be.eq(200);
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services - Get Organization Services - Bad Org ID', () => {
		compoundURL = `${url}${version}${route_organizations}/BadOrgID`;
		cy.request({
			method: 'GET',
			url: compoundURL,
			failOnStatusCode: false
		}).should((response) => {
			expect(response.status).to.be.eq(404);
		});
	});

	it('GET - /v1/services/count - Get Services Count', () => {
		compoundURL = `${url}${version}${route_services_count}`;
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body).to.have.all.keys('count');
			expect(response.body.count).to.be.an('number');
			expect(response.body.count).to.be.greaterThan(0);
		});
	});

	it('POST - /v1/organzizations/:orgId/services - Add Services to a Organizations - Bad Org Id', () => {
		compoundURL = `${url}${version}${route_organizations}/BAAAAADDORGID${route_services}`;
		cy.request({
			method: 'POST',
			url: compoundURL,
			failOnStatusCode: false,
			body: {}
		}).should((response) => {
			expect(response.status).to.be.eq(500);
		});
	});

	it('POST - /v1/organzizations/:orgId/services - Add Services to a Organizations - Good Org Id', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			cy.fixture('org_services.json').then((org_service) => {
				compoundURL = `${url}${version}${route_organizations}/${org.organization._id}${route_services}`;
				cy.request({
					method: 'POST',
					url: compoundURL,
					body: org_service
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body.created).to.be.an('boolean');
					expect(response.body.created).to.be.eq(true);
				});
				//verify Services were added
				cy.getOrgById(org.organization._id).then((response) => {
					expect(response.body.services).to.be.an('array');
					expect(response.body.services[0].name).to.be.eq(org_service.name);
					expect(response.body.services[0].description).to.be.eq(
						org_service.description
					);
					//Update Org
					cy.writeFile(`${filesPath}/org_created.json`, response.body);
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services/:serviceId - Good Org ID and Service ID', () => {
		cy.fixture('org_services.json').then((org_service) => {
			cy.readFile(`${filesPath}/org_created.json`).then((org) => {
				compoundURL = `${url}${version}${route_organizations}/${org._id}${route_services}/${org.services[0]._id}`;
				cy.request({
					method: 'GET',
					url: compoundURL
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body.name).to.be.eq(org_service.name);
					expect(response.body.description).to.be.eq(org_service.description);
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services/:serviceId - Bad Org ID and Good Service ID', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/BADOORGID/${org.services[0]._id}`;
			cy.request({
				method: 'GET',
				url: compoundURL,
				failOnStatusCode: false
			}).should((response) => {
				expect(response.status).to.be.eq(404);
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services/:serviceId - Good Org ID and Bad Service ID', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org._id}${route_services}/BADSERVICEID`;
			cy.request({
				method: 'GET',
				url: compoundURL,
				failOnStatusCode: false
			}).should((response) => {
				expect(response.status).to.be.eq(404);
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/services/:serviceId - Update a Service Information - Good Org and Services', () => {
		cy.fixture('org_services_update.json').then((org_service_updated) => {
			cy.readFile(`${filesPath}/org_created.json`).then((org) => {
				compoundURL = `${url}${version}${route_organizations}/${org._id}${route_services}/${org.services[0]._id}`;
				cy.request({
					method: 'PATCH',
					url: compoundURL,
					body: org_service_updated
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body.updated).to.be.an('boolean');
					expect(response.body.updated).to.be.eq(true);
					//Get Organization and verify it was updated
					cy.getOrgById(org._id).then((response) => {
						expect(response.body.services).to.be.an('array');
						expect(response.body.services[0].name).to.be.eq(
							org_service_updated.name
						);
						expect(response.body.services[0].description).to.be.eq(
							org_service_updated.description
						);
						//Update Org
						cy.writeFile(`${filesPath}/org_created.json`, response.body);
					});
				});
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/services/:serviceId - Update a Service Information - Bad Org and Good Services', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			cy.fixture('org_services_update.json').then((org_service_updated) => {
				compoundURL = `${url}${version}${route_organizations}/BADORGID${route_services}/${org.services[0]._id}`;
				cy.request({
					method: 'PATCH',
					url: compoundURL,
					body: org_service_updated,
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(500);
				});
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/services/:serviceId - Update a Service Information - Good Org and Bad Services', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org._id}${route_services}/BADSERVICESID`;
			cy.request({
				method: 'PATCH',
				url: compoundURL,
				body: {},
				failOnStatusCode: false
			}).should((response) => {
				expect(response.status).to.be.eq(500);
			});
		});
	});
	it('DELETE - /v1/organization/:orgId/services/:serviceId - Delete Service from Org', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org._id}${route_services}/${org.services[0]._id}`;
			cy.request({
				method: 'DELETE',
				url: compoundURL
			}).should((response) => {
				expect(response.status).to.be.eq(200);
				expect(response.body.deleted).to.be.an('boolean');
				expect(response.body.deleted).to.be.eq(true);
				//Get Organization and verify it was updated
				cy.getOrgById(org._id).then((response) => {
					expect(response.body.services).to.be.an('array');
					expect(response.body.services).to.have.lengthOf(0);
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
