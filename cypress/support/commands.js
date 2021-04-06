/* eslint-disable no-undef */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --

// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
let compoundURL = null;

//Authentication Functions
Cypress.Commands.add('login', (creds_json) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_auth')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: creds_json
	});
});

//Organizations Functions
//Add Org
Cypress.Commands.add('addOrg', (org) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: org
	});
});

Cypress.Commands.add('addOrgOwner', (orgId, userId, userEmail) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${orgId}`,
		Cypress.env('route_organizations_owners')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: {
			email: userEmail,
			userId: userId
		}
	});
});

//Get Org By ID
Cypress.Commands.add('getOrgById', (id) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${id}`
	);
	cy.request({
		method: 'GET',
		url: compoundURL
	});
});

//Delete Org by ID
Cypress.Commands.add('deleteOrgById', (id) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${id}`
	);
	cy.request({
		method: 'DELETE',
		url: compoundURL
	});
});

//Add Service to org
Cypress.Commands.add('addServiceToOrg', (orgId, service) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${orgId}`,
		Cypress.env('route_services')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: service
	});
});

//Add Rating to Org
Cypress.Commands.add('addRatingToOrg', (orgId, rating) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${orgId}`,
		Cypress.env('route_ratings')
	);
	cy.request({
		method: 'PATCH',
		url: compoundURL,
		body: rating
	});
});

//Add Comment to Org
Cypress.Commands.add('addCommentToOrg', (orgId, comment) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${orgId}`,
		Cypress.env('route_comments')
	);
	cy.request({
		method: 'PATCH',
		url: compoundURL,
		body: comment
	});
});

//Add Suggestion to Org
Cypress.Commands.add('addSuggestionToOrg', (suggestion) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_suggestions')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: suggestion
	});
});

//Get Suggestions from Org ID - Consider making this return all the suggestions for the org
Cypress.Commands.add('getSuggestionByOrgId', () => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_suggestions')
	);
	cy.request({
		method: 'GET',
		url: compoundURL
	});
});

//Add Comment to Service
Cypress.Commands.add('addCommentToService', (orgId, serviceId, comment) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${orgId}`,
		Cypress.env('route_services'),
		`/${serviceId}`,
		Cypress.env('route_comments')
	);

	cy.request({
		method: 'PATCH',
		url: compoundURL,
		body: comment
	});
});

//Add Rating to Service
Cypress.Commands.add('addRatingToService', (orgId, serviceId, rating) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${orgId}`,
		Cypress.env('route_services'),
		`/${serviceId}`,
		Cypress.env('route_ratings')
	);

	cy.request({
		method: 'PATCH',
		url: compoundURL,
		body: rating
	});
});

//Get User
Cypress.Commands.add('getUser', (user_id) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_users'),
		`/${user_id}`
	);
	cy.request({
		method: 'GET',
		url: compoundURL
	});
});

//Add User
Cypress.Commands.add('addUser', (user_data) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_users')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: user_data
	});
});

//Delete User
Cypress.Commands.add('deleteUser', (user_id) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_users'),
		`/${user_id}`
	);
	cy.request({
		method: 'DELETE',
		url: compoundURL
	});
});

//Create Favorites List
Cypress.Commands.add('addList', (user_id, list) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_users'),
		`/${user_id}`,
		Cypress.env('route_users_list')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: list
	});
});

//Delete Favorites List
Cypress.Commands.add('deleteListById', (user_id, list_id) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_users'),
		`/${user_id}`,
		Cypress.env('route_users_list'),
		`/${list_id}`
	);
	cy.request({
		method: 'DELETE',
		url: compoundURL
	});
});
