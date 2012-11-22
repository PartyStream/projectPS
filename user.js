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

  console.log('Creating user');
  console.dir(user);
  var query;

  query = client.query({
    name: 'insert user',
    text: "INSERT INTO users(username, password,date_created,first_name,last_name,dob) values($1, $2,current_timestamp,$3,$4,$5)",
    values: [user.username, user.password, user.first_name, user.last_name, user.dob]
  });

  query.on('error',function(err) { console.log('Unable to create user: '+ err); } );
  
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
    name: 'read user',
    text: "SELECT * from users where id = $1",
    values: [userId]
  });

  
  // return the user retrieved
  query.on('row', function(row)
  {
    console.log("Hello World");
    var json;
    if (row !== null)
    {
      console.log("User Found");
      console.dir(row);
      json = JSON.stringify(row);
    }
    else
    {
      console.log("User Not Found");
      json = "User not found";
    }
    

    console.log(json);
    response.writeHead(200, {'content-type':'application/json', 'content-length':json.length});
    response.end(json);
  });

  query.on('error',function(err) { console.log('Unable to read a user: '+ err); } );
  
    
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
function readUsers(response,client)
{
  console.log('Getting all users');

  var query;
  var data = [];

  query = client.query({
    name: 'read users',
    text: "SELECT * from users"
  });

   // return the user retrieved
  query.on('row', function(row) {
      data.push(row);
  });

  query.on('end', function() {
    // client.end();
    var json = JSON.stringify(data);
    console.log(json);
    response.writeHead(200, {'content-type':'application/json', 'content-length':json.length});
    response.end(json);
  });

  query.on('error',function(err) { console.log('Unable to read a user: '+ err); } );
  
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
+   \param userObject  The user data to update
+   \param client     (PSQL) PSQL client object
+
+   \return True if pass, False otherwise
**/
function updateUser(response,userObject,client)
{
  console.log('updating user: ' + userObject);
  // userObject = '{"firstName":"Test","lastName":"User","dob":"1900-01-01","id":"1"}';
  var user   = JSON.parse(userObject);
  var query;

  query = client.query({
    name: 'update user',
    text: "UPDATE users SET first_name = $1,last_name = $2, dob = $3 WHERE id = $4",
    values: [user.firstName, user.lastName, user.dob, user.id]
  });
  
  query.on('error',function(err) { console.log('DB Error Caught: '+ err); } );
  
  // query.on('end', function(result) {
  //   // console.log(result.command);
  //   client.end();
  // });

  // Send response to client
  response.writeHead(200,{"Content-Type":"text/plain"});
  response.write("User Updated!");
  response.end();
    
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

  query.on('error',function(err) { console.log('DB Error Caught: '+ err); } );
  
  // query.on('end', function(result) {
  //   // console.log(result.command);
  //   client.end();
  // });

  response.writeHead(200, {'content-type':'text/plain'});
  response.write("User deleted!");
  response.end();
}// END function deleteUser
exports.deleteUser = deleteUser;