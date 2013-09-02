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

  console.log('Reading user for authentication: ' + userId);

  var query;

  query = client.query({
    name: 'read user',
    text: "SELECT username,password from users WHERE id = $1",
    values: [userId]
  });

  // return the user retrieved
  query.on('row', function(row){
    fn(null,row);
  });

  query.on('error',function(err) {
    console.log('DB Error: '+err);
    fn(new Error('User ' + id + ' does not exist'));
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
    name: 'read user',
    text: "SELECT username,password from users WHERE username = $1",
    values: [username]
  });

  // return the user retrieved
  query.on('row', function(row){
    console.dir(row);
    console.log("Row");
    fn(null,row);
  });

  query.on('error',function(err) {
    console.log("Error");
    fn(null,false);
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
      response.writeHead(500, {'content-type':'text/plain'});
      response.write("Could not create User");
      response.end();
    });

    // Send response to client
    query.on('end', function(result){
      response.writeHead(200,{"Content-Type":"text/plain"});
      response.write("Create User! ");
      response.end();
    });
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
        response.writeHead(404, {'content-type':'text/plain'});
        response.write("Oops, we can't process that");
        response.end();
      } else {
        var json = JSON.stringify(data);
        console.log(json);
        response.writeHead(200, {
          'content-type':'application/json',
          'content-length':json.length
        });
        response.end(json);
      }
    });

  query.on('error',function(err) {
      response.writeHead(500, {'content-type':'text/plain'});
      response.write("Oops, we can't process that");
      response.end();
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
  if(typeof(start)==='undefined') start = 1;
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
    var json = JSON.stringify(data);
    console.log(json);
    response.writeHead(
      200,
      {
        'content-type':'application/json',
        'content-length':json.length
      });
    response.end(json);
  });

  query.on('error',function(err) {
    console.log('Unable to read a user: '+ err);
    response.writeHead(500, {'content-type':'text/plain'});
    response.end('Could not get users');
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
  var user   = JSON.parse(userObject);
  console.dir(user);
  var query;

  query = client.query({
    name: 'update user',
    text: "UPDATE users"+
            "SET first_name = $1,last_name = $2, dob = $3"+
            "WHERE id = $4",
    values: [user.firstName, user.lastName, user.dob, userId]
  });

  query.on('error',function(err) {
      response.writeHead(500, {'content-type':'text/plain'});
      response.write("Could not update user");
      response.end();
  });

  query.on('end', function(result) {
    // Send response to client
      response.writeHead(200,{"Content-Type":"text/plain"});
      response.write("User Updated!");
      response.end();
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

  var query;

  query = client.query({
    name: 'delete user',
    text: "UPDATE users SET status = '0' where id = $1",
    values: [userId]
  });

  query.on('error',function(err) {
      response.writeHead(500, {'content-type':'text/plain'});
      response.write("Could not delete user");
      response.end();
  });

  query.on('end', function(result) {
    response.writeHead(200, {'content-type':'text/plain'});
    response.write("User deleted!");
    response.end();
  });
}// END function deleteUser
exports.deleteUser = deleteUser;