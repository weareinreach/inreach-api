/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;

//Routes Constants

describe('Users Routers', () => {
	beforeEach(() => {
		cy.fixture('org_good_format.json').as('organization');
		cy.fixture('user_new_bad.json').as('bad_user');
		cy.fixture('user_new.json').as('new_user');
		cy.fixture('user_new_update.json').as('new_user_update');
		cy.fixture('user_new_password.json').as('new_user_password');
		cy.fixture('user_new_list.json').as('new_user_list');
	});
	afterEach(() => {
		//Do the clean up
		cy.deleteUsersIfExist();
		cy.deleteOrgsIfExist();
	});
	it('GET - /v1/users - Get Users', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_users')
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body.users).to.be.an('array');
			expect(response.body.users).to.have.length.greaterThan(0);
			expect(response.body.users[0].isDataManager).to.be.an('boolean');
			expect(response.body.users[0].isProfessional).to.be.an('boolean');
			expect(response.body.users[0]._id).to.be.an('string');
			expect(response.body.users[0].name).to.be.an('string');
			expect(response.body.users[0].email).to.be.an('string');
		});
	});

	it('POST - /v1/users - Create User - New User - No Password', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_users')
		);
		cy.get('@bad_user').then((new_user_bad) => {
			cy.request({
				method: 'POST',
				url: compoundURL,
				body: new_user_bad,
				failOnStatusCode: false
			}).should((response) => {
				expect(response.status).to.be.eq(400);
			});
		});
	});

	it('POST - /v1/users - Create User - New User - Good Data', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_users')
		);
		cy.get('@new_user').then((new_user) => {
			cy.request({
				method: 'POST',
				url: compoundURL,
				body: new_user
			}).should((response) => {
				expect(response.body.created).to.be.an('boolean');
				expect(response.body.created).to.be.eq(true);
				expect(response.body.userInfo.isDataManager).to.be.an('boolean');
				expect(response.body.userInfo.isDataManager).to.be.eq(false);
				expect(response.body.userInfo.isAdminDataManager).to.be.an('boolean');
				expect(response.body.userInfo.isAdminDataManager).to.be.eq(false);
				expect(response.body.userInfo.isProfessional).to.be.an('boolean');
				expect(response.body.userInfo.isProfessional).to.be.eq(false);
				expect(response.body.userInfo.name).to.be.an('string');
				expect(response.body.userInfo.email).to.be.an('string');
				expect(response.body.userInfo.age).to.be.an('string');
				expect(response.body.userInfo.ethnicityRace).to.be.an('array');
				expect(response.body.userInfo.ethnicityRace).to.be.lengthOf(0);
				expect(response.body.userInfo.identitySupplimental).to.be.an('array');
				expect(response.body.userInfo.identitySupplimental).to.be.lengthOf(0);
				expect(response.body.userInfo.lists).to.be.an('array');
				expect(response.body.userInfo.lists).to.be.lengthOf(0);
			});
		});
	});

	it('GET - /v1/users/count - Get User Count', () => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_users_count')
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).should((response) => {
			expect(response.status).to.be.eq(200);
			expect(response.body).has.all.keys('count', 'pages');
			expect(response.body.count).to.be.greaterThan(0);
			expect(response.body.pages).to.be.greaterThan(0);
		});
	});

	it('GET - /v1/users/:userId - Get User Id', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_users'),
					`/${addedUserResponse.body.userInfo._id}`
				);
				cy.request({
					method: 'GET',
					url: compoundURL
				}).should((response) => {
					expect(response.status).to.be.eq(200);
					expect(response.body.isDataManager).to.be.an('boolean');
					expect(response.body.isDataManager).to.be.eq(false);
					expect(response.body.isAdminDataManager).to.be.an('boolean');
					expect(response.body.isAdminDataManager).to.be.eq(false);
					expect(response.body.isProfessional).to.be.an('boolean');
					expect(response.body.isProfessional).to.be.eq(false);
					expect(response.body.name).to.be.an('string');
					expect(response.body.email).to.be.an('string');
					expect(response.body.age).to.be.an('string');
					expect(response.body.ethnicityRace).to.be.an('array');
					expect(response.body.ethnicityRace).to.be.lengthOf(0);
					expect(response.body.identitySupplimental).to.be.an('array');
					expect(response.body.identitySupplimental).to.be.lengthOf(0);
					expect(response.body.lists).to.be.an('array');
					expect(response.body.lists).to.be.lengthOf(0);
				});
			});
		});
	});

	it('POST - /v1/users - Create User - Existing User', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_users')
				);
				cy.request({
					method: 'POST',
					url: compoundURL,
					body: new_user,
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(409);
				});
			});
		});
	});

	it('PATCH - /v1/users/:userId  - Patch User', () => {
		cy.get('@new_user').then((new_user) => {
			cy.get('@new_user_update').then((new_user_update) => {
				cy.addUser(new_user).then((addedUserResponse) => {
					cy.request({
						method: 'PATCH',
						url: (compoundURL = Cypress.env('baseUrl').concat(
							Cypress.env('version'),
							Cypress.env('route_users'),
							`/${addedUserResponse.body.userInfo._id}`
						)),
						body: new_user_update
					}).should((response) => {
						//Verify positive response from server
						expect(response.status).to.be.eq(200);
						expect(response.body.updated).to.be.an('boolean');
						expect(response.body.updated).to.be.eq(true);
						//Get User using Commands and verify update was applied
						cy.getUser(addedUserResponse.body.userInfo._id).should(
							(response) => {
								expect(response.body.name).to.be.an('string');
								expect(response.body.name).to.be.eq(new_user_update.name);
								expect(response.body.email).to.be.an('string');
								expect(response.body.email).to.be.eq(new_user_update.email);
								expect(response.body.age).to.be.an('string');
								expect(response.body.age).to.be.eq(new_user_update.age);
							}
						);
					});
				});
			});
		});
	});

	it('PATCH - /v1/users/:userId/password - Update Password - Bad User Id', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@new_user_password').then((new_password) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_users'),
						'/BadUserID',
						Cypress.env('route_users_password')
					);
					cy.request({
						method: 'PATCH',
						url: compoundURL,
						body: new_password,
						failOnStatusCode: false
					}).should((response) => {
						expect(response.status).to.be.eq(500);
					});
				});
			});
		});
	});

	it('PATCH - /v1/users/:userId/password - Update Password - Bad User Id - Bad Password', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_users'),
					`/${addedUserResponse.body.userInfo._id}`,
					Cypress.env('route_users_password')
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

	it('PATCH - /v1/users/:userId/password - Update Password - Good Password', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@new_user_password').then((new_password) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_users'),
						`/${addedUserResponse.body.userInfo._id}`,
						Cypress.env('route_users_password')
					);
					cy.request({
						method: 'PATCH',
						url: compoundURL,
						body: new_password
					}).should((response) => {
						expect(response.status).to.be.eq(200);
					});
				});
			});
		});
	});

	it('POST - /v1/users/forgotPassword - Forgot Password - Bad Email', () => {
		cy.get('@bad_user').then((user) => {
			compoundURL = Cypress.env('baseUrl').concat(
				Cypress.env('version'),
				Cypress.env('route_users'),
				Cypress.env('route_users_forgot_password')
			);

			cy.request({
				method: 'POST',
				url: compoundURL,
				failOnStatusCode: false,
				body: {
					email: user.email
				}
			}).should((response) => {
				expect(response.status).to.be.eq(400);
				expect(response.body).to.be.an('string');
				expect(response.body).to.be.eq('That email does not exist!');
			});
		});
	});

	it('POST - /v1/users/forgotPassword - Forgot Password - Good Email', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_users'),
					Cypress.env('route_users_forgot_password')
				);

				cy.request({
					method: 'POST',
					url: compoundURL,
					body: {
						email: new_user.email
					}
				}).should((response) => {
					expect(response.status).to.be.eq(200);
				});
			});
		});
	});

	it('DELETE - /v1/users - Delete User', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				compoundURL = Cypress.env('baseUrl').concat(
					Cypress.env('version'),
					Cypress.env('route_users'),
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

	it('POST - /v1/users/:userid/lists - Add user lists', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@new_user_list').then((new_user_list) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_users'),
						`/${addedUserResponse.body.userInfo._id}`,
						Cypress.env('route_users_list')
					);
					cy.request({
						method: 'POST',
						url: compoundURL,
						body: new_user_list
					}).should((response) => {
						expect(response.status).to.be.eq(200);
						expect(response.body.created).to.be.an('boolean');
						expect(response.body.created).to.be.eq(true);
						const {list} = response.body;
						expect(list).to.haveOwnProperty('visibility').to.equal('private');
						expect(list).to.haveOwnProperty('shared_with').with.lengthOf(0);
						cy.getUser(addedUserResponse.body.userInfo._id).then((response) => {
							expect(response.body.lists[0].name).to.be.an('string');
							expect(response.body.lists[0].name).to.be.eq(new_user_list.name);
						});
					});
				});
			});
		});
	});

	it('POST - /v1/users/:userId/lists/:listId/items - Add Item to list - Bad User ID', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@new_user_list').then((new_user_list) => {
					cy.addList(addedUserResponse.body.userInfo._id, new_user_list).then(
						() => {
							cy.getUser(addedUserResponse.body.userInfo._id).then((user) => {
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_users'),
									'/BadUserID',
									Cypress.env('route_users_list'),
									`/${user.body.lists[0]._id}`,
									Cypress.env('route_users_items')
								);
								cy.request({
									method: 'POST',
									url: compoundURL,
									failOnStatusCode: false,
									body: {
										itemId: 'Bad Item'
									}
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

	it('POST - /v1/users/:userId/lists/:listId/items - Add Item to list - Bad List ID', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@new_user_list').then((new_user_list) => {
					cy.addList(addedUserResponse.body.userInfo._id, new_user_list).then(
						() => {
							cy.getUser(addedUserResponse.body.userInfo._id).then((user) => {
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_users'),
									`/${user.body._id}`,
									Cypress.env('route_users_list'),
									'/badListId',
									Cypress.env('route_users_items')
								);
								cy.request({
									method: 'POST',
									url: compoundURL,
									failOnStatusCode: false,
									body: {
										itemId: 'Bad Item'
									}
								}).should((response) => {
									expect(response.status).to.be.eq(404);
								});
							});
						}
					);
				});
			});
		});
	});

	//We don't verify that Item Id is an organization ID this should be a 404
	it('POST - /v1/users/:userId/lists/:listId/items - Add Item to list - Bad Item ID', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@new_user_list').then((new_user_list) => {
					cy.addList(addedUserResponse.body.userInfo._id, new_user_list).then(
						() => {
							cy.getUser(addedUserResponse.body.userInfo._id).then((user) => {
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_users'),
									`/${user.body._id}`,
									Cypress.env('route_users_list'),
									`/${user.body.lists[0]._id}`,
									Cypress.env('route_users_items')
								);
								cy.request({
									method: 'POST',
									url: compoundURL,
									failOnStatusCode: false,
									body: {
										itemId: 'Bad Item'
									}
								}).should((response) => {
									expect(response.status).to.be.eq(200);
								});
							});
						}
					);
				});
			});
		});
	});

	it('POST - /v1/users/:userId/lists/:listId/items - Add Item to list - Good List Item ID', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@new_user_list').then((new_user_list) => {
					cy.addList(addedUserResponse.body.userInfo._id, new_user_list).then(
						() => {
							cy.getUser(addedUserResponse.body.userInfo._id).then((user) => {
								cy.get('@organization').then((org) => {
									cy.addOrg(org).then((createdOrgResponse) => {
										compoundURL = Cypress.env('baseUrl').concat(
											Cypress.env('version'),
											Cypress.env('route_users'),
											`/${user.body._id}`,
											Cypress.env('route_users_list'),
											`/${user.body.lists[0]._id}`,
											Cypress.env('route_users_items')
										);
										cy.request({
											method: 'POST',
											url: compoundURL,
											body: {
												itemId: `${createdOrgResponse.body.organization._id}`
											}
										}).should((response) => {
											expect(response.status).to.be.eq(200);
											expect(response.body.updated).to.be.an('boolean');
											expect(response.body.updated).to.be.eq(true);
										});
									});
								});
							});
						}
					);
				});
			});
		});
	});

	it('POST - /v1/users/:userId/lists/:listId/share - Share List via Email - Good Payload', () => {
		cy.fixture('user_share_resource.json').then((share_user) => {
			cy.get('@new_user').then((new_user) => {
				cy.addUser(new_user).then((addedUserResponse) => {
					cy.get('@new_user_list').then((new_user_list) => {
						cy.addList(addedUserResponse.body.userInfo._id, new_user_list).then(
							() => {
								cy.getUser(addedUserResponse.body.userInfo._id).then((user) => {
									compoundURL = Cypress.env('baseUrl').concat(
										Cypress.env('version'),
										Cypress.env('route_users'),
										`/${user.body._id}`,
										Cypress.env('route_users_list'),
										`/${user.body.lists[0]._id}`,
										`/share`
									);
									cy.request({
										method: 'POST',
										url: compoundURL,
										body: {
											email: `${share_user.email}`,
											shareType: 'collection',
											shareUrl: `cool-org`
										}
									}).should((response) => {
										expect(response.status).to.be.eq(200);
										expect(response.body.updated).to.be.an('boolean');
										expect(response.body.updated).to.be.eq(true);
										expect(response.body.sent).to.be.an('boolean');
										expect(response.body.sent).to.be.eq(true);
										expect(response.body.resource).to.exist;
										expect(
											response.body.resource.shared_with
										).to.exist.and.have.lengthOf(1);
										expect(response.body.resource.visibility).to.eq('shared');
										expect(response.body.resource.shared_with[0].email).to.eq(
											share_user.email
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
	it('POST - /v1/users/:userId/lists/:listId/share - Share List via Email - Bad Payload', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@new_user_list').then((new_user_list) => {
					cy.addList(addedUserResponse.body.userInfo._id, new_user_list).then(
						() => {
							cy.getUser(addedUserResponse.body.userInfo._id).then((user) => {
								compoundURL = Cypress.env('baseUrl').concat(
									Cypress.env('version'),
									Cypress.env('route_users'),
									`/${user.body._id}`,
									Cypress.env('route_users_list'),
									`/${user.body.lists[0]._id}`,
									Cypress.env('route_share')
								);
								cy.request({
									method: 'POST',
									url: compoundURL,
									body: {},
									failOnStatusCode: false
								}).should((response) => {
									expect(response.status).to.be.eq(400);
									expect(response.body.error).to.be.an('boolean');
									expect(response.body.error).to.be.eq(true);
								});
							});
						}
					);
				});
			});
		});
	});

	it('DELETE - /v1/users/:userId/lists/:listId/items/:itemId - Delete Item from list - Bad User', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@new_user_list').then((new_user_list) => {
					cy.addList(addedUserResponse.body.userInfo._id, new_user_list).then(
						() => {
							cy.getUser(addedUserResponse.body.userInfo._id).then((user) => {
								cy.get('@organization').then((org) => {
									cy.addOrg(org).then((createdOrgResponse) => {
										cy.addListItem(
											user.body,
											createdOrgResponse.body.organization._id
										).then(() => {
											compoundURL = Cypress.env('baseUrl').concat(
												Cypress.env('version'),
												Cypress.env('route_users'),
												`/BadddUserId`,
												Cypress.env('route_users_list'),
												`/${user.body.lists[0]._id}`,
												Cypress.env('route_users_items'),
												`/${createdOrgResponse.body.organization._id}`
											);
											cy.request({
												method: 'DELETE',
												url: compoundURL,
												failOnStatusCode: false
											}).should((response) => {
												expect(response.status).to.be.eq(500);
											});
										});
									});
								});
							});
						}
					);
				});
			});
		});
	});

	it('DELETE - /v1/users/:userId/lists/:listId/items/:itemId - Delete Item from list - Bad Org ID', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@new_user_list').then((new_user_list) => {
					cy.addList(addedUserResponse.body.userInfo._id, new_user_list).then(
						() => {
							cy.getUser(addedUserResponse.body.userInfo._id).then((user) => {
								cy.get('@organization').then((org) => {
									cy.addOrg(org).then((createdOrgResponse) => {
										cy.addListItem(
											user.body,
											createdOrgResponse.body.organization._id
										).then(() => {
											compoundURL = Cypress.env('baseUrl').concat(
												Cypress.env('version'),
												Cypress.env('route_users'),
												`/${user.body._id}`,
												Cypress.env('route_users_list'),
												`/BadOrgID`,
												Cypress.env('route_users_items'),
												`/${createdOrgResponse.body.organization._id}`
											);
											cy.request({
												method: 'DELETE',
												url: compoundURL,
												failOnStatusCode: false
											}).should((response) => {
												expect(response.status).to.be.eq(404);
											});
										});
									});
								});
							});
						}
					);
				});
			});
		});
	});

	it('DELETE - /v1/users/:userId/lists/:listId/items/:itemId - Delete Item from list - Bad List Item ID', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@new_user_list').then((new_user_list) => {
					cy.addList(addedUserResponse.body.userInfo._id, new_user_list).then(
						() => {
							cy.getUser(addedUserResponse.body.userInfo._id).then((user) => {
								cy.get('@organization').then((org) => {
									cy.addOrg(org).then((createdOrgResponse) => {
										cy.addListItem(
											user.body,
											createdOrgResponse.body.organization._id
										).then(() => {
											compoundURL = Cypress.env('baseUrl').concat(
												Cypress.env('version'),
												Cypress.env('route_users'),
												`/${user.body._id}`,
												Cypress.env('route_users_list'),
												`/${user.body.lists[0]._id}`,
												Cypress.env('route_users_items'),
												`/BadListItem`
											);
											cy.request({
												method: 'DELETE',
												url: compoundURL,
												failOnStatusCode: false
											}).should((response) => {
												expect(response.status).to.be.eq(404);
											});
										});
									});
								});
							});
						}
					);
				});
			});
		});
	});

	it('DELETE - /v1/users/:userId/lists/:listId/items/:itemId - Delete Item from list - Good List Item ID', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@new_user_list').then((new_user_list) => {
					cy.addList(addedUserResponse.body.userInfo._id, new_user_list).then(
						() => {
							cy.getUser(addedUserResponse.body.userInfo._id).then((user) => {
								cy.get('@organization').then((org) => {
									cy.addOrg(org).then((createdOrgResponse) => {
										cy.addListItem(
											user.body,
											createdOrgResponse.body.organization._id
										).then(() => {
											compoundURL = Cypress.env('baseUrl').concat(
												Cypress.env('version'),
												Cypress.env('route_users'),
												`/${user.body._id}`,
												Cypress.env('route_users_list'),
												`/${user.body.lists[0]._id}`,
												Cypress.env('route_users_items'),
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
							});
						}
					);
				});
			});
		});
	});

	it('DELETE - /v1/users/:userid/lists/:listId - Delete List  - Good List ID', () => {
		cy.get('@new_user').then((new_user) => {
			cy.addUser(new_user).then((addedUserResponse) => {
				cy.get('@new_user_list').then((new_user_list) => {
					cy.addList(addedUserResponse.body.userInfo._id, new_user_list).then(
						() => {
							cy.getUser(addedUserResponse.body.userInfo._id).then((user) => {
								cy.get('@organization').then((org) => {
									cy.addOrg(org).then((createdOrgResponse) => {
										cy.addListItem(
											user.body,
											createdOrgResponse.body.organization._id
										).then(() => {
											compoundURL = Cypress.env('baseUrl').concat(
												Cypress.env('version'),
												Cypress.env('route_users'),
												`/${user.body._id}`,
												Cypress.env('route_users_list'),
												`/${user.body.lists[0]._id}`
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
						}
					);
				});
			});
		});
	});

	after(() => {
		//Delete temp_data folder
		cy.exec('rm -fr '.concat(Cypress.env('filePath')));
	});
});
