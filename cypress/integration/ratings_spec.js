/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;

describe('Ratings Routers', () => {
	beforeEach(() => {
		cy.fixture('org_good_format.json').as('organization');
		cy.fixture('user_new.json').as('new_user');
		cy.fixture('org_services.json').as('service');
	});
	afterEach(() => {
		//Do the clean up
		cy.deleteUsersIfExist();
		cy.deleteRatingsOrgsIfExist().then(() => {
			cy.deleteOrgsIfExist();
		});
	});
	it('PATCH - /v1/organizations/:orgId/ratings - Add Ratings - Bad Ratings No Body', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${createdOrgResponse.body.organization._id}`,
					Cypress.env('route_ratings')
				);
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
	});

	it('PATCH - /v1/organizations/:orgId/ratings - Add Ratings - Good Ratings', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@organization').then((organization) => {
					cy.addOrg(organization).then((createdOrgResponse) => {
						compoundURL = Cypress.env('baseUrl').concat(
							Cypress.env('version'),
							Cypress.env('route_organizations'),
							`/${createdOrgResponse.body.organization._id}`,
							Cypress.env('route_ratings')
						);
						let rating = {
							userId: addedUserResponse.body.userInfo._id,
							rating: 5,
							source: 'Test Source'
						};
						cy.request({
							method: 'PATCH',
							url: compoundURL,
							body: rating
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

	it('DELETE - /v1/organizations/:orgId/ratings/:ratingId - Delete Ratings - Good Ratings', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@organization').then((organization) => {
					cy.addOrg(organization).then((createdOrgResponse) => {
						//define the rating
						let rating = {
							userId: addedUserResponse.body.userInfo._id,
							rating: 5,
							source: 'Test Source'
						};
						//add the rating
						cy.addRatingToOrg(
							createdOrgResponse.body.organization._id,
							rating
						).then(() => {
							compoundURL = Cypress.env('baseUrl').concat(
								Cypress.env('version'),
								Cypress.env('route_organizations'),
								`/${createdOrgResponse.body.organization._id}`,
								Cypress.env('route_ratings')
							);
							cy.request({
								method: 'GET',
								url: compoundURL
							}).then((response) => {
								// Delete Rating based of Id
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_organizations'),
									`/${createdOrgResponse.body.organization._id}`,
									Cypress.env('route_ratings'),
									`/${response.body.ratings[0]._id}`
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
	});

	it('DELETE - /v1/organizations/:orgId/ratings/:ratingId - Delete Ratings - Bad Org Id Ratings', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@organization').then((organization) => {
					cy.addOrg(organization).then((createdOrgResponse) => {
						//define the rating
						let rating = {
							userId: addedUserResponse.body.userInfo._id,
							rating: 5,
							source: 'Test Source'
						};
						//add the rating
						cy.addRatingToOrg(
							createdOrgResponse.body.organization._id,
							rating
						).then(() => {
							compoundURL = Cypress.env('baseUrl').concat(
								Cypress.env('version'),
								Cypress.env('route_organizations'),
								`/${createdOrgResponse.body.organization._id}`,
								Cypress.env('route_ratings')
							);
							cy.request({
								method: 'GET',
								url: compoundURL
							}).then((response) => {
								// Delete Rating based of Id
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_organizations'),
									`/BA-ORG-ID`,
									Cypress.env('route_ratings'),
									`/${response.body.ratings[0]._id}`
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

	it('GET - /v1/organizations/:orgId/ratings - Get Organization ratings', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@organization').then((organization) => {
					cy.addOrg(organization).then((createdOrgResponse) => {
						//define the rating
						let rating = {
							userId: addedUserResponse.body.userInfo._id,
							rating: 5,
							source: 'Test Source'
						};
						//add the rating
						cy.addRatingToOrg(
							createdOrgResponse.body.organization._id,
							rating
						).then(() => {
							compoundURL = Cypress.env('baseUrl').concat(
								Cypress.env('version'),
								Cypress.env('route_organizations'),
								`/${createdOrgResponse.body.organization._id}`,
								Cypress.env('route_ratings')
							);
							cy.request({
								method: 'GET',
								url: compoundURL
							}).should((response) => {
								expect(response.status).to.be.eq(200);
								expect(response.body.ratings).to.be.an('array');
								expect(response.body.ratings).to.have.lengthOf(1);
								expect(response.body.ratings[0]._id).to.be.an('string');
								expect(response.body.ratings[0].rating).to.be.an('number');
								expect(response.body.ratings[0].source).to.be.an('string');
								expect(response.body.ratings[0].userId).to.be.an('string');
								expect(response.body.ratings[0].rating).to.be.eq(rating.rating);
								expect(response.body.ratings[0].source).to.be.eq(rating.source);
								expect(response.body.ratings[0].userId).to.be.eq(rating.userId);
							});
						});
					});
				});
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/services/:servicesId/ratings - Add ratings To Service - Bad rating No Body', () => {
		cy.get('@organization').then((organization) => {
			cy.addOrg(organization).then((createdOrgResponse) => {
				cy.get('@service').then((service) => {
					cy.addServiceToOrg(
						createdOrgResponse.body.organization._id,
						service
					).then(() => {
						cy.getOrgById(createdOrgResponse.body.organization._id).then(
							(retrievedOrgResponse) => {
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_organizations'),
									`/${retrievedOrgResponse.body._id}`,
									Cypress.env('route_services'),
									`/${retrievedOrgResponse.body.services[0]._id}`,
									Cypress.env('route_ratings')
								);
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
							}
						);
					});
				});
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/services/:servicesId/ratings - Add ratings To Org Services - Good Rating', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@organization').then((organization) => {
					cy.addOrg(organization).then((createdOrgResponse) => {
						cy.get('@service').then((service) => {
							cy.addServiceToOrg(
								createdOrgResponse.body.organization._id,
								service
							).then(() => {
								cy.getOrgById(createdOrgResponse.body.organization._id).then(
									(retrievedOrgResponse) => {
										compoundURL = Cypress.env('baseUrl').concat(
											Cypress.env('version'),
											Cypress.env('route_organizations'),
											`/${retrievedOrgResponse.body._id}`,
											Cypress.env('route_services'),
											`/${retrievedOrgResponse.body.services[0]._id}`,
											Cypress.env('route_ratings')
										);
										//define the rating
										let rating = {
											userId: addedUserResponse.body.userInfo._id,
											rating: 3,
											source: 'Test Source'
										};

										cy.request({
											method: 'PATCH',
											url: compoundURL,
											body: rating
										}).should((response) => {
											expect(response.status).to.be.eq(200);
											expect(response.body.updated).to.be.an('boolean');
											expect(response.body.updated).to.be.eq(true);
										});
									}
								);
							});
						});
					});
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services/:serviceId/ratings - Get Organization Service ratings', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@organization').then((organization) => {
					cy.addOrg(organization).then((createdOrgResponse) => {
						cy.get('@service').then((service) => {
							cy.addServiceToOrg(
								createdOrgResponse.body.organization._id,
								service
							).then(() => {
								cy.getOrgById(createdOrgResponse.body.organization._id).then(
									(retrievedOrgResponse) => {
										//define the rating
										let rating = {
											userId: addedUserResponse.body.userInfo._id,
											rating: 3,
											source: 'Test Source'
										};
										//Add the rating
										cy.addRatingToService(
											retrievedOrgResponse.body._id,
											retrievedOrgResponse.body.services[0]._id,
											rating
										).then(() => {
											compoundURL = Cypress.env('baseUrl').concat(
												Cypress.env('version'),
												Cypress.env('route_organizations'),
												`/${retrievedOrgResponse.body._id}`,
												Cypress.env('route_services'),
												`/${retrievedOrgResponse.body.services[0]._id}`,
												Cypress.env('route_ratings')
											);
											cy.request({
												method: 'GET',
												url: compoundURL
											}).should((response) => {
												expect(response.status).to.be.eq(200);
												expect(response.body.ratings).to.be.an('array');
												expect(response.body.ratings).to.have.lengthOf(1);
												expect(response.body.ratings[0]._id).to.be.an('string');
												expect(response.body.ratings[0].rating).to.be.an(
													'number'
												);
												expect(response.body.ratings[0].source).to.be.an(
													'string'
												);
												expect(response.body.ratings[0].userId).to.be.an(
													'string'
												);
												expect(response.body.ratings[0].rating).to.be.eq(
													rating.rating
												);
												expect(response.body.ratings[0].source).to.be.eq(
													rating.source
												);
												expect(response.body.ratings[0].userId).to.be.eq(
													rating.userId
												);
											});
										});
									}
								);
							});
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
