/* eslint-disable no-undef */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --

// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
let compoundURL = null;

//Authentication Functions
Cypress.Commands.add('login', (creds_json) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_auth')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: creds_json
	});
});

//Organizations Functions
//Add Org
Cypress.Commands.add('addOrg', (org) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: org
	});
});

Cypress.Commands.add('addOrgOwner', (orgId, userId, userEmail) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${orgId}`,
		Cypress.env('route_organizations_owners')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: {
			email: userEmail,
			userId: userId
		}
	});
});

//Get Org By ID
Cypress.Commands.add('getOrgById', (id) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${id}`
	);
	cy.request({
		method: 'GET',
		url: compoundURL
	});
});

//Delete Org by ID
Cypress.Commands.add('deleteOrgById', (id) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${id}`
	);
	cy.request({
		method: 'DELETE',
		url: compoundURL
	});
});

//Add Service to org
Cypress.Commands.add('addServiceToOrg', (orgId, service) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${orgId}`,
		Cypress.env('route_services')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: service
	});
});

//Add Rating to Org
Cypress.Commands.add('addRatingToOrg', (orgId, rating) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${orgId}`,
		Cypress.env('route_ratings')
	);
	cy.request({
		method: 'PATCH',
		url: compoundURL,
		body: rating
	});
});

//Add Comment to Org
Cypress.Commands.add('addCommentToOrg', (orgId, comment) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${orgId}`,
		Cypress.env('route_comments')
	);
	cy.request({
		method: 'PATCH',
		url: compoundURL,
		body: comment
	});
});

//Add Suggestion to Org
Cypress.Commands.add('addSuggestionToOrg', (suggestion) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_suggestions')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: suggestion
	});
});

//Get Suggestions from Org ID - Consider making this return all the suggestions for the org
Cypress.Commands.add('getSuggestionByOrgId', () => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_suggestions')
	);
	cy.request({
		method: 'GET',
		url: compoundURL
	});
});

//Add Comment to Service
Cypress.Commands.add('addCommentToService', (orgId, serviceId, comment) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${orgId}`,
		Cypress.env('route_services'),
		`/${serviceId}`,
		Cypress.env('route_comments')
	);

	cy.request({
		method: 'PATCH',
		url: compoundURL,
		body: comment
	});
});

//Add Rating to Service
Cypress.Commands.add('addRatingToService', (orgId, serviceId, rating) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${orgId}`,
		Cypress.env('route_services'),
		`/${serviceId}`,
		Cypress.env('route_ratings')
	);

	cy.request({
		method: 'PATCH',
		url: compoundURL,
		body: rating
	});
});

//Get User
Cypress.Commands.add('getUser', (user_id) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_users'),
		`/${user_id}`
	);
	cy.request({
		method: 'GET',
		url: compoundURL
	});
});

//Add User
Cypress.Commands.add('addUser', (user_data) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_users')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: user_data
	});
});

//Delete User
Cypress.Commands.add('deleteUser', (user_id) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_users'),
		`/${user_id}`
	);
	cy.request({
		method: 'DELETE',
		url: compoundURL
	});
});

//Create Favorites List
Cypress.Commands.add('addList', (user_id, list) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_users'),
		`/${user_id}`,
		Cypress.env('route_users_list')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: list
	});
});

//Delete Favorites List
Cypress.Commands.add('deleteListById', (user_id, list_id) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_users'),
		`/${user_id}`,
		Cypress.env('route_users_list'),
		`/${list_id}`
	);
	cy.request({
		method: 'DELETE',
		url: compoundURL
	});
});

//Add Item to Favorites List
Cypress.Commands.add('addListItem', (user, itemId) => {
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
			itemId: `${itemId}`
		}
	});
});

//GET Reviews
Cypress.Commands.add('getReviews', () => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_reviews')
	);
	cy.request({
		method: 'GET',
		url: compoundURL
	});
});

//Add Review
Cypress.Commands.add('addReview', (review) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_reviews')
	);
	cy.request({
		method: 'POST',
		url: compoundURL,
		body: review
	});
});
//Delete Review by Id
Cypress.Commands.add('deleteReviewById', (id) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_reviews'),
		`/${id}`
	);
	cy.request({
		method: 'DELETE',
		url: compoundURL
	});
});

//GET Suggestions
Cypress.Commands.add('getSuggestions', () => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_suggestions')
	);
	cy.request({
		method: 'GET',
		url: compoundURL
	});
});

//Add Suggestion
Cypress.Commands.add('addSuggestion', (suggestion) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_suggestions')
	);
	cy.request({
		method: 'DELETE',
		url: compoundURL,
		body: suggestion
	});
});

//Delete Suggestion by Id
Cypress.Commands.add('deleteSuggestionById', (id) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_suggestions'),
		`/${id}`
	);
	cy.request({
		method: 'DELETE',
		url: compoundURL
	});
});

Cypress.Commands.add('addNoteToOrg', (note, created_at, orgId) => {
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_organizations'),
		`/${orgId}`
	);
	cy.request({
		method: 'GET',
		url: compoundURL
	}).then((response) => {
		cy.request({
			method: 'PATCH',
			url: compoundURL,
			body: {
				notes_log: [
					...response.body.notes_log,
					{
						note: note,
						created_at: created_at
					}
				]
			}
		});
	});
});

Cypress.Commands.add(
	'addNoteToService',
	(note, created_at, orgId, serviceId) => {
		compoundURL = Cypress.env('baseUrl').concat(
			Cypress.env('version'),
			Cypress.env('route_organizations'),
			`/${orgId}`,
			Cypress.env('route_services'),
			`/${serviceId}`
		);
		cy.request({
			method: 'GET',
			url: compoundURL
		}).then((response) => {
			cy.request({
				method: 'PATCH',
				url: compoundURL,
				body: {
					notes_log: [
						...response.body.notes_log,
						{
							note: note,
							created_at: created_at
						}
					]
				}
			});
		});
	}
);

// -------------- Cleaning Functions ------------------
//Users
Cypress.Commands.add('deleteUsersIfExist', () => {
	cy.log('Cleaning Users...');
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_users')
	);
	cy.request({
		method: 'GET',
		url: compoundURL
	}).then((response) => {
		let usersArray = response.body.users;
		usersArray.forEach((user) => {
			//Regular User
			if (
				user.email === 'automation@gmail.com' ||
				user.email === 'automation-updated@gmail.com'
			) {
				cy.deleteUser(user._id);
			}
		});
	});
});

//Organizations
Cypress.Commands.add('deleteOrgsIfExist', () => {
	cy.log('Cleaning Orgs...');
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_slug_organizations'),
		'/surprisingly-unique-organizations-slug'
	);
	cy.request({
		method: 'GET',
		url: compoundURL,
		failOnStatusCode: false
	}).then((response) => {
		if (!response.body.notFound) {
			cy.deleteOrgById(response.body._id);
		}
	});
});

//Reviews
Cypress.Commands.add('deleteAutomationReviews', () => {
	cy.log('Cleaning Reviews...');
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_reviews')
	);
	cy.request({
		method: 'GET',
		url: compoundURL
	}).then((response) => {
		let reviewsArray = response.body.reviews;
		reviewsArray.forEach((review) => {
			if (review.comment == 'Automated Comment') {
				cy.deleteReviewById(review._id);
			}
		});
	});
});

//Suggestions
Cypress.Commands.add('deleteAutomationSuggestions', () => {
	cy.log('Cleaning Suggestions...');
	compoundURL = Cypress.env('baseUrl').concat(
		Cypress.env('version'),
		Cypress.env('route_suggestions'),
		'/automation@gmail.com'
	);
	cy.request({
		method: 'GET',
		url: compoundURL
	}).then((response) => {
		let suggestionArray = response.body;
		suggestionArray.forEach((suggestion) => {
			cy.deleteSuggestionById(suggestion._id);
		});
	});
});
//Need Comments
