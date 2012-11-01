/**
//
//  user.js
//  projectPS
//
//    This is the User Model of the PhotoStream project
//
//  Created by Salvatore D'Agostino on 2012-10-14 21:33
//  Copyright 2012. All rights reserved.
//
**/

/**
+   \brief createUser
+
+       This will create a user
+
+   \author Salvatore D'Agostino
+   \date  2012-10-14 21:41
+   \param response   The reponse to return to the client
+   \param userObject (JSON) The user data to insert
+   \param client     (PSQL) PSQL client object
+
+   \return True if pass, False otherwise
**/
function createUser(response,userObject,client)
{
    
    var user   = JSON.parse(userObject);

    console.log('Creating user:');
    var query;

    query = client.query({
      name: 'insert user',
      text: "INSERT INTO users(username, password,date_created) values($1, $2,current_timestamp)",
      values: [user.username, user.password]
    });
    
    query.on('end', function() { client.end(); });

    // Send response to client
    response.writeHead(200,{"Content-Type":"text/plain"});
    response.write("Create User! ");
    response.end();
    
}// END function createUser
exports.createUser = createUser;

/**
+   \brief readUser
+
+       This function will return a user object to the client
+
+   \author Salvatore D'Agostino
+   \date  2012-10-14 21:44
+   \param response  The response to return to the client
+   \param userId    The ID of the user to get
+   \param client    (PSQL) PSQL client object
+
+   \return User object, False otherwise
**/
function readUser(response,userId,client)
{
    console.log('Reading user: ' + userId);

    var query;

    query = client.query({
      name: 'insert user',
      text: "SELECT * from users where id = $1",
      values: [userId]
    });

    // return the user retrieved
    query.on('row', function(row) {
        var json = JSON.stringify(row);
        console.log(json);
        response.writeHead(200, {'content-type':'application/json', 'content-length':json.length});
        response.end(json);
    });
    
}// END function readUser
exports.readUser = readUser;

/**
+   \brief updateUser
+
+       This function will update a user object details
+
+   \author Salvatore D'Agostino
+   \date  2012-10-14 21:46
+   \param response    The response to return to the client
+   \param userObject  The user data to update
+
+   \return True if pass, False otherwise
**/
function updateUser(response,userObject)
{
    // TODO update a user record
    console.log('Updating a user');
    
}// END function updateUser
exports.updateUser = updateUser;

/**
+   \brief deleteUser
+
+       This function will delete a user object from the DB
+
+   \author Salvatore D'Agostino
+   \date  2012-10-14 21:48
+   \param reponse    The response to return to the client
+   \param userId     The ID of the user to delete
+
+   \return True if pass, False otherwise
**/
function deleteUser(reponse,userId)
{
    // TODO delete a user record
    console.log('Deleting a user');
    
}// END function deleteUser
exports.deleteUser = deleteUser;