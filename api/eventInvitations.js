/**
//
//  eventInvitations.js
//  projectPS
//
//    This is the Event Invitation Model of the PartyStream project
//
//  Created by Salvatore D'Agostino on 2013-06-17 22:25
//  Copyright 2012. All rights reserved.
//
**/

/**
+   \brief inviteAUser
+
+       This function will invite a single user to an event
+
+   \author Salvatore D'Agostino
+   \date  2013-06-17 22:27
+   \param response (CONN)  The response to return to the client
+   \param eventId  (INT)   The ID of the event to add the user to
+   \param userId   (INT)   The ID of the user to be invited
+   \param client   (PSQL)  PSQL client object
+
+   \return return
**/
function inviteAUser(response,eventId,userId,client)
{
    console.log('Adding userid: ' + userId + ' to event: ' + eventId);

    var query;

    query = client.query({
        name: 'invite a user to event',
        text: 'INSERT INTO event_users(event_id, user_id, permission) VALUES($1,$2,2)',
        values: [eventId,userId]
    });

    query.on('error',function(err){
        console.log('DB Error Caught: '+ err);
        // Send response to client
        response.writeHead(500,{"Content-Type":"text/plain"});
        response.write("Could not invite user to event, please try again check API logs for error");
        response.end();
    });

    query.on('end',function(){
        // Send response to client
        response.writeHead(200,{"Content-Type":"text/plain"});
        response.write("User invited to event! ");
        response.end();
    });

}// END function inviteAUser
exports.inviteAUser = inviteAUser;


/**
+   \brief inviteManyUser
+
+       This function will invite a single user to an event
+
+   \author Salvatore D'Agostino
+   \date  2013-06-17 22:27
+   \param response (CONN)  The response to return to the client
+   \param eventId  (INT)   The ID of the event to add the user to
+   \param userId   (INT)   The ID of the user to be invited
+   \param client   (PSQL)  PSQL client object
+
+   \return return
**/
function inviteManyUser(response,eventId,users,client)
{
    console.log('Adding userids: ' + users + ' to event: ' + eventId);

    var userIds = JSON.parse(users);
    var query;

    for (var i = userIds.length - 1; i >= 0; i--) {
        query = client.query({
            name: 'invite many users to an event',
            text: 'INSERT INTO event_users(event_id, user_id, permission) VALUES($1,$2,2)',
            values: [eventId,userIds[i].id]
        });

        query.on('error',function(err){
            console.log('DB Error Caught: '+ err);
            // Send response to client
            response.writeHead(500,{"Content-Type":"text/plain"});
            response.write("Could not invite users to event, please try again check API logs for error");
            response.end();
        });
    };
    response.writeHead(200,{"Content-Type":"text/plain"});
    response.write("Users invited to event! ");
    response.end();

}// END function inviteManyUser
exports.inviteManyUser = inviteManyUser;