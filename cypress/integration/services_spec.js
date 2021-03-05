/* eslint-disable no-undef */
/// <reference types="cypress" />

//TODO CHECK FOR KEYS IN REPONSE

//Instantiate up Server variable
const port = process.env.PORT || 8080;
const url = process.env.HOST || `http://localhost:${port}`;
const filesPath = './cypress/temp_data';
const version = '/v1';

//compound url
let compoundURL = null;

//Routes constants
const route_services = '/services';
const route_services_count = '/services/count';
const route_organizations = '/organizations';

//Test Suite
describe('Services Routers', () => {
	before(() => {
		cy.fixture('org_good_format.json').then((org) => {
			//Add Automation Org
			cy.addOrg(org).then((response) => {
				cy.writeFile(`${filesPath}/org_created.json`, response.body);
			});
		});
	});

	it('GET - /v1/organizations/:orgId/services - Get Organization Services', () => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			compoundURL = `${url}${version}${route_organizations}/${org.organization._id}${route_services}`;
			cy.request({
				method: 'GET',
				url: compoundURL
			}).should((response) => {
				expect(response.status).to.be.eq(200);
			});
		});
	});
	it('GET - /v1/services/count - Get Services Count', () => {
		compoundURL = `${url}${version}${route_services_count}`;
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

	after(() => {
		cy.readFile(`${filesPath}/org_created.json`).then((org) => {
			cy.deleteOrgById(org.organization._id);
			//Delete temp_data folder
			cy.exec(`rm -fr ${filesPath}`);
		});
	});
});
