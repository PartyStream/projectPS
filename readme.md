### Are you a Party Stream contributor? If you are, please read the [wiki](https://github.com/PartyStream/projectPS/wiki) for guidelines and how-tos.

Party Stream API
=============

This is the API for the Party Stream project. It is a RESTFul API that runs on Node.js and on Heroku's servers.

To run the API, from the project root run:
`foreman start`

All of the application code is located in `api/` directory. The main file is `web.js`, this file includes each of the modules for all the objects (user, pictures, event, authenticate and amazonS3).


Available Commands:
---------------------


## Auth Object

### Create
POST /authenticate

    credentials => {
        username and/or password
    }

## User Object

### Create

    This will create a user

POST /user

    user => {
        username
        password
        first_name
        last_name
        dob
    }

### Read User

    This function will return a user object to the client

GET /user/:id


### Read Users

    This function will return all user objects to the client

GET /user

### Update

    This function will update a user object details

PUT /user

    user => {
        username
        password
        first_name
        last_name
        dob
    }

### Delete

    This function will delete a user object from the DB

DELETE /user/:id

## Event Object

### Create

    This will create a event

POST /event

    partyEvent => {
        name
        userId
    }

### Read Event

    This function will return a event object to the client

GET /event/:id


### Read Events

    This function will get all events a user is part of

GET /event_all/:id

### Update

    This function will update an event by adding users to it

PUT /event

    partyEvent => {
        eventUsers = array(
        userId
        )
    }

### Delete

    This function will delete a event object from the DB

DELETE /event/:id

## Pictures Object

### Create

    This function will create a picture object

POST /picture

    evenId
    userId
    [file]picture

### Read Pictures

    This function will return all picture objects for a given event

GET /pictures/:eventId

### Read A Picture

    This function sends back a single picture

GET /picture/:eventId/:pictureId
