/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;

describe('Reviews Routes', () => {
	it('GET - /v1/reviews - Get Reviews', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reviews')
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body.reviews).to.be.an('array');
		});
	});

	//Once it is fixed will un-comment
	// it('POST - /v1/reviews - Post Reviews - No Body', () => {
	// 	compoundURL = Cypress.env('baseUrl').concat(
	// 		Cypress.env('version'),
	// 		Cypress.env('route_reviews')
	// 	);
	// 	cy.request({
	// 		method: 'POST',
	// 		url: compoundURL,
	// 		failOnStatusCode:false
	// 	}).should((response) => {
	// 		expect(response.status).to.be.eq(400);
	// 	});
	// });

	// Even with empty body it posts to reviews
	it('POST - /v1/reviews - Post Reviews - Good Body', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reviews')
		);
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
