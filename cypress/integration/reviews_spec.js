/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;

describe('Reviews Routes', () => {
	beforeEach(() => {
		//Loading Necessary Fixtures
		cy.fixture('review.json').as('review');
	});

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
	it('POST - /v1/reviews - Post Reviews - No Body', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_reviews')
		);
		cy.request({
			method: 'POST',
			url: compoundURL,
			failOnStatusCode: false
		}).should((response) => {
			expect(response.status).to.be.eq(400);
		});
	});

	// Even with empty body it posts to reviews
	it('POST - /v1/reviews - Post Reviews - Good Body', () => {
		cy.get('@review').then((review) => {
			compoundURL = Cypress.env('baseUrl').concat(
				Cypress.env('version'),
				Cypress.env('route_reviews')
			);
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
});
