/* eslint-disable no-undef */
/// <reference types="cypress" />
import updateLocation from '../fixtures/org_location_update.json';
import multiplePrimaryLocationUpdate from '../fixtures/org_location_update_bad.json';
import multipleLocationUpdate from '../fixtures/org_multiple_location_update_bad.json';
import locationWithNoCoordinates from '../fixtures/org_location_update_bad2.json';
//compound url
let compoundURL = null;

//Test Suite
describe('Organization Routers', () => {
	beforeEach(() => {
		//Loading Necessary Fixtures
		cy.fixture('user_new.json').as('new_user');
		cy.fixture('org_good_format.json').as('organization');
		cy.fixture('org_good_format_update.json').as('organization_updated');
		cy.fixture('note.json').as('note');
		cy.fixture('org_locations_update_bad_no_coordinates.json').as(
			'organization_bad_location'
		);
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

	it('GET - /v1/organizations?query - Get Organizations Query - good query', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`?ids=${createdOrgResponse.body.organization._id}&createdAt=${createdOrgResponse.body.organization.created_at}&createdStart=${createdOrgResponse.body.organization.created_at}`
				);
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

	it('GET - /v1/organizations?query - Get Organizations Query - No Result', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				//Test Services OR
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`?name=${createdOrgResponse.body.organization.name}&lastVerified=06/05/2021&createdAt=06/05/2021&lastUpdated=06/05/2021&deleted=false&pending=true&pendingOwnership=false&serviceArea=Medical,Legal&tags=Legal`
				);
				cy.request({
					method: 'GET',
					url: compoundURL
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body).to.not.be.empty;
					expect(response.body.organizations).to.be.an('array');
					expect(response.body.organizations).to.be.an('array').that.is.empty;
				});

				//Test Services AND
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`?name=Surprisingly&lastVerified=06/05/2021&createdAt=06/05/2021&lastUpdated=06/05/2021&pending=true&pendingOwnership=false&serviceArea=Medical,Legal&tags=Legal&tagLocale=US`
				);
				cy.request({
					method: 'GET',
					url: compoundURL
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body).to.not.be.empty;
					expect(response.body.organizations).to.be.an('array');
					expect(response.body.organizations).to.be.an('array').that.is.empty;
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

	it('GET - /v1/organizations/:orgId - Get Org Data from Id - Non Existent ID', () => {
		cy.generateObjectId().then((generateObjectId) => {
			compoundURL = Cypress.env('baseUrl').concat(
				Cypress.env('version'),
				Cypress.env('route_organizations'),
				`/${generateObjectId}`
			);
			cy.request({
				method: 'GET',
				url: compoundURL,
				failOnStatusCode: false
			}).should((response) => {
				expect(response.status).to.be.eq(404);
				expect(response.body.notFound).to.be.an('boolean');
				expect(response.body.notFound).to.be.eq(true);
			});
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

	it('POST - /v1/organizations - Create Organization - Bad Location Data', () => {
		cy.get('@organization_bad_location').then((org) => {
			compoundURL = Cypress.env('baseUrl').concat(
				Cypress.env('version'),
				Cypress.env('route_organizations')
			);
			//Get Org Data
			cy.request({
				method: 'POST',
				url: compoundURL,
				body: org,
				failOnStatusCode: false
			}).should((response) => {
				expect(response.status).to.be.eq(500);
				expect(response.body.error).to.be.an('boolean');
				expect(response.body.error).to.be.eq(true);
				expect(response.body.message).to.be.an('string');
				expect(response.body.message).to.be.eq(
					'Longitude and Latitude are required fields'
				);
			});
		});
	});

	it('POST - /v1/organizations - Create Organization - No Body', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_organizations')
		);
		cy.request({
			method: 'POST',
			url: compoundURL,
			failOnStatusCode: false
		}).should((response) => {
			expect(response.status).to.be.eq(400);
			expect(response.body.error).to.be.an('boolean');
			expect(response.body.error).to.be.eq(true);
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

							//Check that it is not equal to inital object
							expect(retrieved_org.body._id).to.be.an('string');
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

	it('PATCH - /v1/organizations - Update Organization - No Data', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${createdOrgResponse.body.organization._id}`
				);
				cy.request({
					method: 'PATCH',
					url: compoundURL,
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(400);
					expect(response.body.error).to.be.an('boolean');
					expect(response.body.error).to.be.eq(true);
				});
			});
		});
	});

	it('PATCH - /v1/organizations - Add Location', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${createdOrgResponse.body.organization._id}`
				);
				cy.request({
					method: 'PATCH',
					url: compoundURL,
					body: {
						locations: updateLocation
					}
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body.updated).to.be.an('boolean');
					expect(response.body.updated).to.be.eq(true);
				});
				cy.request({
					method: 'GET',
					url: compoundURL
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body).to.be.not.empty;
					expect(response.body.locations).to.be.an('array');
					expect(response.body.locations[0].is_primary).to.be.eq(true);
				});
				cy.request({
					method: 'PATCH',
					url: compoundURL,
					body: {
						locations: multiplePrimaryLocationUpdate
					},
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(500);
					expect(response.body.error).to.be.an('boolean');
					expect(response.body.error).to.be.eq(true);
					expect(response.body.message).to.be.eq(
						'Organization can only have one primary location'
					);
				});
				cy.request({
					method: 'PATCH',
					url: compoundURL,
					body: {
						locations: multipleLocationUpdate
					},
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(500);
					expect(response.body.error).to.be.an('boolean');
					expect(response.body.error).to.be.eq(true);
					expect(response.body.message).to.be.eq(
						'Organization must have a primary location'
					);
				});
				//hotfix - https://app.asana.com/0/1132189118126148/1201710885977989
				//defaulting goecode so don't need this test at the moment
				// cy.request({
				// 	method: 'PATCH',
				// 	url: compoundURL,
				// 	body: {locations: locationWithNoCoordinates},
				// 	failOnStatusCode: false
				// }).should((response) => {
				// 	expect(response.status).to.be.eq(500);
				// 	expect(response.body.error).to.be.an('boolean');
				// 	expect(response.body.error).to.be.eq(true);
				// 	expect(response.body.message).to.be.eq(
				// 		'Longitude and Latitude are required fields'
				// 	);
				// });
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

	it('POST - /v1/organizations/:orgId/owners - Add Organization Owners - No Data', () => {
		cy.get('@organization').then((org) => {
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
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(400);
					expect(response.body.error).to.be.an('boolean');
					expect(response.body.error).to.be.eq(true);
				});
			});
		});
	});

	it('POST - /v1/organizations/:orgId/owners - Add Organization Owners - User Already Added', () => {
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
						}).then(() => {
							//Try to re-add the user
							cy.request({
								method: 'POST',
								url: compoundURL,
								body: {
									email: addedUserResponse.body.userInfo.email,
									userId: addedUserResponse.body.userInfo._id
								},
								failOnStatusCode: false
							}).should((response) => {
								expect(response.status).to.be.eq(409);
								expect(response.body).to.be.eq(
									'Affiliation request has already been received and/or approved for this user'
								);
							});
						});
					});
				});
			});
		});
	});

	it('POST - /v1/organizations/:orgId/owners - Add Organization Owners - Non Existent Org', () => {
		cy.get('@new_user').then((user) => {
			cy.generateObjectId().then((generatedObjectId) => {
				cy.addUser(user).then((addedUserResponse) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations'),
						`/${generatedObjectId}`,
						Cypress.env('route_organizations_owners')
					);
					cy.request({
						method: 'POST',
						url: compoundURL,
						body: {
							email: addedUserResponse.body.userInfo.email,
							userId: addedUserResponse.body.userInfo._id
						},
						failOnStatusCode: false
					}).should((response) => {
						expect(response.status).to.be.eq(404);
						expect(response.body.notFound).to.be.an('boolean');
						expect(response.body.notFound).to.be.eq(true);
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

	it('GET - /v1/organizations/:orgId/owners/:userId/approve - Approve Organization Owner - Non Existent Org', () => {
		cy.get('@new_user').then((user) => {
			cy.get('@organization').then((org) => {
				cy.addUser(user).then((addedUserResponse) => {
					cy.addOrg(org).then((createdOrgResponse) => {
						cy.addOrgOwner(
							createdOrgResponse.body.organization._id,
							addedUserResponse.body.userInfo._id,
							addedUserResponse.body.userInfo.email
						).then(() => {
							cy.generateObjectId().then((generateObjectId) => {
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_organizations'),
									`/${generateObjectId}`,
									Cypress.env('route_organizations_owners'),
									`/${addedUserResponse.body.userInfo._id}`,
									Cypress.env('route_organizations_approve')
								);
								cy.request({
									method: 'GET',
									url: compoundURL,
									failOnStatusCode: false
								}).should((response) => {
									expect(response.status).to.be.eq(404);
									expect(response.body.notFound).to.be.an('boolean');
									expect(response.body.notFound).to.be.eq(true);
								});
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

	it('DELETE - /v1/organizations/:orgId/owners/:userId - Remove Organization Owner - Bad Data', () => {
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
								`/BADORGID`,
								Cypress.env('route_organizations_owners'),
								`/BADUSERID`
							);
							cy.request({
								method: 'DELETE',
								url: compoundURL,
								failOnStatusCode: false
							}).should((response) => {
								expect(response.status).to.be.eq(500);
								expect(response.body.error).to.be.an('boolean');
								expect(response.body.error).to.be.eq(true);
							});
						});
					});
				});
			});
		});
	});

	it('DELETE - /v1/organizations/:orgId/owners/:userId - Remove Organization Owner - Non Existent Org Data', () => {
		cy.get('@new_user').then((user) => {
			cy.get('@organization').then((org) => {
				cy.addUser(user).then((addedUserResponse) => {
					cy.addOrg(org).then((createdOrgResponse) => {
						cy.addOrgOwner(
							createdOrgResponse.body.organization._id,
							addedUserResponse.body.userInfo._id,
							addedUserResponse.body.userInfo.email
						).then(() => {
							cy.generateObjectId().then((generatedObjectId) => {
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_organizations'),
									`/${generatedObjectId}`,
									Cypress.env('route_organizations_owners'),
									`/${addedUserResponse.body.userInfo._id}`
								);
								cy.request({
									method: 'DELETE',
									url: compoundURL,
									failOnStatusCode: false
								}).should((response) => {
									expect(response.status).to.be.eq(404);
									expect(response.body.notFound).to.be.an('boolean');
									expect(response.body.notFound).to.be.eq(true);
								});
							});
						});
					});
				});
			});
		});
	});

	it('DELETE - /v1/organizations/:orgId/owners/:userId - Remove Organization Owner - Non Existent User Data', () => {
		cy.get('@new_user').then((user) => {
			cy.get('@organization').then((org) => {
				cy.addUser(user).then((addedUserResponse) => {
					cy.addOrg(org).then((createdOrgResponse) => {
						cy.addOrgOwner(
							createdOrgResponse.body.organization._id,
							addedUserResponse.body.userInfo._id,
							addedUserResponse.body.userInfo.email
						).then(() => {
							cy.generateObjectId().then((generatedObjectId) => {
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_organizations'),
									`/${createdOrgResponse.body.organization._id}`,
									Cypress.env('route_organizations_owners'),
									`/${generatedObjectId}`
								);
								cy.request({
									method: 'DELETE',
									url: compoundURL,
									failOnStatusCode: false
								}).should((response) => {
									expect(response.status).to.be.eq(404);
									expect(response.body.notFound).to.be.an('boolean');
									expect(response.body.notFound).to.be.eq(true);
								});
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

	it('DELETE - /v1/organizations - Delete Organization - Bad Org ID', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_organizations'),
			`/werwefwefwe`
		);
		cy.request({
			method: 'DELETE',
			url: compoundURL,
			failOnStatusCode: false
		}).should((response) => {
			expect(response.status).to.be.eq(500);
			expect(response.body.error).to.be.an('boolean');
			expect(response.body.error).to.be.eq(true);
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

	it('POST - /v1/organizations/:orgId/share - Share Organization - Non Existent Org', () => {
		cy.fixture('user_share_resource.json').then((share_user) => {
			cy.get('@organization').then((org) => {
				cy.addOrg(org).then((createdOrgResponse) => {
					cy.generateObjectId().then((generateObjectId) => {
						compoundURL = Cypress.env('baseUrl').concat(
							Cypress.env('version'),
							Cypress.env('route_organizations'),
							`/${generateObjectId}`,
							Cypress.env('route_share')
						);
						cy.request({
							method: 'POST',
							url: compoundURL,
							body: {
								email: `${share_user.email}`,
								shareType: 'resource',
								shareUrl: `cool-org`
							},
							failOnStatusCode: false
						}).should((response) => {
							expect(response.status).to.be.eq(404);
							expect(response.body.notFound).to.be.an('boolean');
							expect(response.body.notFound).to.be.eq(true);
						});
					});
				});
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId - Can add note', () => {
		cy.get('@note').then((note) => {
			cy.get('@organization').then((org) => {
				cy.addOrg(org).then((createdOrgResponse) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations'),
						`/${createdOrgResponse.body.organization._id}`
					);
					const createDate = Date.now();
					cy.request({
						method: 'PATCH',
						url: compoundURL,
						body: {
							notes_log: [
								{
									...note,
									created_at: createDate
								}
							]
						},
						failOnStatusCode: false
					}).should((response) => {
						expect(response.status).to.be.eq(200);
						expect(response.body.updated).to.be.eq(true);
					});

					cy.request({
						method: 'GET',
						url: compoundURL,
						failOnStatusCode: false
					}).should((response) => {
						expect(response.status).to.be.eq(200);
						expect(response.body.notes_log).to.exist;
						expect(response.body.notes_log).to.have.length(1);
						expect(response.body.notes_log[0].note).to.be.eq(note.note);
						expect(response.body.notes_log[0].created_at).to.exist;
						expect(response.body.notes_log[0].created_at).to.be.eq(
							new Date(createDate).toISOString()
						);
					});
				});
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId - Can delete note', () => {
		cy.get('@note').then((note) => {
			cy.get('@organization').then((org) => {
				cy.addOrg(org).then((createdOrgResponse) => {
					const deleteNote = 'To be deleted';
					cy.addNoteToOrg(
						note.note,
						Date.now(),
						createdOrgResponse.body.organization._id
					);
					cy.addNoteToOrg(
						deleteNote,
						Date.now(),
						createdOrgResponse.body.organization._id
					);
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations'),
						`/${createdOrgResponse.body.organization._id}`
					);

					cy.request({
						method: 'GET',
						url: compoundURL,
						failOnStatusCode: false
					}).then((response) => {
						let notes_log = response.body.notes_log.slice();
						notes_log = notes_log.filter((n) => n.note != deleteNote);
						cy.request({
							method: 'PATCH',
							url: compoundURL,
							body: {
								notes_log: notes_log
							},
							failOnStatusCode: false
						}).should((patchResponse) => {
							expect(patchResponse.status).to.be.eq(200);
							expect(patchResponse.body.updated).to.be.eq(true);
						});

						cy.request({
							method: 'GET',
							url: compoundURL,
							failOnStatusCode: false
						}).should((getResponse) => {
							expect(getResponse.status).to.be.eq(200);
							expect(getResponse.body.notes_log).to.exist;
							expect(getResponse.body.notes_log).to.have.length(1);
							expect(
								getResponse.body.notes_log.filter((n) => n.note == deleteNote)
							).to.be.empty;
						});
					});
				});
			});
		});
	});

	after(() => {
		cy.exec('rm -fr '.concat(Cypress.env('filePath')));
	});
});
