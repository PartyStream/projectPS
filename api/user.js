/**
//
//  user.js
//  projectPS
//
//    This is the User Model of the PartyStream project
//
//  Created by Salvatore D'Agostino on 2012-10-14 21:33
//  Copyright 2012. All rights reserved.
//
**/

/**
+   \brief getUserByIdForAuth
+
+       This function will get a user for authentication
+
+   \author Salvatore D'Agostino
+   \date  2013-07-05 20:50
+   \param userId   The ID of the user to be returned
+   \param client   The connection to PSQL
+   \param fn       A function to return
+
+   \return (OBJECT) The user object, False if not found
**/
function getUserByIdForAuth(userId,client,fn)
{

  console.log('Reading user by ID for authentication: ' + userId);

  var query;

  query = client.query({
    name: 'find user by id',
    text: "SELECT username,password from users WHERE id = $1",
    values: [userId]
  });

  // return the user retrieved
  query.on('row', function(row){
    console.log('User Found By ID');
    fn(null,row);
  });

  query.on('end', function(result){
    if (result === false) {
      console.log("Error: User not found by ID");
      fn(null,false);
    } else if(result.rowCount === 0) {
      console.log("Error: User not found by ID");
      fn(null,false);
    }
  });

}// END function getUserByIdForAuth
exports.getUserByIdForAuth = getUserByIdForAuth;



/**
+   \brief getUserByNameForAuth
+
+       This function will get a user for authentication
+
+   \author Salvatore D'Agostino
+   \date  2013-07-05 20:50
+   \param username  The ID of the user to be returned
+   \param client    The connection to PSQL
+   \param fn        A function to return
+
+   \return (OBJECT) The user object, False if not found
**/
function getUserByNameForAuth(username,client,fn)
{

  console.log('Reading user for authentication: ' + username);

  var query;

  query = client.query({
    name: 'find user by name',
    text: "SELECT username,password from users WHERE username = $1",
    values: [username]
  });

  // return the user retrieved
  query.on('row', function(row){
    console.log("User Found By Name");
    fn(null,row);
  });

  query.on('error',function(err) {
    console.log("Error: User not found by Name");
    console.dir(err);
  });

  query.on('end', function(result){
    if (result === false) {
      console.log("Error: User not found by ID");
      fn(null,false);
    } else if(result.rowCount === 0) {
      console.log("Error: User not found by ID");
      fn(null,false);
    }
  });

}// END function getUserByNameForAuth
exports.getUserByNameForAuth = getUserByNameForAuth;

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
  var bcrypt = require('bcrypt-nodejs');

  console.log('Creating user');
  console.dir(user);

  // Check if user already exists
  getUserByNameForAuth(user.username,client,function(err,userExists){
    if (err) {
      throw err
    } else if (userExists === false) {
      console.dir(user);
      console.dir(userExists);
      // Hash Password
      bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) {throw err};
        var query;
        query = client.query({
          name: 'insert user',
          text: "INSERT INTO users("+
            "username,status,password,date_created,first_name,last_name,dob,email)"+
            "values($1,'1',$2,current_timestamp,$3,$4,$5,$6)",
          values: [ user.username,
                    hash,
                    user.first_name,
                    user.last_name,
                    user.dob,
                    user.email
                  ]
        });

        query.on('error',function(err) {
          console.log('Unable to create user: '+ err);
        });

        // Send response to client
        query.on('end', function(result){
          if (result === false) {
            restResponse.returnRESTResponse(
              response,
              true,
              "Could not create user",
              null);
          } else if (result.rowCount === 0 || result.rowCount === null) {
            restResponse.returnRESTResponse(
              response,
              true,
              "Could not create user",
              null);
          } else {
            restResponse.returnRESTResponse(
              response,
              false,
              "User Created",
              null);
          }
        });
      });
    } else {
      // User already exists
      console.log('User already exists!');
      console.dir(user);
      console.dir(userExists);
      restResponse.returnRESTResponse(
        response,
        true,
        "Username taken",
        null);
    }
  });
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
+   \param username  The username of the user to get
+   \param client    (PSQL) PSQL client object
+
+   \return User object, False otherwise
**/
function readUser(response,username,client)
{
  console.log('Reading user: ' + username);

  var query, data = [];

  query = client.query({
    name: 'read a user',
    text: "SELECT id,status,username,email,first_name,last_name,dob,"+
            "date_created,date_updated "+
            "FROM users "+
            "WHERE username = $1",
    values: [username]
  });

  // return the user retrieved
  query.on('row', function(row){
    data.push(row);
  });

  query.on('end', function(result) {
      console.log(result.rowCount + ' rows were received');
      if (result.rowCount == 0) {
        restResponse.returnRESTResponse(
          response,
          true,
          "Oops, we can't process that",
          null);
      } else {
        console.log(data);
        restResponse.returnRESTResponse(
          response,
          false,
          "Found User",
          data);
      }
    });

  query.on('error',function(err) {
    restResponse.returnRESTResponse(
      response,
      true,
      "Oops, we can't process that",
      null);
  });


}// END function readUser
exports.readUser = readUser;

/**
+  \brief readUsers
+
+      This function will return all user objects to the client
+
+  \author Salvatore D'Agostino
+  \date  2012-11-05 20:47
+  \param response  The response to return to the client
+  \param client  (PSQL) PSQL client object
+
+  \return JSON ARRAY of all user objects, False otherwise
**/
function readUsers(response,client,start,limit)
{
  if(typeof(start)==='undefined') start = 0;
  if(typeof(limit)==='undefined') limit = 25;
  console.log('Getting all users');

  var query;
  var data = [];

  query = client.query({
    name: 'read users',
    text: "SELECT * from users limit $1 offset $2",
    values: [limit,start]
  });

console.dir(query);
   // return the user retrieved
  query.on('row', function(row) {
      data.push(row);
  });

  query.on('end', function() {
    // client.end();
    restResponse.returnRESTResponse(
      response,
      false,
      "User Listing",
      data);
  });

  query.on('error',function(err) {
    console.log('Unable to read a users');
    restResponse.returnRESTResponse(
      response,
      true,
      "Unable to read users",
      null);
  });

}// END function readUsers
exports.readUsers = readUsers;

/**
+   \brief updateUser
+
+       This function will update a user object details
+
+   \author Salvatore D'Agostino
+   \date  2012-10-14 21:46
+   \param response    The response to return to the client
+   \param userId      The ID of the user to update
+   \param userObject  The user data to update
+   \param client     (PSQL) PSQL client object
+
+   \return True if pass, False otherwise
**/
function updateUser(response,userId,userObject,client)
{
  console.log('updating user: ' + userId);
  var updateUser   = JSON.parse(userObject);

  this.getUserByIdForAuth(userId,client,function(err,user){
    if (err) {
      console.log('Error while updating user');
      restResponse.returnRESTResponse(
        response,
        true,
        "User does not exist",
        user);
    } else if (user === false) {
      console.log('User not found for update');
      restResponse.returnRESTResponse(
        response,
        true,
        "User does not exist",
        null);
    } else {
      console.log('Updating user');
      var query;

      query = client.query({
        name: 'update user',
        text: "UPDATE users "+
                "SET first_name = $1, last_name = $2, dob = $3 "+
                "WHERE id = $4",
        values: [updateUser.firstName,
                  updateUser.lastName,
                  updateUser.dob,
                  userId]
      });

      query.on('end',function(result) {
        console.dir(result);
        if (result === false){
          restResponse.returnRESTResponse(
            response,
            true,
            "Could not update user",
            null);
        } else {
          restResponse.returnRESTResponse(
            response,
            false,
            "Updated user",
            null);
        }
      });
    }
  });
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
+   \param client     (PSQL) PSQL client object
+
+   \return True if pass, False otherwise
**/
function deleteUser(response,userId,client)
{
  console.log('Deleting user: ' + userId);

  this.getUserByIdForAuth(userId,client,function(err,user){
    if (err) {
      console.log('Error while deleting user');
      restResponse.returnRESTResponse(
        response,
        true,
        "User does not exist",
        user);
    } else if (user === false) {
      console.log('User not found for delete');
      restResponse.returnRESTResponse(
        response,
        true,
        "User does not exist",
        null);
    } else {
      var query;

      query = client.query({
        name: 'delete user',
        text: "UPDATE users SET status = '0' where id = $1",
        values: [userId]
      });

      query.on('end', function(result) {
        console.dir(result);
        if (result === false){
          restResponse.returnRESTResponse(
            response,
            true,
            "Could not delete user",
            null);
        } else {
          restResponse.returnRESTResponse(
            response,
            false,
            "Deleted user",
            null);
        }
      });
    }
  });
}// END function deleteUser
exports.deleteUser = deleteUser;