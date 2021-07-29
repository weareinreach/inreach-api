/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;

//Test Suite
describe('Organization Routers', () => {
	beforeEach(() => {
		//Loading Necessary Fixtures
		cy.fixture('user_new.json').as('new_user');
		cy.fixture('org_good_format.json').as('organization');
		cy.fixture('org_good_format_update.json').as('organization_updated');
	});
	afterEach(() => {
		//Do the clean up
		cy.deleteUsersIfExist();
		cy.deleteOrgsIfExist();
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
		});
	});

	it.only('GET - /v1/organizations?query - Get Organizations Query', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`?name=${createdOrgResponse.body.organization.name}&pending&services=Medical`
				);
				cy.log(compoundURL);
				cy.request({
					method: 'GET',
					url: compoundURL
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body).to.not.be.empty;
					expect(response.body.organizations).to.be.an('array');
					expect(response.body.organizations).to.be.an('array').that.is.not
						.empty;
					//Check required fields in an org object
					expect(response.body.organizations[0]._id).to.be.an('string');
					expect(response.body.organizations[0].is_published).to.be.an(
						'boolean'
					);
					expect(response.body.organizations[0].name).to.be.an('string');
					expect(response.body.organizations[0].website).to.be.an('string');
					//Check for the query
					expect(response.body.organizations[0]._id).to.be.eq(
						createdOrgResponse.body.organization._id
					);
					expect(response.body.organizations[0].name).to.be.eq(
						createdOrgResponse.body.organization.name
					);
					expect(response.body.organizations[0].website).to.be.eq(
						createdOrgResponse.body.organization.website
					);
					expect(response.body.organizations[0].is_published).to.be.eq(
						createdOrgResponse.body.organization.is_published
					);
				});
			});
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
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${createdOrgResponse.body.organization._id}`
				);
				cy.request({
					method: 'GET',
					url: compoundURL
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body).to.be.not.empty;
					//Ensure returned org is the same
					expect(response.body.is_published).to.be.eq(
						createdOrgResponse.body.organization.is_published
					);
					expect(response.body._id).to.be.eq(
						createdOrgResponse.body.organization._id
					);
					expect(response.body.name).to.be.eq(
						createdOrgResponse.body.organization.name
					);
					expect(response.body.slug).to.be.eq(
						createdOrgResponse.body.organization.slug
					);
					expect(response.body.verified_at).to.be.eq(
						createdOrgResponse.body.organization.verified_at
					);
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId - Get Org Data from Id - Bad ID', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_organizations'),
			'/wertwrtw34t34t3t434gfer'
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
	});

	it('GET - /v1/organizations/name/:name - Get Org Data from name - Good name', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations_name'),
					`/${createdOrgResponse.body.organization.name}`
				);
				cy.request({
					method: 'GET',
					url: compoundURL
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body).to.be.not.empty;
					//Ensure returned org is the same
					expect(response.body.organizations[0]._id).to.be.eq(
						createdOrgResponse.body.organization._id
					);
					expect(response.body.organizations[0].name).to.be.eq(
						createdOrgResponse.body.organization.name
					);
					expect(response.body.organizations[0].slug).to.be.eq(
						createdOrgResponse.body.organization.slug
					);
				});
			});
		});
	});

	it('GET - /v1/organizations/name/:name - Get Org Data from name - Bad name', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_organizations_name'),
			'/Very Crazy Org Name'
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
	});

	it('POST - /v1/organizations - Create Organization', () => {
		cy.get('@organization').then((org) => {
			compoundURL = Cypress.env('baseUrl').concat(
				Cypress.env('version'),
				Cypress.env('route_organizations')
			);
			//Get Org Data
			cy.request({
				method: 'POST',
				url: compoundURL,
				body: org
			}).should((response) => {
				expect(response.status).to.be.eq(200);
				expect(response.body.created).to.be.an('boolean');
				expect(response.body.created).to.be.eq(true);
				//Check required fields in an org object
				expect(response.body.organization._id).to.be.an('string');
				expect(response.body.organization.is_published).to.be.an('boolean');
				expect(response.body.organization.name).to.be.an('string');
				expect(response.body.organization.website).to.be.an('string');
				expect(response.body.organization.name).to.be.eq(org.name);
				expect(response.body.organization.website).to.be.eq(org.website);
				expect(response.body.organization.description).to.be.eq(
					org.description
				);
			});
		});
	});

	it('PATCH - /v1/organizations - Update Organization - Good Data', () => {
		cy.get('@organization').then((org) => {
			cy.get('@organization_updated').then((org_updated) => {
				cy.addOrg(org).then((createdOrgResponse) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations'),
						`/${createdOrgResponse.body.organization._id}`
					);
					cy.request({
						method: 'PATCH',
						url: compoundURL,
						body: org_updated
					}).should((response) => {
						expect(response.status).to.be.eq(200);
						expect(response.body.updated).to.be.an('boolean');
						expect(response.body.updated).to.be.eq(true);
					});
					//Get Org Data from DB and compared with Org data used to update
					cy.getOrgById(createdOrgResponse.body.organization._id).then(
						(retrieved_org) => {
							expect(retrieved_org.body._id).to.be.an('string');
							expect(retrieved_org.body.is_published).to.be.an('boolean');
							expect(retrieved_org.body.name).to.be.an('string');
							expect(retrieved_org.body.website).to.be.an('string');
							expect(retrieved_org.body.name).to.be.eq(org_updated.name);
							expect(retrieved_org.body.website).to.be.eq(org_updated.website);
							expect(retrieved_org.body.slug).to.be.eq(org_updated.slug);

							//Check that it is not equal to inital object								expect(retrieved_org.body._id).to.be.an('string');
							expect(retrieved_org.body.is_published).to.be.an('boolean');
							expect(retrieved_org.body.name).to.be.an('string');
							expect(retrieved_org.body.website).to.be.an('string');
							expect(retrieved_org.body.name).to.be.not.eq(org.name);
							expect(retrieved_org.body.website).to.be.not.eq(org.website);
							expect(retrieved_org.body.website).to.be.not.eq(org.website);
						}
					);
				});
			});
		});
	});

	it('PATCH - /v1/organizations - Update Organization - Bad Data', () => {
		//Get Org Data
		cy.get('@organization_updated').then((org_updated) => {
			compoundURL = Cypress.env('baseUrl').concat(
				Cypress.env('version'),
				Cypress.env('route_organizations'),
				'/baaaaaaaadID'
			);
			cy.request({
				method: 'PATCH',
				url: compoundURL,
				body: org_updated,
				failOnStatusCode: false
			}).should((response) => {
				expect(response.status).to.be.eq(404);
				expect(response.body.notFound).to.be.an('boolean');
				expect(response.body.notFound).to.be.eq(true);
			});
		});
	});

	it('POST - /v1/organizations/:orgId/owners - Add Organization Owners', () => {
		cy.get('@new_user').then((user) => {
			cy.get('@organization').then((org) => {
				cy.addUser(user).then((addedUserResponse) => {
					cy.addOrg(org).then((createdOrgResponse) => {
						compoundURL = Cypress.env('baseUrl').concat(
							Cypress.env('version'),
							Cypress.env('route_organizations'),
							`/${createdOrgResponse.body.organization._id}`,
							Cypress.env('route_organizations_owners')
						);
						cy.request({
							method: 'POST',
							url: compoundURL,
							body: {
								email: addedUserResponse.body.userInfo.email,
								userId: addedUserResponse.body.userInfo._id
							}
						}).should((response) => {
							expect(response.status).to.be.eq(200);
							expect(response.body.created).to.be.an('boolean');
							expect(response.body.created).to.be.eq(true);
						});
					});
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/owners/:userId/approve - Approve Organization Owner - Good Data', () => {
		cy.get('@new_user').then((user) => {
			cy.get('@organization').then((org) => {
				cy.addUser(user).then((addedUserResponse) => {
					cy.addOrg(org).then((createdOrgResponse) => {
						cy.addOrgOwner(
							createdOrgResponse.body.organization._id,
							addedUserResponse.body.userInfo._id,
							addedUserResponse.body.userInfo.email
						).then(() => {
							compoundURL = Cypress.env('baseUrl').concat(
								Cypress.env('version'),
								Cypress.env('route_organizations'),
								`/${createdOrgResponse.body.organization._id}`,
								Cypress.env('route_organizations_owners'),
								`/${addedUserResponse.body.userInfo._id}`,
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
						});
					});
				});
			});
		});
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

	it('DELETE - /v1/organizations/:orgId/owners/:userId - Remove Organization Owner - Good Data', () => {
		cy.get('@new_user').then((user) => {
			cy.get('@organization').then((org) => {
				cy.addUser(user).then((addedUserResponse) => {
					cy.addOrg(org).then((createdOrgResponse) => {
						cy.addOrgOwner(
							createdOrgResponse.body.organization._id,
							addedUserResponse.body.userInfo._id,
							addedUserResponse.body.userInfo.email
						).then(() => {
							compoundURL = Cypress.env('baseUrl').concat(
								Cypress.env('version'),
								Cypress.env('route_organizations'),
								`/${createdOrgResponse.body.organization._id}`,
								Cypress.env('route_organizations_owners'),
								`/${addedUserResponse.body.userInfo._id}`
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

	it('POST - /v1/mail - Send Mail', () => {
		cy.get('@new_user').then((user) => {
			cy.get('@organization').then((org) => {
				cy.addOrg(org).then((createdOrgResponse) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations_mail')
					);
					//Approve Email
					cy.request({
						method: 'POST',
						url: compoundURL,
						body: {
							ownerStatus: 'approve',
							org: createdOrgResponse.body.organization.name,
							recipient: user.email
						}
					}).should((response) => {
						expect(response.status).to.be.eq(200);
						expect(response.body.message).to.be.an('string');
						expect(response.body.message).to.be.eq('Your query has been sent');
					});

					//Denial Email
					cy.request({
						method: 'POST',
						url: compoundURL,
						body: {
							ownerStatus: 'deny',
							org: createdOrgResponse.body.organization.name,
							recipient: user.email
						}
					}).should((response) => {
						expect(response.status).to.be.eq(200);
						expect(response.body.message).to.be.an('string');
						expect(response.body.message).to.be.eq('Your query has been sent');
					});
				});
			});
		});
	});

	it('DELETE - /v1/organizations - Delete Organization - Good Data and authenticated', () => {
		//Get Org Data
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${createdOrgResponse.body.organization._id}`
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

	it('POST - /v1/organizations/:orgId/share - Share Organization - Good Data', () => {
		cy.fixture('user_share_resource.json').then((share_user) => {
			cy.get('@organization').then((org) => {
				cy.addOrg(org).then((createdOrgResponse) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations'),
						`/${createdOrgResponse.body.organization._id}`,
						Cypress.env('route_share')
					);
					cy.request({
						method: 'POST',
						url: compoundURL,
						body: {
							email: `${share_user.email}`,
							shareType: 'resource',
							shareUrl: `cool-org`
						}
					}).should((response) => {
						expect(response.status).to.be.eq(200);
						expect(response.body.updated).to.be.an('boolean');
						expect(response.body.updated).to.be.eq(true);
						expect(response.body.sent).to.be.an('boolean');
						expect(response.body.sent).to.be.eq(true);
						expect(response.body.resource).to.exist;
						expect(response.body.resource._id).to.eq(
							createdOrgResponse.body.organization._id
						);
					});
				});
			});
		});
	});

	it('POST - /v1/organizations/:orgId/share - Share Organization - Bad Data', () => {
		cy.fixture('user_share_resource.json').then((share_user) => {
			cy.get('@organization').then((org) => {
				cy.addOrg(org).then((createdOrgResponse) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations'),
						`/${createdOrgResponse.body.organization._id}`,
						Cypress.env('route_share')
					);
					cy.request({
						method: 'POST',
						url: compoundURL,
						body: {
							email: `${share_user.email}`
						},
						failOnStatusCode: false
					}).should((response) => {
						expect(response.status).to.be.eq(400);
						expect(response.body.error).to.be.an('boolean');
						expect(response.body.error).to.be.eq(true);
					});
				});
			});
		});
	});

	after(() => {
		cy.exec('rm -fr '.concat(Cypress.env('filePath')));
	});
});
