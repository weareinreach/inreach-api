/* eslint-disable no-undef */
/// <reference types="cypress" />

//compound url
let compoundURL = null;

//Routes Constants

describe('Users Routers', () => {
	before(() => {
		cy.fixture('org_good_format.json').then((org) => {
			//Add Automation Org
			cy.addOrg(org).then((response) => {
				cy.writeFile(
					Cypress.env('filePath').concat('/org_created.json'),
					response.body
				);
			});
		});
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
	context("user doesn't exist", () => {
		let user_id = '';
		it('POST - /v1/users - Create User - New User - No Password', () => {
			compoundURL = Cypress.env('baseUrl').concat(
				Cypress.env('version'),
				Cypress.env('route_users')
			);
			cy.fixture('user_new_bad.json').then((new_user_bad) => {
				cy.request({
					method: 'POST',
					url: compoundURL,
					body: new_user_bad,
					failOnStatusCode: false
				}).should((response) => {
					expect(response.status).to.be.eq(500);
				});
			});
		});

		it('POST - /v1/users - Create User - New User - Good Data', () => {
			compoundURL = Cypress.env('baseUrl').concat(
				Cypress.env('version'),
				Cypress.env('route_users')
			);
			cy.fixture('user_new.json').then((new_user) => {
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
					user_id = response.body.userInfo._id;
				});
			});
		});
		after(() => {
			cy.deleteUser(user_id);
		});
	});
	context('user exists', () => {
		before(() => {
			cy.fixture('user_new.json').then((new_user) => {
				cy.addUser(new_user).then((response) => {
					//Save ID of User
					cy.writeFile(Cypress.env('filePath').concat('created_user.json'), response.body);
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
			cy.readFile(Cypress.env('filePath').concat('/created_user.json')).then(
				(user) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_users'),
						`/${user.userInfo._id}`
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
				}
			);
		});

		it('POST - /v1/users - Create User - Existing User', () => {
			compoundURL = Cypress.env('baseUrl').concat(
				Cypress.env('version'),
				Cypress.env('route_users')
			);
			cy.fixture('user_new.json').then((new_user) => {
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
		});

		it('PATCH - /v1/users/:userId  - Patch User', () => {
			cy.fixture('user_new_update.json').then((new_user_update) => {
				cy.readFile(Cypress.env('filePath').concat('/created_user.json')).then(
					(user) => {
						cy.request({
							method: 'PATCH',
							url: (compoundURL = Cypress.env('baseUrl').concat(
								Cypress.env('version'),
								Cypress.env('route_users'),
								`/${user.userInfo._id}`
							)),
							body: new_user_update
						}).should((response) => {
							//Verify positive response from server
							expect(response.status).to.be.eq(200);
							expect(response.body.updated).to.be.an('boolean');
							expect(response.body.updated).to.be.eq(true);
							//Get User using Commands and verify update was applied
							cy.getUser(user.userInfo._id).should((response) => {
								expect(response.body.name).to.be.an('string');
								expect(response.body.name).to.be.eq(new_user_update.name);
								expect(response.body.email).to.be.an('string');
								expect(response.body.email).to.be.eq(new_user_update.email);
								expect(response.body.age).to.be.an('string');
								expect(response.body.age).to.be.eq(new_user_update.age);
							});
						});
					}
				);
			});
		});

		it('PATCH - /v1/users/:userId/password - Update Password - Bad User Id', () => {
			cy.readFile(Cypress.env('filePath').concat('/created_user.json')).then(
				(createdUser) => {
					cy.fixture('user_new_password.json').then((new_password) => {
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
				}
			);
		});

		it('PATCH - /v1/users/:userId/password - Update Password - Bad User Id - Bad Password', () => {
			cy.readFile(Cypress.env('filePath').concat('/created_user.json')).then(
				(createdUser) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_users'),
						`/${createdUser.userInfo._id}`,
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
				}
			);
		});

		it('PATCH - /v1/users/:userId/password - Update Password - Good Password', () => {
			cy.readFile(Cypress.env('filePath').concat('/created_user.json')).then(
				(createdUser) => {
					cy.fixture('user_new_password.json').then((new_password) => {
						compoundURL = Cypress.env('baseUrl').concat(
							Cypress.env('version'),
							Cypress.env('route_users'),
							`/${createdUser.userInfo._id}`,
							Cypress.env('route_users_password')
						);
						cy.request({
							method: 'PATCH',
							url: compoundURL,
							body: new_password,
							failOnStatusCode: false
						}).should((response) => {
							expect(response.status).to.be.eq(200);
						});
					});
				}
			);
		});

		it('POST - /v1/users/:userid/lists - Add user lists', () => {
			cy.readFile(Cypress.env('filePath').concat('/created_user.json')).then(
				(user) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_users'),
						`/${user.userInfo._id}`,
						Cypress.env('route_users_list')
					);
					cy.fixture('user_new_list.json').then((user_list) => {
						cy.request({
							method: 'POST',
							url: compoundURL,
							body: user_list
						}).should((response) => {
							expect(response.status).to.be.eq(200);
							expect(response.body.created).to.be.an('boolean');
							expect(response.body.created).to.be.eq(true);
							cy.getUser(user.userInfo._id).then((response) => {
								expect(response.body.lists[0].name).to.be.an('string');
								expect(response.body.lists[0].name).to.be.eq(user_list.name);
								//Save user with new list in it
								cy.writeFile(
									Cypress.env('filePath').concat('/created_user_list.json'),
									response.body
								);
							});
						});
					});
				}
			);
		});

		it('POST - /v1/users/forgotPassword - Forgot Password - Bad Email', () => {
			compoundURL = Cypress.env('baseUrl').concat(
				Cypress.env('version'),
				Cypress.env('route_users'),
				Cypress.env('route_users_forgot_password')
			);
			cy.request({
				method: 'POST',
				url: compoundURL,
				failOnStatusCode: false
			}).should((response) => {
				expect(response.status).to.be.eq(400);
				expect(response.body).to.be.an('string');
				expect(response.body).to.be.eq('That email does not exist!');
			});
		});

		it('POST - /v1/users/forgotPassword - Forgot Password - Good Email', () => {
			compoundURL = Cypress.env('baseUrl').concat(
				Cypress.env('version'),
				Cypress.env('route_users'),
				Cypress.env('route_users_forgot_password')
			);
			cy.fixture('user_new_update.json').then((new_user_update) => {
				cy.request({
					method: 'POST',
					url: compoundURL,
					body: {
						email: new_user_update.email
					}
				}).should((response) => {
					expect(response.status).to.be.eq(200);
				});
			});

			it('POST - /v1/users/:userId/lists/:listId/items - Add Item to list - Bad User ID', () => {
				cy.readFile(
					Cypress.env('filePath').concat('/created_user_list.json')
				).then((user) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_users'),
						'/BadUserID',
						Cypress.env('route_users_list'),
						`/${user.lists[0]._id}`,
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
			});

			it('POST - /v1/users/:userId/lists/:listId/items - Add Item to list - Bad List ID', () => {
				cy.readFile(
					Cypress.env('filePath').concat('/created_user_list.json')
				).then((user) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_users'),
						`/${user._id}`,
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
			});

			//We dont verify that Item Id is an organization ID this should be a 404
			it('POST - /v1/users/:userId/lists/:listId/items - Add Item to list - Bad List ID', () => {
				cy.readFile(
					Cypress.env('filePath').concat('/created_user_list.json')
				).then((user) => {
					compoundURL = Cypress.env('baseUrl').concat(
						Cypress.env('version'),
						Cypress.env('route_users'),
						`/${user._id}`,
						Cypress.env('route_users_list'),
						`/${user.lists[0]._id}`,
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
			});

			it('POST - /v1/users/:userId/lists/:listId/items - Add Item to list - Good List Item ID', () => {
				cy.readFile(
					Cypress.env('filePath').concat('/created_user_list.json')
				).then((user) => {
					cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
						(org) => {
							compoundURL = Cypress.env('baseUrl').concat(
								Cypress.env('version'),
								Cypress.env('route_users'),
								`/${user._id}`,
								Cypress.env('route_users_list'),
								`/${user.lists[0]._id}`,
								Cypress.env('route_users_items')
							);
							cy.request({
								method: 'POST',
								url: compoundURL,
								body: {
									itemId: `${org.organization._id}`
								}
							}).should((response) => {
								expect(response.status).to.be.eq(200);
								expect(response.body.updated).to.be.an('boolean');
								expect(response.body.updated).to.be.eq(true);
							});
						}
					);
				});
			});

			it('DELETE - /v1/users/:userId/lists/:listId/items/:itemId - Delete Item from list - Bad User', () => {
				cy.readFile(
					Cypress.env('filePath').concat('/created_user_list.json')
				).then((user) => {
					cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
						(org) => {
							compoundURL = Cypress.env('baseUrl').concat(
								Cypress.env('version'),
								Cypress.env('route_users'),
								`/BadddUserId`,
								Cypress.env('route_users_list'),
								`/${user.lists[0]._id}`,
								Cypress.env('route_users_items'),
								`/${org.organization._id}`
							);
							cy.request({
								method: 'DELETE',
								url: compoundURL,
								failOnStatusCode: false
							}).should((response) => {
								expect(response.status).to.be.eq(500);
							});
						}
					);
				});
			});

			it('DELETE - /v1/users/:userId/lists/:listId/items/:itemId - Delete Item from list - Bad Org ID', () => {
				cy.readFile(
					Cypress.env('filePath').concat('/created_user_list.json')
				).then((user) => {
					cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
						(org) => {
							compoundURL = Cypress.env('baseUrl').concat(
								Cypress.env('version'),
								Cypress.env('route_users'),
								`/${user._id}`,
								Cypress.env('route_users_list'),
								`/BadOrgID`,
								Cypress.env('route_users_items'),
								`/${org.organization._id}`
							);
							cy.request({
								method: 'DELETE',
								url: compoundURL,
								failOnStatusCode: false
							}).should((response) => {
								expect(response.status).to.be.eq(404);
							});
						}
					);
				});
			});

			it('DELETE - /v1/users/:userId/lists/:listId/items/:itemId - Delete Item from list - Bad List Item ID', () => {
				cy.readFile(
					Cypress.env('filePath').concat('/created_user_list.json')
				).then((user) => {
					cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
						(org) => {
							compoundURL = Cypress.env('baseUrl').concat(
								Cypress.env('version'),
								Cypress.env('route_users'),
								`/${user._id}`,
								Cypress.env('route_users_list'),
								`/${user.lists[0]._id}`,
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
						}
					);
				});
			});

			it('DELETE - /v1/users/:userId/lists/:listId/items/:itemId - Delete Item from list - Good List Item ID', () => {
				cy.readFile(
					Cypress.env('filePath').concat('/created_user_list.json')
				).then((user) => {
					cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
						(org) => {
							compoundURL = Cypress.env('baseUrl').concat(
								Cypress.env('version'),
								Cypress.env('route_users'),
								`/${user._id}`,
								Cypress.env('route_users_list'),
								`/${user.lists[0]._id}`,
								Cypress.env('route_users_items'),
								`/${org.organization._id}`
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

			it('DELETE - /v1/users - Delete User', () => {
				cy.readFile(Cypress.env('filePath').concat('/created_user.json')).then(
					(user) => {
						compoundURL = Cypress.env('baseUrl').concat(
							Cypress.env('version'),
							Cypress.env('route_users'),
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
			});

			after(() => {
				cy.readFile(Cypress.env('filePath').concat('/org_created.json')).then(
					(org) => {
						cy.deleteOrgById(org.organization._id);
						//Delete temp_data folder
						cy.exec('rm -fr '.concat(Cypress.env('filePath')));
					}
				);
			});
		});
	});
});
