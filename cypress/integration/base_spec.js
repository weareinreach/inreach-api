/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;

//Routes constants

//Test Suite
describe('Base Routers', () => {
	it('GET - / - Base URL', () => {
		cy.request(Cypress.env('baseUrl')).should((response) => {
			expect(response.status).to.eq(200);
			expect(response.body.ok).to.be.an('boolean');
			expect(response.body.ok).to.be.eq(true);
		});
	});

	it('GET - /docs - Swagger Page', () => {
		compoundURL = Cypress.env('baseUrl').concat(Cypress.env('route_docs'));
		cy.request(compoundURL).should((response) => {
			expect(response.status).to.be.eq(200);
		});
	});
});
