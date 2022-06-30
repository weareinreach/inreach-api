/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;

//Routes constants

//Test Suite
describe('Dashboard Routers', () => {
	beforeEach(() => {
		//Loading Necessary Fixtures
		cy.fixture('dashboard_create_release').as('create_release_body');
		cy.fixture('dashboard_create_release_bad').as('create_release_body_bad');
	});

	afterEach(() => {
		cy.deleteBranch('test-branch', 'test-repo');
	});

	it('POST - /dashboard/createRelease - Create Release - Good Response', () => {
		cy.get('@create_release_body').then((request_body) => {
			cy.request({
				method: 'POST',
				url: Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_dashboard'),
					Cypress.env('route_dashboard_create_release')
				),
				body: request_body
			}).should((response) => {
				expect(response.status).to.eq(200);
				expect(response.body.created).to.be.an('boolean');
				expect(response.body.created).to.be.eq(true);
				expect(response.body.data).to.be.an('array');
				expect(response.body.data).to.have.lengthOf(1);
			});
		});
	});
	it('POST - /dashboard/createRelease - Create Release - Bad Data', () => {
		cy.get('@create_release_body_bad').then((request_body) => {
			cy.request({
				method: 'POST',
				url: Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_dashboard'),
					Cypress.env('route_dashboard_create_release')
				),
				body: request_body,
				failOnStatusCode: false
			}).should((response) => {
				expect(response.status).to.eq(500);
				expect(response.body.error).to.be.an('boolean');
				expect(response.body.error).to.be.eq(true);
				expect(response.body.message).to.be.an('string');
			});
		});
	});
});
