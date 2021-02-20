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
const route_auth = '/auth'
const route_auth_check = '/auth/check'
const route_auth_token = '/auth/token'


//Test Suite
describe('Authentication Routers', () => {

    it('POST - /v1/auth - Authentication Page - Bad Credentials', () => {
        compoundURL = `${url}${version}${route_auth}`
        cy.fixture('auth_user_bad_creds.json').then(bad_credentials => {
            cy.request({
                    method: 'POST',
                    url: compoundURL,
                    failOnStatusCode: false,
                    body: bad_credentials
                })
                .should((response) => {
                    expect(response.status).to.be.eq(404);
                    expect(response.body.notFound).to.be.an('boolean');
                    expect(response.body.notFound).to.be.eq(true);

                })
        })

    })

    it('POST - /v1/auth - Authentication Page - Good Credentials', () => {
        compoundURL = `${url}${version}${route_auth}`
        cy.fixture('auth_user_good_creds.json').then(good_crendentials => {
            cy.request({
                    method: 'POST',
                    url: compoundURL,
                    body: good_crendentials
                })
                .should((response) => {
                    expect(response.status).to.be.eq(200);
                    expect(response.body.valid).to.be.an('boolean');
                    expect(response.body.valid).to.be.eq(true);
                    expect(response.body.token).to.be.an('string');
                    expect(response.body.token).to.not.be.empty;

                    //Saving Tokens
                    cy.writeFile(`${filesPath}/token_good.json`,{token:response.body.token})
                    cy.writeFile(`${filesPath}/token_bad.json`,{token:"BaaaaaaaaadToken"})
                })
        })
    })
        
        it('POST - /v1/auth/check - Checking Token - Bad Token', () => {
            compoundURL = `${url}${version}${route_auth_check}`
            cy.readFile(`${filesPath}/token_bad.json`).then(token =>{
                cy.request({
                    method:'POST',
                    url:compoundURL,
                    failOnStatusCode: false,
                    body:token
                })
                .should((response)=>{
                    expect(response.status).to.be.eq(400);
                    expect(response.body.error).to.be.an('boolean');
                    expect(response.body.error).to.be.eq(true);
                    cy.log(response.body);
                })
            })
        } )

        it('POST - /v1/auth/check - Checking Token - Good Token', () => {
            compoundURL = `${url}${version}${route_auth_check}`
            cy.readFile(`${filesPath}/token_good.json`).then(token =>{
                cy.request({
                    method:'POST',
                    url:compoundURL,
                    failOnStatusCode: false,
                    body:token
                })
                .should((response)=>{
                    expect(response.status).to.be.eq(200);
                    expect(response.body).to.not.be.empty;
                    expect(response.body.isDataManager).to.be.an('boolean');
                    expect(response.body.isDataManager).to.be.eq(false);
                    expect(response.body.isProfessional).to.be.an('boolean');
                    expect(response.body.isProfessional).to.be.eq(true);
                    expect(response.body.email).to.be.an('string');
                    //Load good credentials
                    cy.fixture('auth_user_good_creds.json').then(good_crendentials => {
                        expect(response.body.email).to.be.eq(good_crendentials.email);
                    });
                   
                })
            })
        })

    it('GET - /v1/auth/token - Get Token',()=>{
        compoundURL = `${url}${version}${route_auth_token}`
        cy.request(compoundURL)
        .should((response)=>{
            expect(response.status).to.be.eq(200);
            expect(response.body).to.be.an('string');
            expect(response.body).to.not.be.empty;
        }) 
    })


    after(() => {
        //Delete temp_data folder
        cy.exec(`rm -fr ${filesPath}`);
    })

});