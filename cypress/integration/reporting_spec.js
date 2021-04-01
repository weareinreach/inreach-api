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
});
