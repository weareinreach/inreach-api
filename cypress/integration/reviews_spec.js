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
const route_reviews = '/reviews';

describe('Reviews Routes', () => {
	it('GET - /v1/reviews - Get Reviews', () => {
		compoundURL = `${url}${version}${route_reviews}`;
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body.reviews).to.be.an('array');
		});
	});

	// Even with empty body it posts to reviews
	it('POST - /v1/reviews - Post Reviews - Good Body', () => {
		compoundURL = `${url}${version}${route_reviews}`;
		let review = {
			comment: 'Automated Comment',
			hasAccount: true,
			hasLeftFeedbackBefore: false,
			negativeReasons: ['Negative 1', 'Negative 2'],
			rating: 5
		};
		cy.request({
			method: 'POST',
			url: compoundURL,
			body: review
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body.created).to.be.an('boolean');
			expect(response.body.created).to.be.eq(true);
		});
	});
});
