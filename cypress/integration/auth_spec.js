/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;

//Test Suite
describe('Authentication Routers', () => {
	beforeEach(() => {
		//Load the necessary fixtures
		cy.fixture('user_new.json').as('new_user');
		cy.fixture('auth_user_bad_creds.json').as('bad_credentials');
		cy.fixture('auth_user_good_creds.json').as('good_credentials');
	});

	it('POST - /v1/auth - Authentication Page - Bad Credentials', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_auth')
		);
		cy.get('@bad_credentials').then((bad_credentials) => {
			cy.request({
				method: 'POST',
				url: compoundURL,
				failOnStatusCode: false,
				body: bad_credentials
			}).should((response) => {
				expect(response.status).to.be.eq(404);
				expect(response.body.notFound).to.be.an('boolean');
				expect(response.body.notFound).to.be.eq(true);
			});
		});
	});

	it('POST - /v1/auth - Authentication Page - Good Credentials', () => {
		//Get User Info
		cy.get('@new_user').then((new_user) => {
			//Add the User
			cy.addUser(new_user).then((add_user_response) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_auth')
				);
				cy.get('@good_credentials').then((good_crendentials) => {
					cy.request({
						method: 'POST',
						url: compoundURL,
						body: good_crendentials
					}).should((response) => {
						expect(response.status).to.be.eq(200);
						expect(response.body.valid).to.be.an('boolean');
						expect(response.body.valid).to.be.eq(true);
						expect(response.body.token).to.be.an('string');
						expect(response.body.token).to.not.be.empty;
					});
					//Delete User
					cy.deleteUser(add_user_response.body.userInfo._id);
				});
			});
		});
	});

	it('POST - /v1/auth/check - Checking Token - Bad Token', () => {
		//URL
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_auth_check')
		);
		cy.request({
			method: 'POST',
			url: compoundURL,
			failOnStatusCode: false,
			body: 'BaaaaaaaaadToken'
		}).should((response) => {
			expect(response.status).to.be.eq(400);
			expect(response.body.error).to.be.an('boolean');
			expect(response.body.error).to.be.eq(true);
		});
	});

	it('POST - /v1/auth/check - Checking Token - Good Token', () => {
		//Create User
		cy.get('@new_user').then((new_user) => {
			//Add the User
			cy.addUser(new_user).then((add_user_response) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_auth')
				);

				//Login and Save Token
				cy.get('@good_credentials').then((creds) => {
					cy.login(creds).then((login_response) => {
						compoundURL = Cypress.env('baseUrl').concat(
							Cypress.env('version'),
							Cypress.env('route_auth_check')
						);
						cy.request({
							method: 'POST',
							url: compoundURL,
							body: login_response.body
						}).should((response) => {
							expect(response.status).to.be.eq(200);
							expect(response.body).to.not.be.empty;
							expect(response.body.isDataManager).to.be.an('boolean');
							expect(response.body.isDataManager).to.be.eq(false);
							expect(response.body.isProfessional).to.be.an('boolean');
							expect(response.body.isProfessional).to.be.eq(false);
							expect(response.body.email).to.be.an('string');
							//Test against Original Credentials
							expect(response.body.email).to.be.eq(creds.email);
						});
					});
				});
				//Delete User
				cy.deleteUser(add_user_response.body.userInfo._id);
			});
		});
	});

	it('GET - /v1/auth/token - Get Token', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_auth_token')
		);
		cy.request(compoundURL).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body).to.be.an('string');
			expect(response.body).to.not.be.empty;
		});
	});

	after(() => {
		//Delete temp_data folder
		cy.exec('rm -fr '.concat(Cypress.env('filePath')));
	});
});
