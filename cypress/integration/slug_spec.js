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
const route_organizations = '/slug/organizations';
const route_services = '/services';

//Test suite
describe('Slug Routers', () => {
	before(() => {
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

	it('GET - /v1/slug/organizations/:orgSlug - Get Organization from slug - Good Slug', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org.slug}`;
			cy.request({
				method: 'GET',
				url: compoundURL
			}).should((response) => {
				expect(response.status).to.be.eq(200);
				expect(response.body).to.be.not.empty;
				expect(response.body.is_published).to.be.eq(org.is_published);
				expect(response.body.name).to.be.eq(org.name);
				expect(response.body.slug).to.be.eq(org.slug);
			});
		});
	});

	it('GET - /v1/slug/organizations/:orgSlug - Get Organization from slug - Bad Slug', () => {
		compoundURL = `${url}${version}${route_organizations}/bad-slug-name`;
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
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org.slug}${route_services}/${org.services[0].slug}`;
			cy.request({
				method: 'GET',
				url: compoundURL
			}).should((response) => {
				cy.writeFile(`${filesPath}/response1.json`, response.body);
				expect(response.status).to.be.eq(200);
			});
		});
	});

	it('GET - /v1/organizations/:orgSlug/services/:serviceSlug - Get Organization Service from slug - Bad Slug', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org.slug}${route_services}/bad-slug-name`;
			cy.request({
				method: 'GET',
				url: compoundURL,
				failOnStatusCode: false
			}).should((response) => {
				cy.writeFile(`${filesPath}/response.json`, response.body);
				expect(response.status).to.be.eq(404);
				expect(response.body.notFound).to.be.an('boolean');
				expect(response.body.notFound).to.be.eq(true);
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
