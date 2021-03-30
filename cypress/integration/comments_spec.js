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
				//Delete Org
				cy.deleteOrgById(createOrgResponse.body.organization._id);
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
					//Delete Org
					cy.deleteOrgById(createOrgResponse.body.organization._id);
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
				//Delete Org
				cy.deleteOrgById(createOrgResponse.body.organization._id);
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

								//Delete Org
								cy.deleteOrgById(createOrgResponse.body.organization._id);
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
								//Delete Org
								cy.deleteOrgById(createOrgResponse.body.organization._id);
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
								//Delete Org
								cy.deleteOrgById(createOrgResponse.body.organization._id);
							}
						);
					});
				});
			});
		});
	});

	after(() => {
		cy.exec('rm -fr '.concat(Cypress.env('filePath')));
	});
});
