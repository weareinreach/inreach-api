/* eslint-disable no-undef */
/// <reference types="cypress" />

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
				cy.writeFile(
					Cypress.env('filePath').concat('/org_created.json'),
					response.body
				);
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services - Get Organization Services - Good Org ID', () => {
		cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
			(org) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${org.organization._id}`,
					Cypress.env('route_services')
				);
				cy.request({
					method: 'GET',
					url: compoundURL
				}).should((response) => {
					expect(response.status).to.be.eq(200);
				});
			}
		);
	});

	it('GET - /v1/organizations/:orgId/services - Get Organization Services - Bad Org ID', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_organizations'),
			'/BadOrgID'
		);
		cy.request({
			method: 'GET',
			url: compoundURL,
			failOnStatusCode: false
		}).should((response) => {
			expect(response.status).to.be.eq(500);
		});
	});

	it('GET - /v1/services/count - Get Services Count', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_services_count')
		);
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
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_organizations'),
			'/BAAAAADDORGID',
			Cypress.env('route_services')
		);
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
		cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
			(org) => {
				cy.fixture('org_services.json').then((org_service) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations'),
						`/${org.organization._id}`,
						Cypress.env('route_services')
					);
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
						cy.writeFile(
							Cypress.env('filePath').concat('/org_created.json'),
							response.body
						);
					});
				});
			}
		);
	});

	it('GET - /v1/organizations/:orgId/services/:serviceId - Good Org ID and Service ID', () => {
		cy.fixture('org_services.json').then((org_service) => {
			cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
				(org) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations'),
						`/${org._id}`,
						Cypress.env('route_services'),
						`/${org.services[0]._id}`
					);
					cy.request({
						method: 'GET',
						url: compoundURL
					}).should((response) => {
						expect(response.status).to.be.eq(200);
						expect(response.body.name).to.be.eq(org_service.name);
						expect(response.body.description).to.be.eq(org_service.description);
					});
				}
			);
		});
	});

	it('GET - /v1/organizations/:orgId/services/:serviceId - Bad Org ID and Good Service ID', () => {
		cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
			(org) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					'/BADOORGID',
					`/${org.services[0]._id}`
				);
				cy.request({
					method: 'GET',
					url: compoundURL,
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(404);
				});
			}
		);
	});

	it('GET - /v1/organizations/:orgId/services/:serviceId - Good Org ID and Bad Service ID', () => {
		cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
			(org) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${org._id}`,
					Cypress.env('route_services'),
					'/BADSERVICEID'
				);
				cy.request({
					method: 'GET',
					url: compoundURL,
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(404);
				});
			}
		);
	});

	it('PATCH - /v1/organizations/:orgId/services/:serviceId - Update a Service Information - Good Org and Services', () => {
		cy.fixture('org_services_update.json').then((org_service_updated) => {
			cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
				(org) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations'),
						`/${org._id}`,
						Cypress.env('route_services'),
						`/${org.services[0]._id}`
					);
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
							cy.writeFile(
								Cypress.env('filePath').concat('/org_created.json'),
								response.body
							);
						});
					});
				}
			);
		});
	});

	it('PATCH - /v1/organizations/:orgId/services/:serviceId - Update a Service Information - Bad Org and Good Services', () => {
		cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
			(org) => {
				cy.fixture('org_services_update.json').then((org_service_updated) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations'),
						'/BADORGID',
						Cypress.env('route_services'),
						`/${org.services[0]._id}`
					);
					cy.request({
						method: 'PATCH',
						url: compoundURL,
						body: org_service_updated,
						failOnStatusCode: false
					}).should((response) => {
						expect(response.status).to.be.eq(500);
					});
				});
			}
		);
	});

	it('PATCH - /v1/organizations/:orgId/services/:serviceId - Update a Service Information - Good Org and Bad Services', () => {
		cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
			(org) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${org._id}`,
					Cypress.env('route_services'),
					'/BADSERVICESID'
				);
				cy.request({
					method: 'PATCH',
					url: compoundURL,
					body: {},
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(500);
				});
			}
		);
	});
	it('DELETE - /v1/organization/:orgId/services/:serviceId - Delete Service from Org', () => {
		cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
			(org) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${org._id}`,
					Cypress.env('route_services'),
					`/${org.services[0]._id}`
				);
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
			}
		);
	});

	after(() => {
		cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
			(org) => {
				cy.deleteOrgById(org._id);
				//Delete temp_data folder
				cy.exec('rm -fr '.concat(Cypress.env('filePath')));
			}
		);
	});
});
