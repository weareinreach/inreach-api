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

//Route Constants
const route_suggestions = '/suggestions';

describe('Suggestion Routes', () => {
	before(() => {
		//Add Org
		cy.fixture('org_good_format.json').then((org) => {
			//Add Automation Org
			cy.addOrg(org).then((response) => {
				cy.writeFile(`${filesPath}/org_created.json`, response.body);
			});
		});
	});

	it('GET - /v1/suggestions - Get Suggestions', () => {
		compoundURL = `${url}${version}${route_suggestions}`;
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body).to.be.an('array');
			expect(response.body[0]).has.all.keys(
				'_id',
				'organizationId',
				'userEmail',
				'field',
				'value',
				'created_at',
				'updated_at',
				'__v'
			);
		});
	});

	it('POST - /v1/suggestions - Create a new Suggestion - Bad Body', () => {
		compoundURL = `${url}${version}${route_suggestions}`;
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
		compoundURL = `${url}${version}${route_suggestions}`;
		cy.fixture('auth_user_good_creds.json').then((user) => {
			cy.readFile(`${filesPath}/org_created.json`).then((org) => {
				let suggestion = {
					suggestions: [
						{
							organizationId: org.organization._id,
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

	it('GET - /v1/suggestions - Get Suggestions and find Added suggestion', () => {
		compoundURL = `${url}${version}${route_suggestions}`;
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			let suggestionArray = response.body;
			//Find the one i added
			suggestionArray.forEach((suggestion) => {
				//Find the ID of the Org
				cy.readFile(`${filesPath}/org_created.json`).then((org) => {
					if (suggestion.organizationId === org.organization._id) {
						cy.writeFile(`${filesPath}/created_suggestion.json`, suggestion);
					}
				});
			});
		});
	});

	it('DELETE - /v1/suggestions/:suggestionId - Delete Suggestion', () => {
		cy.readFile(`${filesPath}/created_suggestion.json`).then((suggestion) => {
			compoundURL = `${url}${version}${route_suggestions}/${suggestion._id}`;
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

	after(() => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			cy.deleteOrgById(org._id);
			//Delete temp_data folder
			cy.exec(`rm -fr ${filesPath}`);
		});
	});
});
