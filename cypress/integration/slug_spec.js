/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;
const specTitle = require('cypress-sonarqube-reporter/specTitle');

//Test suite
describe(specTitle('Slug Routers'), () => {
	beforeEach(() => {
		cy.fixture('org_good_format.json').as('organization');
		cy.fixture('org_services.json').as('services');
	});
	afterEach(() => {
		//Do the clean up
		cy.deleteUsersIfExist();
		cy.deleteOrgsIfExist();
	});
	it('GET - /v1/slug/organizations/:orgSlug - Get Organization from slug - Good Slug', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_slug_organizations'),
					`/${createdOrgResponse.body.organization.slug}`
				);
				cy.request({
					method: 'GET',
					url: compoundURL
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body).to.be.not.empty;
					expect(response.body.is_published).to.be.eq(
						createdOrgResponse.body.organization.is_published
					);
					expect(response.body.name).to.be.eq(
						createdOrgResponse.body.organization.name
					);
					expect(response.body.slug).to.be.eq(
						createdOrgResponse.body.organization.slug
					);
				});
			});
		});
	});

	it('GET - /v1/slug/organizations/:orgSlug - Get Organization from slug - Bad Slug', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_slug_organizations'),
			'/bad-slug-name'
		);
		cy.request({
			method: 'GET',
			url: compoundURL,
			failOnStatusCode: false
		}).should((response) => {
			expect(response.status).to.be.eq(404);
			expect(response.body.notFound).to.be.an('boolean');
			expect(response.body.notFound).to.be.eq(true);
		});
	});

	// MIGHT HAVE FOUND BUG IN CODE - slugs are not unique
	it('GET - /v1/organizations/:orgSlug/services/:serviceSlug - Get Organization Service from slug - Good Slug', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				cy.get('@services').then((service) => {
					//Add it to Org
					cy.addServiceToOrg(
						createdOrgResponse.body.organization._id,
						service
					).then(() => {
						//Get Service Details by getting Org Info
						cy.getOrgById(createdOrgResponse.body.organization._id).then(
							(organization) => {
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_slug_organizations'),
									`/${organization.body.slug}`,
									Cypress.env('route_services'),
									`/${organization.body.services[0].slug}`
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
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgSlug/services/:serviceSlug - Get Organization Service from slug - Bad Slug', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_slug_organizations'),
					`/${createdOrgResponse.body.organization.slug}`,
					Cypress.env('route_services'),
					'/bad-slug-name'
				);
				cy.request({
					method: 'GET',
					url: compoundURL,
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(404);
					expect(response.body.notFound).to.be.an('boolean');
					expect(response.body.notFound).to.be.eq(true);
				});
			});
		});
	});

	after(() => {
		cy.exec('rm -fr '.concat(Cypress.env('filePath')));
	});
});
