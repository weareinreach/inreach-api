/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;

describe('Suggestion Routes', () => {
	beforeEach(() => {
		//Add Org
		cy.fixture('org_good_format.json').as('organization');
		cy.fixture('auth_user_good_creds.json').as('user_creds');
	});
	afterEach(() => {
		//Do the clean up
		cy.deleteUsersIfExist();
		cy.deleteOrgsIfExist();
		cy.deleteAutomationSuggestions();
	});
	it('GET - /v1/suggestions - Get Suggestions', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_suggestions')
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body).to.be.an('array');
		});
	});

	it('POST - /v1/suggestions - Create a new Suggestion - Bad Body', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_suggestions')
		);
		cy.request({
			method: 'POST',
			url: compoundURL,
			failOnStatusCode: false,
			body: {}
		}).should((response) => {
			expect(response.status).to.be.eq(400);
			expect(response.body.error).to.be.an('boolean');
			expect(response.body.error).to.be.eq(true);
		});
	});

	it('POST - /v1/suggestions - Create a new Suggestion - Good Body', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				cy.get('@user_creds').then((user) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_suggestions')
					);

					let suggestion = {
						suggestions: [
							{
								organizationId: createdOrgResponse.body.organization._id,
								userEmail: user.email,
								field: 'Description',
								value: 'The Description should be changed suggestion'
							}
						]
					};
					cy.request({
						method: 'POST',
						url: compoundURL,
						failOnStatusCode: false,
						body: suggestion
					}).should((response) => {
						expect(response.status).to.be.eq(200);
						expect(response.body.updated).to.be.an('boolean');
						expect(response.body.updated).to.be.eq(true);
					});
				});
			});
		});
	});

	it('GET - /v1/suggestions - Get Suggestions and find Added suggestion', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				cy.get('@user_creds').then((user) => {
					let suggestion = {
						suggestions: [
							{
								organizationId: createdOrgResponse.body.organization._id,
								userEmail: user.email,
								field: 'Description',
								value: 'The Description should be changed suggestion'
							}
						]
					};
					//Add the suggestion
					cy.addSuggestionToOrg(suggestion).then(() => {
						compoundURL = Cypress.env('baseUrl').concat(
							Cypress.env('version'),
							Cypress.env('route_suggestions')
						);
						cy.request({
							method: 'GET',
							url: compoundURL
						}).should((response) => {
							expect(response.status).to.be.eq(200);
							let suggestionArray = response.body;
							//Find the one i added
							suggestionArray.forEach((suggestionItem) => {
								//Find the ID of the Org
								if (
									suggestionItem.organizationId ===
									createdOrgResponse.body.organization._id
								) {
									expect(suggestionItem.organizationId).to.be.eq(
										createdOrgResponse.body.organization._id
									);
									expect(suggestionItem.userEmail).to.be.eq(
										suggestion.suggestions[0].userEmail
									);
									expect(suggestionItem.field).to.be.eq(
										suggestion.suggestions[0].field
									);
									expect(suggestionItem.value).to.be.eq(
										suggestion.suggestions[0].value
									);
								}
							});
						});
					});
				});
			});
		});
	});

	it('DELETE - /v1/suggestions/:suggestionId - Delete Suggestion', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				cy.get('@user_creds').then((user) => {
					let suggestion = {
						suggestions: [
							{
								organizationId: createdOrgResponse.body.organization._id,
								userEmail: user.email,
								field: 'Description',
								value: 'The Description should be changed suggestion'
							}
						]
					};
					//Add the suggestion
					cy.addSuggestionToOrg(suggestion).then(() => {
						cy.getSuggestionByOrgId(
							createdOrgResponse.body.organization._id
						).then((retrievedSuggestionArray) => {
							let retrievedSuggestion;
							retrievedSuggestionArray.body.forEach((suggestion) => {
								if (
									suggestion.organizationId ===
									createdOrgResponse.body.organization._id
								) {
									retrievedSuggestion = suggestion;
								}
							});
							compoundURL = Cypress.env('baseUrl').concat(
								Cypress.env('version'),
								Cypress.env('route_suggestions'),
								`/${retrievedSuggestion._id}`
							);
							cy.request({
								method: 'DELETE',
								url: compoundURL
							}).should((response) => {
								expect(response.status).to.be.eq(200);
								expect(response.body.deleted).to.be.an('boolean');
								expect(response.body.deleted).to.be.eq(true);
							});
						});
					});
				});
			});
		});
	});

	after(() => {
		//Delete temp_data folder
		cy.exec('rm -fr '.concat(Cypress.env('filePath')));
	});
});
