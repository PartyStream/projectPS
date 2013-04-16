/**
//
//  authenticate.js
//  projectPS
//
//    This is the AUthentication Model of the PartyStream project
//
//  Created by Salvatore D'Agostino on 2013-04-14 20:13
//  Copyright 2013. All rights reserved.
//
**/

/**
+   \brief createSession
+
+       This function is responsible for authentication and creating a session for a user
+
+   \author Salvatore D'Agostino
+   \date  2013-04-15 21:23
+   \param response             The response to return to the client
+   \param userObject   (JSON)  The user data to use for authentication
+   \param client       (PSQL)  PSQL client object
+
+   \return Auth token if authentication successful, False otherwise
**/
function createSession(response,userObject,client)
{
    var credentials = JSON.parse(userObject);

    console.log('Authenticating user: ' + credentials.username);

    query = client.query({
        name: 'authenticate',
        text: 'SELECT COUNT(id) from users where username = $1 AND password = $2;',
        values: [user.username, user.password]
    });

    // TODO: If user exists, create session
    // TODO: else throw error


}// END function createSession
exports.createSession = createSession;