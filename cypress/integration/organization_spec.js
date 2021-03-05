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
const route_org = '/organizations';
const route_org_count = `/${route_org}/count`;
const route_org_name = `/${route_org}/name`;

//Test Suite
describe('Organization Routers', () => {
	it('GET - /organizations - Get Organizations', () => {
		compoundURL = `${url}${version}${route_org}`;
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body).to.not.be.empty;
			expect(response.body.organizations).to.be.an('array');
			expect(response.body.organizations).to.be.an('array').that.is.not.empty;
			//Check required fields in an org object
			expect(response.body.organizations[0]._id).to.be.an('string');
			expect(response.body.organizations[0].is_published).to.be.an('boolean');
			expect(response.body.organizations[0].name).to.be.an('string');
			expect(response.body.organizations[0].verified_at).to.be.an('string');
			expect(response.body.organizations[0].website).to.be.an('string');
			//Save data of an org good and bad
			cy.writeFile(`${filesPath}/org_good.json`, {
				_id: response.body.organizations[0]._id,
				name: response.body.organizations[0].name,
				slug: response.body.organizations[0].slug
			});
			cy.writeFile(`${filesPath}/org_bad.json`, {
				_id: 'wwerfgewfwefwe',
				name: 'Bad name',
				slug: 'Bad Slug'
			});
			//Save actual org data
			cy.writeFile(
				`${filesPath}/org_data.json`,
				response.body.organizations[0]
			);
		});
	});

	it('GET- /Organizations/count - Get Organizations Count', () => {
		compoundURL = `${url}${version}${route_org_count}`;
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body).to.be.an('object');
			expect(response.body).to.not.be.empty;
			expect(response.body.count).to.be.an('number');
			expect(response.body.count).to.be.greaterThan(0);
			expect(response.body.pages).to.be.an('number');
			expect(response.body.pages).to.be.greaterThan(0);
		});
	});

	it('GET - /organizations/:orgId - Get Org Data from Id - Good ID', () => {
		compoundURL = `${url}${version}${route_org}`;
		cy.readFile(`${filesPath}/org_good.json`).then((object) => {
			cy.request({
				method: 'GET',
				url: `${compoundURL}/${object._id}`
			}).should((response) => {
				expect(response.status).to.be.eq(200);
				expect(response.body).to.be.not.empty;
				cy.readFile(`${filesPath}/org_data.json`).then((object) => {
					//Ensure returned org is the same
					expect(response.body.is_published).to.be.eq(object.is_published);
					expect(response.body._id).to.be.eq(object._id);
					expect(response.body.name).to.be.eq(object.name);
					expect(response.body.slug).to.be.eq(object.slug);
					expect(response.body.verified_at).to.be.eq(object.verified_at);
				});
			});
		});
	});

	it('GET - /organizations/:orgId - Get Org Data from Id - Bad ID', () => {
		compoundURL = `${url}${version}${route_org}`;
		cy.readFile(`${filesPath}/org_bad.json`).then((object) => {
			cy.request({
				method: 'GET',
				url: `${compoundURL}/${object._id}`,
				failOnStatusCode: false
			}).should((response) => {
				expect(response.status).to.be.eq(500);
				expect(response.body.error).to.be.an('boolean');
				expect(response.body.error).to.be.eq(true);
			});
		});
	});

	it('GET - /organizations/name/:name - Get Org Data from name - Good name', () => {
		compoundURL = `${url}${version}${route_org_name}`;
		cy.readFile(`${filesPath}/org_good.json`).then((object) => {
			cy.request({
				method: 'GET',
				url: `${compoundURL}/${object.name}`
			}).should((response) => {
				expect(response.status).to.be.eq(200);
				expect(response.body).to.be.not.empty;
				//Ensure returned org is the same
				expect(response.body.organizations[0]._id).to.be.eq(object._id);
				expect(response.body.organizations[0].name).to.be.eq(object.name);
				expect(response.body.organizations[0].slug).to.be.eq(object.slug);
			});
		});
	});

	it('GET - /organizations/name/:name - Get Org Data from name - Bad name', () => {
		compoundURL = `${url}${version}${route_org_name}`;
		cy.readFile(`${filesPath}/org_bad.json`).then((object) => {
			cy.request({
				method: 'GET',
				url: `${compoundURL}/${object.name}`,
				failOnStatusCode: false
			}).should((response) => {
				expect(response.status).to.be.eq(200);
				expect(response.body.organizations).to.be.an('array').that.is.empty;
				expect(response.body.organizations).to.have.lengthOf(0);
			});
		});
	});

	it('POST - /organizations - Create Organization', () => {
		compoundURL = `${url}${version}${route_org}`;
		//Get Org Data
		cy.fixture('org_good_format.json').then((org_data) => {
			cy.request({
				method: 'POST',
				url: compoundURL,
				body: org_data
			}).should((response) => {
				expect(response.status).to.be.eq(200);
				expect(response.body.created).to.be.an('boolean');
				expect(response.body.created).to.be.eq(true);
				//Check required fields in an org object
				expect(response.body.organization._id).to.be.an('string');
				expect(response.body.organization.is_published).to.be.an('boolean');
				expect(response.body.organization.name).to.be.an('string');
				expect(response.body.organization.website).to.be.an('string');
				expect(response.body.organization.name).to.be.eq(org_data.name);
				expect(response.body.organization.website).to.be.eq(org_data.website);
				expect(response.body.organization.description).to.be.eq(
					org_data.description
				);
				//Save Created Org Data
				cy.writeFile(`${filesPath}/created_org_data.json`, response.body);
			});
		});
	});

	it('PATCH - /organizations - Update Organization - Good Data', () => {
		compoundURL = `${url}${version}${route_org}`;
		//Get Org Data
		cy.fixture('org_good_format_update.json').then((org_data_updated) => {
			cy.readFile(`${filesPath}/created_org_data.json`).then(
				(original_org_data) => {
					cy.request({
						method: 'PATCH',
						url: `${compoundURL}/${original_org_data.organization._id}`,
						body: org_data_updated
					}).should((response) => {
						expect(response.status).to.be.eq(200);
						expect(response.body.updated).to.be.an('boolean');
						expect(response.body.updated).to.be.eq(true);

						//Get Org Data from DB and compared with Org data used to update
						cy.getOrgById(original_org_data.organization._id).then(
							(retrieved_org) => {
								expect(retrieved_org.body._id).to.be.an('string');
								expect(retrieved_org.body.is_published).to.be.an('boolean');
								expect(retrieved_org.body.name).to.be.an('string');
								expect(retrieved_org.body.website).to.be.an('string');
								expect(retrieved_org.body.name).to.be.eq(org_data_updated.name);
								expect(retrieved_org.body.website).to.be.eq(
									org_data_updated.website
								);
								expect(retrieved_org.body.website).to.be.eq(
									org_data_updated.website
								);

								//Check that it is not equal to inital object
								cy.fixture('org_good_format.json').then((org_data) => {
									expect(retrieved_org.body._id).to.be.an('string');
									expect(retrieved_org.body.is_published).to.be.an('boolean');
									expect(retrieved_org.body.name).to.be.an('string');
									expect(retrieved_org.body.website).to.be.an('string');
									expect(retrieved_org.body.name).to.be.not.eq(org_data.name);
									expect(retrieved_org.body.website).to.be.not.eq(
										org_data.website
									);
									expect(retrieved_org.body.website).to.be.not.eq(
										org_data.website
									);
								});

								//Save Created Org Data
								cy.writeFile(
									`${filesPath}/created_org_data_updated.json`,
									response.body
								);
							}
						);
					});
				}
			);
		});
	});

	it('PATCH - /organizations - Update Organization - Bad Data', () => {
		compoundURL = `${url}${version}${route_org}`;
		//Get Org Data
		cy.fixture('org_good_format_update.json').then((org_data_updated) => {
			cy.request({
				method: 'PATCH',
				url: `${compoundURL}/baaaaaaaadID`,
				body: org_data_updated,
				failOnStatusCode: false
			}).should((response) => {
				expect(response.status).to.be.eq(404);
				expect(response.body.notFound).to.be.an('boolean');
				expect(response.body.notFound).to.be.eq(true);
			});
		});
	});

	it('DELETE - /organizations - Delete Organization - Good Data and authenticated', () => {
		compoundURL = `${url}${version}${route_org}`;
		//Get Org Data
		cy.readFile(`${filesPath}/created_org_data.json`).then((org_data) => {
			cy.request({
				method: 'DELETE',
				url: `${compoundURL}/${org_data.organization._id}`
			}).should((response) => {
				expect(response.status).to.be.eq(200);
				expect(response.body.deleted).to.be.an('boolean');
				expect(response.body.deleted).to.be.eq(true);
			});
		});
	});

	// it('POST - /organizations/:orgId/owners - Add Organization Owners', () => {
	// 	//Get User
	// 	cy.fixture('auth_user_good_creds').then((creds)=>{
	// 		//Login
	// 		cy.login(creds).then((response) => {
	// 			//Save User info
	// 			cy.writeFile(`${filesPath}/authenticated_user.json`,response.body);
	// 		});
	// 	})

	// 	//Get Org Data
	// 	cy.fixture('org_good_format.json').then((org_data) => {
	// 		cy.addOrg(org_data).then((org_response) => {
	// 			cy.readFile('authenticated_user.json').then((creds) => {
	// 				compoundURL = `${url}${version}${route_org}/${org_response.body.organization._id}/owners`;
	// 				// cy.request({
	// 				// 	method: 'POST',
	// 				// 	url: compoundURL,
	// 				// 	body: creds
	// 				// })
	// 				cy.log(creds);
	// 				expect(true).to.be.eq(true);
	// 			})

	// 		})

	// 	})
	// })

	after(() => {
		//Delete temp_data folder
		cy.exec(`rm -fr ${filesPath}`);
	});
});
