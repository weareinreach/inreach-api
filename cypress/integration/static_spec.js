/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;

describe('Reviews Routes', () => {
	//Need to get a good Page ID
	it('GET - /v1/static/:pageId - Get Static page by ID - Bad ID', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_static'),
			'/badID'
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
