## Description

Name: "Record Microservice"

This microservices provides restful endpoints for the user, university and experience collections present in the firestore.
It has access to firebase authentication service to create user account. 

In order to make a request to the exposed enpoints, you need an key-secret pair. We maintain the key-secert pair in our database.
and will share to other microservices. All request headers need to populate provide this pair in Authorization header like `{ApiKey} {ApiSecret}`

All the requests are passed to validation. The validation middleware checks whether authorization headers are proper or not.

Using jest for unit testing and eslint for strict code practices.

## Exposed endpoints are:

USER:

``` POST '/api/record/user/register' ``` - to register user

``` PATCH '/api/record/user/:userId' ``` - to update the name

``` GET '/api/record/user/:userId' ```- get user document as per the userId passed in req params

University:

``` GET '/api/record/university' ``` - get all universities available in the database

``` GET '/api/record/university/:univId' ```- get university document as per the univId passed in req params

Experience:

``` POST '/api/record/experience' ``` - create experience document

``` GET '/api/record/experience/:expId' ``` - get experience document as per the expId passed in req params

``` GET '/api/record/experience?company={}' ``` - retrieves experiences doc containing passed in the query params. if no query param is available, will send all experience docs

``` PUT '/api/record/experience/:expId' ``` - update experience document as per the expId passed in req params

``` Delete '/api/record/experience/:expId' ``` - delete experience document as per the expId passed in req params

Note: All the documents are based on the univId

Using firebase authentication for user account management, firestore for maintaining user, experience and university collections

## Setting up project:

Mandate packages: nodejs, npm, typescript, firebase-tools
`brew install node` (need atleast 16.0.0)
`brew install npm` (need atleast >8.0.0)
`npm install -g firebase-tools`
`npm install -g typescript`

1. clone the project, switch to ```functions``` directory
2. Run npm install  - to install all dependencies
3. Once you have installed the packages, have a walk through around the project.
4. Before running locally, you need to set up an environment variable 
`export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json;`
To run the service locally by ```npm run serve``` and it will hosted in 8060

## Commands
## Project setup
```
npm install
```

### Compiles and emulate the function locally
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### To run test cases and for coverage
```
npm run test
```