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
const route_static = '/static';

describe('Reviews Routes', () => {
	//Need to get a good Page ID
	it('GET - /v1/static/:pageId - Get Static page by ID - Bad ID', () => {
		compoundURL = `${url}${version}${route_static}/badID`;
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
