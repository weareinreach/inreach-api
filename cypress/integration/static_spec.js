/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;
const specTitle = require('cypress-sonarqube-reporter/specTitle');

describe(specTitle('Reviews Routes'), () => {
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
	it('GET - /v1/static/:pageId - Get Static page by ID - Bad ID that causes error', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_static'),
			'/mexico'
		);
		cy.request({
			method: 'GET',
			url: compoundURL,
			failOnStatusCode: false
		}).should((response) => {
			expect(response.status).to.be.eq(500);
			expect(response.body.error).to.be.an('boolean');
			expect(response.body.error).to.be.eq(true);
		});
	});
	it('GET - /v1/static/:pageId - Get Static page by ID - Good ID', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_static'),
			'/international'
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body.page).to.be.an('array');
			expect(response.body.page).to.be.not.empty;
		});
	});
});
