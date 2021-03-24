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
const route_organizations = '/organizations';
const route_comments = '/comments';
const route_services = '/services';

describe('Comments Routers', () => {
	before(() => {
		//Add Org
		cy.fixture('org_good_format.json').then((org) => {
			//Add Automation Org
			cy.addOrg(org).then((response) => {
				//Add Services to that org
				cy.fixture('org_services.json').then((service) => {
					cy.addServiceToOrg(response.body.organization._id, service);
					//get Org Info and save it
					cy.getOrgById(response.body.organization._id).then((response) => {
						cy.writeFile(`${filesPath}/org_created.json`, response.body);
					});
				});
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/comments - Add Comments - Bad Comment No Body', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org._id}${route_comments}`;
			cy.request({
				method: 'PATCH',
				url: compoundURL,
				failOnStatusCode: false,
				body: {}
			}).should((response) => {
				expect(response.status).to.be.eq(400);
				expect(response.body.error).to.be.an('boolean');
				expect(response.body.error).to.be.eq(true);
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/comments - Add Comments - Good Comment', () => {
		cy.fixture('auth_user_id.json').then((user) => {
			cy.readFile(`${filesPath}/org_created.json`).then((org) => {
				compoundURL = `${url}${version}${route_organizations}/${org._id}${route_comments}`;
				let comment = {
					userId: user.id,
					comment: 'this is a test comment',
					source: 'Test Source'
				};
				//save comment
				cy.writeFile(`${filesPath}/comment.json`, comment);

				cy.request({
					method: 'PATCH',
					url: compoundURL,
					body: comment
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body.updated).to.be.an('boolean');
					expect(response.body.updated).to.be.eq(true);
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/comments - Get Organization comments', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org._id}${route_comments}`;
			cy.request({
				method: 'GET',
				url: compoundURL
			}).should((response) => {
				expect(response.status).to.be.eq(200);
				expect(response.body.comments).to.be.an('array');
				expect(response.body.comments).to.have.lengthOf(1);
				expect(response.body.comments[0]._id).to.be.an('string');
				expect(response.body.comments[0].comment).to.be.an('string');
				expect(response.body.comments[0].source).to.be.an('string');
				expect(response.body.comments[0].userId).to.be.an('string');
				cy.readFile(`${filesPath}/comment.json`).then((comment) => {
					expect(response.body.comments[0].comment).to.be.eq(comment.comment);
					expect(response.body.comments[0].source).to.be.eq(comment.source);
					expect(response.body.comments[0].userId).to.be.eq(comment.userId);
				});
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/services/:servicesId/comments - Add Comments To Service - Bad Comment No Body', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org._id}${route_services}/${org.services[0]._id}${route_comments}`;
			cy.request({
				method: 'PATCH',
				url: compoundURL,
				failOnStatusCode: false,
				body: {}
			}).should((response) => {
				expect(response.status).to.be.eq(400);
				expect(response.body.error).to.be.an('boolean');
				expect(response.body.error).to.be.eq(true);
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/services/:servicesId/comments - Add Comments To Org Services - Good Comment', () => {
		cy.fixture('auth_user_id.json').then((user) => {
			cy.readFile(`${filesPath}/org_created.json`).then((org) => {
				compoundURL = `${url}${version}${route_organizations}/${org._id}${route_services}/${org.services[0]._id}${route_comments}`;
				let comment = {
					userId: user.id,
					comment: 'this is a service test comment',
					source: 'Test Service Source'
				};
				//save comment
				cy.writeFile(`${filesPath}/comment_service.json`, comment);

				cy.request({
					method: 'PATCH',
					url: compoundURL,
					body: comment
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body.updated).to.be.an('boolean');
					expect(response.body.updated).to.be.eq(true);
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services/:serviceId/comments - Get Organization Service comments', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org._id}${route_services}/${org.services[0]._id}${route_comments}`;
			cy.request({
				method: 'GET',
				url: compoundURL
			}).should((response) => {
				expect(response.status).to.be.eq(200);
				expect(response.body.comments).to.be.an('array');
				expect(response.body.comments).to.have.lengthOf(1);
				expect(response.body.comments[0]._id).to.be.an('string');
				expect(response.body.comments[0].comment).to.be.an('string');
				expect(response.body.comments[0].source).to.be.an('string');
				expect(response.body.comments[0].userId).to.be.an('string');
				cy.readFile(`${filesPath}/comment_service.json`).then((comment) => {
					expect(response.body.comments[0].comment).to.be.eq(comment.comment);
					expect(response.body.comments[0].source).to.be.eq(comment.source);
					expect(response.body.comments[0].userId).to.be.eq(comment.userId);
				});
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
