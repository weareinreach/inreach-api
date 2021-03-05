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
	compoundURL = `http://localhost:8080/v1/auth`;
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: creds_json
	});
});

//Organizations Functions
//Add Org
Cypress.Commands.add('addOrg', (org) => {
	compoundURL = `http://localhost:8080/v1/organizations`;
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: org
	});
});

//Get Org By ID
Cypress.Commands.add('getOrgById', (id) => {
	compoundURL = `http://localhost:8080/v1/organizations/${id}`;
	cy.request({
		method: 'GET',
		url: compoundURL
	});
});

Cypress.Commands.add('deleteOrgById', (id) => {
	compoundURL = `http://localhost:8080/v1/organizations/${id}`;
	cy.request({
		method: 'DELETE',
		url: compoundURL
	});
});

//Get User
Cypress.Commands.add('getUser', (user_id) => {
	compoundURL = `http://localhost:8080/v1/users/${user_id}`;
	cy.request({
		method: 'GET',
		url: compoundURL
	});
});

//Add User
Cypress.Commands.add('addUser', (user_data) => {
	compoundURL = `http://localhost:8080/v1/users`;
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: user_data
	});
});

//Delete User
Cypress.Commands.add('deleteUser', (user_id) => {
	compoundURL = `http://localhost:8080/v1/users/${user_id}`;
	cy.request({
		method: 'DELETE',
		url: compoundURL
	});
});
