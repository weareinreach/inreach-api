/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;

describe('Reporting Routers', () => {
	it('GET - /v1/reporting/:country/organizations/count - Get Count of Organizations in a country', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reporting'),
			'/mexico',
			Cypress.env('route_organizations_count')
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body.count).to.be.an('number');
		});
	});

	it('GET - /v1/reporting/:country/services/count - Get Count of Services in a country', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reporting'),
			'/mexico',
			Cypress.env('route_services_count')
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body.count).to.be.an('number');
		});
	});
	it('GET - /v1/reporting/:country/nationalOrgs - Get Orgs that are national', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reporting'),
			'/united-states',
			Cypress.env('route_national_orgs')
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body.country).to.be.eq('united-states');
			expect(response.body.country).to.be.an('string');
			expect(response.body.count).to.be.an('number');
		});
	});
	it('GET - /v1/reporting/:country/nationalOrgs - Get Orgs that are national - Non supported country', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reporting'),
			'/panama',
			Cypress.env('route_national_orgs')
		);
		cy.request({
			method: 'GET',
			url: compoundURL,
			failOnStatusCode: false
		}).should((response) => {
			expect(response.status).to.be.eq(400);
			expect(response.body.error).to.be.eq(true);
			expect(response.body.error).to.be.an('boolean');
		});
	});
	it('GET - /v1/reporting/:country/nationalServices - Get Services that are national', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reporting'),
			'/united-states',
			Cypress.env('route_national_services')
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body.country).to.be.eq('united-states');
			expect(response.body.country).to.be.an('string');
			expect(response.body.count).to.be.an('number');
		});
	});
	it('GET - /v1/reporting/:country/nationalServices - Get Services that are national - Non supported country', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reporting'),
			'/brazil',
			Cypress.env('route_national_services')
		);
		cy.request({
			method: 'GET',
			url: compoundURL,
			failOnStatusCode: false
		}).should((response) => {
			expect(response.status).to.be.eq(400);
			expect(response.body.error).to.be.eq(true);
			expect(response.body.error).to.be.an('boolean');
		});
	});
	it('GET - /v1/reporting/:country/orgsByState - Get Orgs By State', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reporting'),
			'/united-states',
			Cypress.env('route_orgs_state')
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body.result).to.be.an('array');
			expect(response.body.result).to.have.lengthOf(51);
		});
	});

	it('GET - /v1/reporting/:country/orgsByState - Get Orgs By State - Non Supported country', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reporting'),
			'/brazil',
			Cypress.env('route_orgs_state')
		);
		cy.request({
			method: 'GET',
			url: compoundURL,
			failOnStatusCode: false
		}).should((response) => {
			expect(response.status).to.be.eq(400);
			expect(response.body.error).to.be.eq(true);
			expect(response.body.error).to.be.an('boolean');
		});
	});

	it('GET - /v1/reporting/:country/serviceByState - Get Services By State', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reporting'),
			'/united-states',
			Cypress.env('route_services_state')
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body.result).to.be.an('array');
			expect(response.body.result).to.have.lengthOf(51);
		});
	});

	it('GET - /v1/reporting/:country/serviceByState - Get Services By State - Non Supported country', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reporting'),
			'/brazil',
			Cypress.env('route_services_state')
		);
		cy.request({
			method: 'GET',
			url: compoundURL,
			failOnStatusCode: false
		}).should((response) => {
			expect(response.status).to.be.eq(400);
			expect(response.body.error).to.be.eq(true);
			expect(response.body.error).to.be.an('boolean');
		});
	});

	it('GET - /v1/reporting/:country/serviceByState - Get Services By State', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reporting'),
			'/united-states',
			Cypress.env('route_services_state')
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body.result).to.be.an('array');
			expect(response.body.result).to.have.lengthOf(51);
		});
	});

	it('GET - /v1/reporting/:country/categories - Get Categories', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reporting'),
			'/united-states',
			Cypress.env('route_categories')
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body.result).to.be.an('array');
			expect(response.body.result).to.have.lengthOf(14);
		});
	});

	it('GET - /v1/reporting/:country/categories - Get Categories - Non Supported country', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reporting'),
			'/brazil',
			Cypress.env('route_categories')
		);
		cy.request({
			method: 'GET',
			url: compoundURL,
			failOnStatusCode: false
		}).should((response) => {
			expect(response.status).to.be.eq(400);
			expect(response.body.error).to.be.eq(true);
			expect(response.body.error).to.be.an('boolean');
		});
	});
});
