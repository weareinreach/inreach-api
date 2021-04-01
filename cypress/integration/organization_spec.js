/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;

//Test Suite
describe('Organization Routers', () => {
	before(() => {
		cy.fixture('user_new.json').then((user) => {
			cy.addUser(user).then((response) => {
				cy.writeFile(
					Cypress.env('filePath').concat('/user.json'),
					response.body
				);
			});
		});
	});

	it('GET - /v1/organizations - Get Organizations', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_organizations')
		);
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
			cy.writeFile(Cypress.env('filePath').concat('/org_good.json'), {
				_id: response.body.organizations[0]._id,
				name: response.body.organizations[0].name,
				slug: response.body.organizations[0].slug
			});
			cy.writeFile(Cypress.env('filePath').concat('/org_bad.json'), {
				_id: 'wwerfgewfwefwe',
				name: 'Bad name',
				slug: 'Bad Slug'
			});
			//Save actual org data
			cy.writeFile(
				Cypress.env('filePath').concat('/org_data.json'),
				response.body.organizations[0]
			);
		});
	});

	it('GET - /v1/Organizations/count - Get Organizations Count', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_organizations_count')
		);
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

	it('GET - /v1/organizations/:orgId - Get Org Data from Id - Good ID', () => {
		cy.readFile(Cypress.env('filePath').concat('/org_good.json')).then(
			(object) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${object._id}`
				);
				cy.request({
					method: 'GET',
					url: compoundURL
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body).to.be.not.empty;
					cy.readFile(Cypress.env('filePath').concat('/org_data.json')).then(
						(object) => {
							//Ensure returned org is the same
							expect(response.body.is_published).to.be.eq(object.is_published);
							expect(response.body._id).to.be.eq(object._id);
							expect(response.body.name).to.be.eq(object.name);
							expect(response.body.slug).to.be.eq(object.slug);
							expect(response.body.verified_at).to.be.eq(object.verified_at);
						}
					);
				});
			}
		);
	});

	it('GET - /v1/organizations/:orgId - Get Org Data from Id - Bad ID', () => {
		cy.readFile(Cypress.env('filePath').concat('/org_bad.json')).then(
			(object) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${object._id}`
				);
				cy.request({
					method: 'GET',
					url: compoundURL,
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(500);
					expect(response.body.error).to.be.an('boolean');
					expect(response.body.error).to.be.eq(true);
				});
			}
		);
	});

	it('GET - /v1/organizations/name/:name - Get Org Data from name - Good name', () => {
		cy.readFile(Cypress.env('filePath').concat('/org_good.json')).then(
			(object) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations_name'),
					`/${object.name}`
				);
				cy.request({
					method: 'GET',
					url: compoundURL
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body).to.be.not.empty;
					//Ensure returned org is the same
					expect(response.body.organizations[0]._id).to.be.eq(object._id);
					expect(response.body.organizations[0].name).to.be.eq(object.name);
					expect(response.body.organizations[0].slug).to.be.eq(object.slug);
				});
			}
		);
	});

	it('GET - /v1/organizations/name/:name - Get Org Data from name - Bad name', () => {
		cy.readFile(Cypress.env('filePath').concat('/org_bad.json')).then(
			(object) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations_name'),
					`/${object.name}`
				);
				cy.request({
					method: 'GET',
					url: compoundURL,
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body.organizations).to.be.an('array').that.is.empty;
					expect(response.body.organizations).to.have.lengthOf(0);
				});
			}
		);
	});

	it('POST - /v1/organizations - Create Organization', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_organizations')
		);
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
				cy.writeFile(
					Cypress.env('filePath').concat('/created_org_data.json'),
					response.body
				);
			});
		});
	});

	it('PATCH - /v1/organizations - Update Organization - Good Data', () => {
		//Get Org Data
		cy.fixture('org_good_format_update.json').then((org_data_updated) => {
			cy.readFile(
				Cypress.env('filePath').concat('/created_org_data.json')
			).then((original_org_data) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${original_org_data.organization._id}`
				);
				cy.request({
					method: 'PATCH',
					url: compoundURL,
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
								Cypress.env('filePath').concat(
									'/created_org_data_updated.json'
								),
								response.body
							);
						}
					);
				});
			});
		});
	});

	it('PATCH - /v1/organizations - Update Organization - Bad Data', () => {
		//Get Org Data
		cy.fixture('org_good_format_update.json').then((org_data_updated) => {
			compoundURL = Cypress.env('baseUrl').concat(
				Cypress.env('version'),
				Cypress.env('route_organizations'),
				'/baaaaaaaadID'
			);
			cy.request({
				method: 'PATCH',
				url: compoundURL,
				body: org_data_updated,
				failOnStatusCode: false
			}).should((response) => {
				expect(response.status).to.be.eq(404);
				expect(response.body.notFound).to.be.an('boolean');
				expect(response.body.notFound).to.be.eq(true);
			});
		});
	});

	it('POST - /v1/organizations/:orgId/owners - Add Organization Owners', () => {
		//Get User ID
		cy.readFile(Cypress.env('filePath').concat('/user.json')).then((user) => {
			cy.readFile(
				Cypress.env('filePath').concat('/created_org_data.json')
			).then((org_data) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${org_data.organization._id}`,
					Cypress.env('route_organizations_owners')
				);
				cy.request({
					method: 'POST',
					url: compoundURL,
					body: {
						email: user.userInfo.email,
						userId: user.userInfo._id
					}
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body.created).to.be.an('boolean');
					expect(response.body.created).to.be.eq(true);
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/owners/:userId/approve - Approve Organization Owner - Good Data', () => {
		cy.readFile(Cypress.env('filePath').concat('/created_org_data.json')).then(
			(org_data) => {
				cy.readFile(Cypress.env('filePath').concat('/user.json')).then(
					(user) => {
						compoundURL = Cypress.env('baseUrl').concat(
							Cypress.env('version'),
							Cypress.env('route_organizations'),
							`/${org_data.organization._id}`,
							Cypress.env('route_organizations_owners'),
							`/${user.userInfo._id}`,
							Cypress.env('route_organizations_approve')
						);
						cy.request({
							method: 'GET',
							url: compoundURL
						}).should((response) => {
							expect(response.status).to.be.eq(200);
							expect(response.body.updated).to.be.an('boolean');
							expect(response.body.updated).to.be.eq(true);
						});
					}
				);
			}
		);
	});

	it('GET - /v1/organizations/:orgId/owners/:userId/approve - Approve Organization Owner - Bad Data', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_organizations'),
			'/badOrg',
			Cypress.env('route_organizations_owners'),
			'/badUserData',
			Cypress.env('route_organizations_approve')
		);
		cy.request({
			method: 'GET',
			url: compoundURL,
			failOnStatusCode: false
		}).should((response) => {
			expect(response.status).to.be.eq(500);
		});
	});

	it('DELETE - /v1/organizations/:orgId/owners/:userId - Approve Organization Owner - Good Data', () => {
		cy.readFile(Cypress.env('filePath').concat('/created_org_data.json')).then(
			(org_data) => {
				cy.readFile(Cypress.env('filePath').concat('/user.json')).then(
					(user) => {
						compoundURL = Cypress.env('baseUrl').concat(
							Cypress.env('version'),
							Cypress.env('route_organizations'),
							`/${org_data.organization._id}`,
							Cypress.env('route_organizations_owners'),
							`/${user.userInfo._id}`
						);
						cy.request({
							method: 'DELETE',
							url: compoundURL
						}).should((response) => {
							expect(response.status).to.be.eq(200);
							expect(response.body.deleted).to.be.an('boolean');
							expect(response.body.deleted).to.be.eq(true);
						});
					}
				);
			}
		);
	});

	it('POST - /v1/mail - Send Mail', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_organizations_mail')
		);
		cy.readFile(Cypress.env('filePath').concat('/created_org_data.json')).then(
			(org_data) => {
				cy.readFile(Cypress.env('filePath').concat('/user.json')).then(
					(user) => {
						//Approve Email
						cy.request({
							method: 'POST',
							url: compoundURL,
							body: {
								ownerStatus: 'approve',
								org: org_data.organization.name,
								recipient: user.userInfo.email
							}
						}).should((response) => {
							expect(response.status).to.be.eq(200);
							expect(response.body.message).to.be.an('string');
							expect(response.body.message).to.be.eq(
								'Your query has been sent'
							);
						});

						//Denial Email
						cy.request({
							method: 'POST',
							url: compoundURL,
							body: {
								ownerStatus: 'deny',
								org: org_data.organization.name,
								recipient: user.userInfo.email
							}
						}).should((response) => {
							expect(response.status).to.be.eq(200);
							expect(response.body.message).to.be.an('string');
							expect(response.body.message).to.be.eq(
								'Your query has been sent'
							);
						});
					}
				);
			}
		);
	});

	it('DELETE - /v1/organizations - Delete Organization - Good Data and authenticated', () => {
		//Get Org Data
		cy.readFile(Cypress.env('filePath').concat('/created_org_data.json')).then(
			(org_data) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${org_data.organization._id}`
				);
				cy.request({
					method: 'DELETE',
					url: compoundURL
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body.deleted).to.be.an('boolean');
					expect(response.body.deleted).to.be.eq(true);
				});
			}
		);
	});

	after(() => {
		//Delete temp_data folder
		cy.readFile(Cypress.env('filePath').concat('/user.json')).then((user) => {
			cy.deleteUser(user.userInfo._id);
			cy.exec('rm -fr '.concat(Cypress.env('filePath')));
		});
	});
});
