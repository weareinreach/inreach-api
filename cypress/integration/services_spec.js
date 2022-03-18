/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;
const specTitle = require('cypress-sonarqube-reporter/specTitle');

//Test Suite
describe(specTitle('Services Routers'), () => {
	beforeEach(() => {
		cy.fixture('org_good_format.json').as('organization');
		cy.fixture('org_services.json').as('service');
		cy.fixture('org_services_update.json').as('service_update');
		cy.fixture('note.json').as('note');
	});
	afterEach(() => {
		//Do the clean up
		cy.deleteUsersIfExist();
		cy.deleteOrgsIfExist();
	});
	it('GET - /v1/organizations/:orgId/services - Get Organization Services - Good Org ID', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${createdOrgResponse.body.organization._id}`,
					Cypress.env('route_services')
				);
				cy.request({
					method: 'GET',
					url: compoundURL
				}).should((response) => {
					expect(response.status).to.be.eq(200);
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services - Get Organization Services - Non Existing Org Id', () => {
		cy.get('@organization').then((org) => {
			cy.addOrg(org).then((createdOrgResponse) => {
				cy.generateObjectId().then((generateObjectId) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations'),
						`/${generateObjectId}`,
						Cypress.env('route_services')
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

	it('GET - /v1/organizations/:orgId/services - Get Organization Services - Bad Org ID', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_organizations'),
			'/BadOrgID/services'
		);
		cy.request({
			method: 'GET',
			url: compoundURL,
			failOnStatusCode: false
		}).should((response) => {
			expect(response.status).to.be.eq(500);
		});
	});

	it('GET - /v1/services/count - Get Services Count', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_services_count')
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body).to.have.all.keys('count');
			expect(response.body.count).to.be.an('number');
			expect(response.body.count).to.be.greaterThan(0);
		});
	});

	it('POST - /v1/organzizations/:orgId/services - Add Services to a Organizations - Bad Org Id', () => {
		cy.get('@service').then((service) => {
			compoundURL = Cypress.env('baseUrl').concat(
				Cypress.env('version'),
				Cypress.env('route_organizations'),
				'/BAAAAADDORGID',
				Cypress.env('route_services')
			);
			cy.request({
				method: 'POST',
				url: compoundURL,
				failOnStatusCode: false,
				body: service
			}).should((response) => {
				expect(response.status).to.be.eq(500);
				expect(response.body.error).to.be.an('boolean');
				expect(response.body.error).to.be.eq(true);
			});
		});
	});

	it('POST - /v1/organizations/:orgId/services - Add Services to a Organizations - Non Existent Org', () => {
		cy.generateObjectId().then((generateObjectId) => {
			cy.get('@service').then((service) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${generateObjectId}`,
					Cypress.env('route_services')
				);
				cy.request({
					method: 'POST',
					url: compoundURL,
					failOnStatusCode: false,
					body: service
				}).should((response) => {
					expect(response.status).to.be.eq(404);
					expect(response.body.notFound).to.be.an('boolean');
					expect(response.body.notFound).to.be.eq(true);
				});
			});
		});
	});

	it('POST - /v1/organizations/:orgId/services - Add Services to a Organizations - Good Org Id', () => {
		cy.get('@organization').then((organization) => {
			cy.addOrg(organization).then((createdOrgResponse) => {
				cy.get('@service').then((service) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations'),
						`/${createdOrgResponse.body.organization._id}`,
						Cypress.env('route_services')
					);
					cy.request({
						method: 'POST',
						url: compoundURL,
						body: service
					}).should((response) => {
						expect(response.status).to.be.eq(200);
						expect(response.body.created).to.be.an('boolean');
						expect(response.body.created).to.be.eq(true);
					});
					//verify Services were added
					cy.getOrgById(createdOrgResponse.body.organization._id).then(
						(response) => {
							expect(response.body.services).to.be.an('array');
							expect(response.body.services[0].name).to.be.eq(service.name);
							expect(response.body.services[0].description).to.be.eq(
								service.description
							);
						}
					);
				});
			});
		});
	});

	it('POST - /v1/organizations/:orgId/services - Add Services to a Organizations - Good Org Id And No Body', () => {
		cy.get('@organization').then((organization) => {
			cy.addOrg(organization).then((createdOrgResponse) => {
				cy.get('@service').then((service) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_organizations'),
						`/${createdOrgResponse.body.organization._id}`,
						Cypress.env('route_services')
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
	});

	it('GET - /v1/organizations/:orgid/services/:serviceid - Good org id and service id', () => {
		cy.get('@organization').then((organization) => {
			cy.addOrg(organization).then((createdorgresponse) => {
				cy.get('@service').then((service) => {
					cy.addServiceToOrg(
						createdorgresponse.body.organization._id,
						service
					).then(() => {
						cy.getOrgById(createdorgresponse.body.organization._id).then(
							(retrievedorgresponse) => {
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_organizations'),
									`/${retrievedorgresponse.body._id}`,
									Cypress.env('route_services'),
									`/${retrievedorgresponse.body.services[0]._id}`
								);
								cy.request({
									method: 'get',
									url: compoundURL
								}).should((response) => {
									expect(response.status).to.be.eq(200);
									expect(response.body.name).to.be.eq(service.name);
									expect(response.body.description).to.be.eq(
										service.description
									);
								});
							}
						);
					});
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services/:serviceId - Bad Org ID and Good Service ID', () => {
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
									'/BADOORGID',
									'services',
									`/${retrievedOrgResponse.body.services[0]._id}`
								);
								cy.request({
									method: 'GET',
									url: compoundURL,
									failOnStatusCode: false
								}).should((response) => {
									expect(response.status).to.be.eq(404);
								});
							}
						);
					});
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services/:serviceId - Non Existent Org and Good Service ID', () => {
		cy.get('@organization').then((organization) => {
			cy.addOrg(organization).then((createdOrgResponse) => {
				cy.get('@service').then((service) => {
					cy.addServiceToOrg(
						createdOrgResponse.body.organization._id,
						service
					).then(() => {
						cy.generateObjectId().then((generateObjectId) => {
							cy.getOrgById(createdOrgResponse.body.organization._id).then(
								(retrievedOrgResponse) => {
									compoundURL = Cypress.env('baseUrl').concat(
										Cypress.env('version'),
										Cypress.env('route_organizations'),
										`/${generateObjectId}`,
										'services',
										`/${retrievedOrgResponse.body.services[0]._id}`
									);
									cy.request({
										method: 'GET',
										url: compoundURL,
										failOnStatusCode: false
									}).should((response) => {
										expect(response.status).to.be.eq(404);
									});
								}
							);
						});
					});
				});
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services/:serviceId - Good Org ID and Bad Service ID', () => {
		cy.get('@organization').then((organization) => {
			cy.addOrg(organization).then((createdOrgResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${createdOrgResponse.body.organization._id}`,
					Cypress.env('route_services'),
					'/BADSERVICEID'
				);
				cy.request({
					method: 'GET',
					url: compoundURL,
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(404);
				});
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/services/:serviceId - Update a Service Information - Good Org and Services', () => {
		cy.get('@organization').then((organization) => {
			cy.addOrg(organization).then((createdOrgResponse) => {
				cy.get('@service').then((service) => {
					cy.addServiceToOrg(
						createdOrgResponse.body.organization._id,
						service
					).then(() => {
						cy.getOrgById(createdOrgResponse.body.organization._id).then(
							(retrievedOrgResponse) => {
								cy.get('@service_update').then((service_update) => {
									compoundURL = Cypress.env('baseUrl').concat(
										Cypress.env('version'),
										Cypress.env('route_organizations'),
										`/${retrievedOrgResponse.body._id}`,
										Cypress.env('route_services'),
										`/${retrievedOrgResponse.body.services[0]._id}`
									);
									cy.request({
										method: 'PATCH',
										url: compoundURL,
										body: service_update
									}).should((response) => {
										expect(response.status).to.be.eq(200);
										expect(response.body.updated).to.be.an('boolean');
										expect(response.body.updated).to.be.eq(true);
										//Get Organization and verify it was updated
										cy.getOrgById(retrievedOrgResponse.body._id).then(
											(response) => {
												expect(response.body.services).to.be.an('array');
												expect(response.body.services[0].name).to.be.eq(
													service_update.name
												);
												expect(response.body.services[0].description).to.be.eq(
													service_update.description
												);
											}
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

	it('PATCH - /v1/organizations/:orgId/services/:serviceId - Update a Service Information - Bad Org and Good Services', () => {
		cy.get('@organization').then((organization) => {
			cy.addOrg(organization).then((createdOrgResponse) => {
				cy.get('@service').then((service) => {
					cy.addServiceToOrg(
						createdOrgResponse.body.organization._id,
						service
					).then(() => {
						cy.getOrgById(createdOrgResponse.body.organization._id).then(
							(retrievedOrgResponse) => {
								cy.get('@service_update').then((service_update) => {
									compoundURL = Cypress.env('baseUrl').concat(
										Cypress.env('version'),
										Cypress.env('route_organizations'),
										'/BADORGID',
										Cypress.env('route_services'),
										`/${retrievedOrgResponse.body.services[0]._id}`
									);
									cy.request({
										method: 'PATCH',
										url: compoundURL,
										body: service_update,
										failOnStatusCode: false
									}).should((response) => {
										expect(response.status).to.be.eq(500);
									});
								});
							}
						);
					});
				});
			});
		});
	});

	it('PATCH - /v1/organizations/:orgId/services/:serviceId - Update a Service Information - Good Org and Bad Services', () => {
		cy.get('@organization').then((organization) => {
			cy.addOrg(organization).then((createdOrgResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_organizations'),
					`/${createdOrgResponse.body.organization._id}`,
					Cypress.env('route_services'),
					'/BADSERVICESID'
				);
				cy.request({
					method: 'PATCH',
					url: compoundURL,
					body: {},
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(400);
				});
			});
		});
	});
	it('DELETE - /v1/organization/:orgId/services/:serviceId - Delete Service from Org', () => {
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
									`/${retrievedOrgResponse.body.services[0]._id}`
								);
								cy.request({
									method: 'DELETE',
									url: compoundURL
								}).should((response) => {
									expect(response.status).to.be.eq(200);
									expect(response.body.deleted).to.be.an('boolean');
									expect(response.body.deleted).to.be.eq(true);
									//Get Organization and verify it was updated
									cy.getOrgById(retrievedOrgResponse.body._id).then(
										(response) => {
											expect(response.body.services).to.be.an('array');
											expect(response.body.services).to.have.lengthOf(0);
										}
									);
								});
							}
						);
					});
				});
			});
		});
	});
	it('DELETE - /v1/organization/:orgId/services/:serviceId - Delete Service from Org Non Existent Org', () => {
		cy.get('@organization').then((organization) => {
			cy.addOrg(organization).then((createdOrgResponse) => {
				cy.get('@service').then((service) => {
					cy.addServiceToOrg(
						createdOrgResponse.body.organization._id,
						service
					).then(() => {
						cy.generateObjectId().then((generatedId) => {
							cy.getOrgById(createdOrgResponse.body.organization._id).then(
								(retrievedOrgResponse) => {
									compoundURL = Cypress.env('baseUrl').concat(
										Cypress.env('version'),
										Cypress.env('route_organizations'),
										`/${generatedId}`,
										Cypress.env('route_services'),
										`/${retrievedOrgResponse.body.services[0]._id}`
									);
									cy.request({
										method: 'DELETE',
										url: compoundURL,
										failOnStatusCode: false
									}).should((response) => {
										cy.log(response);
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
	});

	it('PATCH - /v1/organizations/:orgid/services/:serviceid - Can add note', () => {
		cy.get('@note').then((note) => {
			cy.get('@organization').then((organization) => {
				cy.addOrg(organization).then((createdorgresponse) => {
					cy.get('@service').then((service) => {
						cy.addServiceToOrg(
							createdorgresponse.body.organization._id,
							service
						).then(() => {
							cy.getOrgById(createdorgresponse.body.organization._id).then(
								(retrievedorgresponse) => {
									compoundURL = Cypress.env('baseUrl').concat(
										Cypress.env('version'),
										Cypress.env('route_organizations'),
										`/${retrievedorgresponse.body._id}`,
										Cypress.env('route_services'),
										`/${retrievedorgresponse.body.services[0]._id}`
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
										method: 'get',
										url: compoundURL
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
								}
							);
						});
					});
				});
			});
		});
	});

	it('PATCH - /v1/organizations/:orgid/services/:serviceid - Can delete note', () => {
		cy.get('@note').then((note) => {
			cy.get('@organization').then((organization) => {
				cy.addOrg(organization).then((createdorgresponse) => {
					cy.get('@service').then((service) => {
						cy.addServiceToOrg(
							createdorgresponse.body.organization._id,
							service
						).then(() => {
							cy.getOrgById(createdorgresponse.body.organization._id).then(
								(retrievedorgresponse) => {
									const deleteNote = 'To be deleted';
									cy.addNoteToService(
										note.note,
										Date.now(),
										retrievedorgresponse.body._id,
										retrievedorgresponse.body.services[0]._id
									);
									cy.addNoteToService(
										deleteNote,
										Date.now(),
										retrievedorgresponse.body._id,
										retrievedorgresponse.body.services[0]._id
									);

									compoundURL = Cypress.env('baseUrl').concat(
										Cypress.env('version'),
										Cypress.env('route_organizations'),
										`/${retrievedorgresponse.body._id}`,
										Cypress.env('route_services'),
										`/${retrievedorgresponse.body.services[0]._id}`
									);

									cy.request({
										method: 'GET',
										url: compoundURL,
										failOnStatusCode: false
									}).then((response) => {
										let notes_log = response.body.notes_log.filter(
											(n) => n.note != deleteNote
										);
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
											url: compoundURL
										}).should((getResponse) => {
											expect(getResponse.status).to.be.eq(200);
											expect(getResponse.body.notes_log).to.exist;
											expect(getResponse.body.notes_log).to.have.length(1);
											expect(
												getResponse.body.notes_log.filter(
													(n) => n.note == deleteNote
												)
											).to.be.empty;
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
		//Delete temp_data folder
		cy.exec('rm -fr '.concat(Cypress.env('filePath')));
	});
});
