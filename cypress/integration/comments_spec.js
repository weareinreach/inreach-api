/* eslint-disable no-undef */
/// <reference types="cypress" />

//TODO CHECK FOR KEYS IN REPONSE

//Instantiate up Server variable

//compound url
let compoundURL = null;

describe('Comments Routers', () => {
	beforeEach(() => {
		//Loading Necessary Fixtures
		cy.fixture('org_good_format.json').as('organization');
		cy.fixture('org_services.json').as('services');
		cy.fixture('auth_user_id.json').as('authenticated_user_id');
		cy.fixture('comment.json').as('comment');
	});

	afterEach(() => {
		//Do the clean up
		cy.deleteUsersIfExist();
		cy.deleteOrgsIfExist();
	});

	it('PATCH - /v1/organizations/:orgId/comments - Add Comments - Bad Comment No Body', () => {
		cy.get('@organization').then((org) => {
			//Add Automation Org
			cy.addOrg(org).then((createOrgResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${createOrgResponse.body.organization._id}`,
					Cypress.env('route_comments')
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

	it('PATCH - /v1/organizations/:orgId/comments - Add Comments - Good Comment', () => {
		//Get Comment
		cy.get('@comment').then((comment) => {
			//Add Organization
			cy.get('@organization').then((org) => {
				//Add Automation Org
				cy.addOrg(org).then((createOrgResponse) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations'),
						`/${createOrgResponse.body.organization._id}`,
						Cypress.env('route_comments')
					);

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
	});

	it('DELETE - /v1/organizations/:orgId/comments - Delete Org Comments - Good Comment', () => {
		//Get Comment
		cy.get('@comment').then((comment) => {
			//Add Organization
			cy.get('@organization').then((org) => {
				//Add Automation Org
				cy.addOrg(org).then((createOrgResponse) => {
					cy.addCommentToOrg(
						createOrgResponse.body.organization._id,
						comment
					).then(() => {
						//Get Comments
						cy.getOrgComments(createOrgResponse.body.organization._id).then(
							(response) => {
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_organizations'),
									`/${createOrgResponse.body.organization._id}`,
									Cypress.env('route_comments'),
									`/${response.body.comments[0]._id}`
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
				});
			});
		});
	});

	it('DELETE - /v1/organizations/:orgId/comments - Delete Org Comments - Bad Org', () => {
		//Get Comment
		cy.get('@comment').then((comment) => {
			//Add Organization
			cy.get('@organization').then((org) => {
				//Add Automation Org
				cy.addOrg(org).then((createOrgResponse) => {
					cy.addCommentToOrg(
						createOrgResponse.body.organization._id,
						comment
					).then(() => {
						//Get Comments
						cy.getOrgComments(createOrgResponse.body.organization._id).then(
							(response) => {
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_organizations'),
									`/BAD-ORG-ID`,
									Cypress.env('route_comments'),
									`/${response.body.comments[0]._id}`
								);
								cy.request({
									method: 'DELETE',
									url: compoundURL
								}).should((response) => {
									expect(response.status).to.be.eq(404);
									expect(response.body.notFound).to.be.an('boolean');
									expect(response.body.notFound).to.be.eq(true);
								});
							}
						);
					});
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/comments - Get Organization comments', () => {
		//Add Organization
		cy.get('@organization').then((org) => {
			//Add Automation Org
			cy.addOrg(org).then((createOrgResponse) => {
				//Get Comment
				cy.get('@comment').then((comment) => {
					cy.addCommentToOrg(
						createOrgResponse.body.organization._id,
						comment
					).then(() => {
						compoundURL = Cypress.env('baseUrl').concat(
							Cypress.env('version'),
							Cypress.env('route_organizations'),
							`/${createOrgResponse.body.organization._id}`,
							Cypress.env('route_comments')
						);
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
							expect(response.body.comments[0].comment).to.be.eq(
								comment.comment
							);
							expect(response.body.comments[0].source).to.be.eq(comment.source);
							expect(response.body.comments[0].userId).to.be.eq(comment.userId);
						});
					});
				});
			});
		});
	});
	it('PATCH - /v1/organizations/:orgId/services/:servicesId/comments - Add Comments To Service - Bad Comment No Body', () => {
		//Get Org Data
		cy.get('@organization').then((org) => {
			//Add Automation Org
			cy.addOrg(org).then((createOrgResponse) => {
				//Get Service Data
				cy.get('@services').then((service) => {
					//Add it to Org
					cy.addServiceToOrg(
						createOrgResponse.body.organization._id,
						service
					).then(() => {
						//Get Service Details by getting Org Info
						cy.getOrgById(createOrgResponse.body.organization._id).then(
							(organization) => {
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_organizations'),
									`/${createOrgResponse.body.organization._id}`,
									Cypress.env('route_services'),
									`/${organization.body.services[0]._id}`,
									Cypress.env('route_comments')
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

	it('PATCH - /v1/organizations/:orgId/services/:servicesId/comments - Add Comments To Org Services - Good Comment', () => {
		//Get Org Data
		cy.get('@organization').then((org) => {
			//Add Automation Org
			cy.addOrg(org).then((createOrgResponse) => {
				//Get Service Data
				cy.get('@services').then((service) => {
					//Add it to Org
					cy.addServiceToOrg(
						createOrgResponse.body.organization._id,
						service
					).then(() => {
						//Get Service Details by getting Org Info
						cy.getOrgById(createOrgResponse.body.organization._id).then(
							(organization) => {
								//Get Comment
								cy.get('@comment').then((comment) => {
									compoundURL = Cypress.env('baseUrl').concat(
										Cypress.env('version'),
										Cypress.env('route_organizations'),
										`/${createOrgResponse.body.organization._id}`,
										Cypress.env('route_services'),
										`/${organization.body.services[0]._id}`,
										Cypress.env('route_comments')
									);

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
							}
						);
					});
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services/:serviceId/comments - Get Organization Service comments', () => {
		//Get Org Data
		cy.get('@organization').then((org) => {
			//Add Automation Org
			cy.addOrg(org).then((createOrgResponse) => {
				//Get Service Data
				cy.get('@services').then((service) => {
					//Add it to Org
					cy.addServiceToOrg(
						createOrgResponse.body.organization._id,
						service
					).then(() => {
						//Get Service Details by getting Org Info
						cy.getOrgById(createOrgResponse.body.organization._id).then(
							(organization) => {
								//Get Comment
								cy.get('@comment').then((comment) => {
									cy.addCommentToService(
										createOrgResponse.body.organization._id,
										organization.body.services[0]._id,
										comment
									).then(() => {
										compoundURL = Cypress.env('baseUrl').concat(
											Cypress.env('version'),
											Cypress.env('route_organizations'),
											`/${createOrgResponse.body.organization._id}`,
											Cypress.env('route_services'),
											`/${organization.body.services[0]._id}`,
											Cypress.env('route_comments')
										);
										cy.request({
											method: 'GET',
											url: compoundURL
										}).should((response) => {
											expect(response.status).to.be.eq(200);
											expect(response.body.comments).to.be.an('array');
											expect(response.body.comments).to.have.lengthOf(1);
											expect(response.body.comments[0]._id).to.be.an('string');
											expect(response.body.comments[0].comment).to.be.an(
												'string'
											);
											expect(response.body.comments[0].source).to.be.an(
												'string'
											);
											expect(response.body.comments[0].userId).to.be.an(
												'string'
											);
											expect(response.body.comments[0].comment).to.be.eq(
												comment.comment
											);
											expect(response.body.comments[0].source).to.be.eq(
												comment.source
											);
											expect(response.body.comments[0].userId).to.be.eq(
												comment.userId
											);
										});
									});
								});
							}
						);
					});
				});
			});
		});
	});

	it('DELETE - /v1/organizations/:orgId/services/:serviceId/comments - Delete Org Service Comments - Good Comment', () => {
		//Get Comment
		cy.get('@comment').then((comment) => {
			//Add Organization
			cy.get('@organization').then((org) => {
				//Add Automation Org
				cy.addOrg(org).then((createOrgResponse) => {
					cy.get('@services').then((service) => {
						//Add it to Org
						cy.addServiceToOrg(
							createOrgResponse.body.organization._id,
							service
						).then(() => {
							//Get Org
							cy.getOrgById(createOrgResponse.body.organization._id).then(
								(orgResponse) => {
									cy.addCommentToService(
										orgResponse.body._id,
										orgResponse.body.services[0]._id,
										comment
									).then(() => {
										cy.getServiceOrgComments(
											orgResponse.body._id,
											orgResponse.body.services[0]._id
										).then((response) => {
											compoundURL = Cypress.env('baseUrl').concat(
												Cypress.env('version'),
												Cypress.env('route_organizations'),
												`/${orgResponse.body._id}`,
												Cypress.env('route_comments'),
												`/${response.body.comments[0]._id}`
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
								}
							);
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
