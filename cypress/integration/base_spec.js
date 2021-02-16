/* eslint-disable no-undef */
/// <reference types="cypress" />

//Instantiate up Server variable
const port = process.env.PORT || 8080;
const url = process.env.HOST || `http://localhost:${port}`;

//compound url
let compoundURL = null;

//Routes contants
const route_docs = '/docs'


//Test Suite
describe('Base Routers', () => {
    it('GET - / - Base URL', () => {
        cy.request(url)
            .should((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.ok).to.be.an('boolean');
                expect(response.body.ok).to.be.eq(true);
            })
    })

    it('GET - /docs - Swagger Page', () => {
        compoundURL = `${url}${route_docs}`
        cy.request(compoundURL)
            .should((response) => {
                expect(response.status).to.be.eq(200);
            })
    })
});