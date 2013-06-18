/**
//
//  event.js
//  projectPS
//
//    This is the Event Model of the PhotoStream project
//
//  Created by Salvatore D'Agostino on 2012-10-14 21:33
//  Copyright 2012. All rights reserved.
//
**/

/**
+   \brief createEvent
+
+       This will create a event
+
+   \author Salvatore D'Agostino
+   \date  2012-10-14 21:41
+   \param response     (CONN)  The reponse to return to the client
+   \param eventObject  (JSON)  The event data to insert
+   \param client       (PSQL)  PSQL client object
+
+   \return True if pass, False otherwise
**/
function createEvent(response,eventObject,client)
{
  var event = JSON.parse(eventObject);

  console.log('Creating event: ' + eventObject);
  var query;

  query = client.query({
    name: 'insert event',
    text: "INSERT INTO events(name, creator,date_created) values($1, $2,current_timestamp) RETURNING id",
    values: [event.name, event.userId]
  });

  query.on('error',function(err) {
    console.log('DB Error Caught: '+ err);
  });

  query.on('row', function(row) {
    var eventId = row.id;

    // Create row in event_users
    query = client.query({
      name: 'update event',
      text: "INSERT INTO event_users (event_id,user_id) values ($1,$2)",
      values: [eventId, event.userId]
    });

    query.on('error',function(err) {
      console.log('DB Error Caught: '+ err);
    });
  });


  // Send response to client
  response.writeHead(200,{"Content-Type":"text/plain"});
  response.write("Created Event! ");
  response.end();
}// END function createEvent
exports.createEvent = createEvent;

/**
+   \brief readEvent
+
+       This function will return a event object to the client
+
+   \author Salvatore D'Agostino
+   \date  2012-10-14 21:44
+   \param response  The response to return to the client
+   \param eventId    The ID of the event to get
+   \param client    (PSQL) PSQL client object
+
+   \return Event object, False otherwise
**/
function readEvent(response,eventId,client)
{
  console.log('Reading event: ' + eventId);

  var query;

  query = client.query({
    name: 'read event',
    text: "SELECT * from events where id = $1",
    values: [eventId]
  });

  // return the event retrieved
  query.on('row', function(row) {
      var json = JSON.stringify(row);
      console.log(json);
      response.writeHead(200, {'content-type':'application/json', 'content-length':json.length});
      response.end(json);
  });

}// END function readEvent
exports.readEvent = readEvent;

/**
+   \brief getEvents
+
+       This function will get all events a user is part of
+
+   \author Salvatore D'Agostino
+   \date  2013-04-08 20:51
+   \param response   The response to return to the user
+   \param userId     The ID of the user
+   \param client     (PSQL) PSQL client object
+
+   \return Array of even objects
**/
function getEvents(response,userId,client)
{
    console.log('Get all events for user: ' + userId);

    var query;
    var data = [];

    query = client.query({
      name: 'getEvents',
      text: "SELECT * FROM events AS e JOIN event_users AS eu ON eu.event_id = e.id WHERE eu.user_id = $1",
      values: [userId]
    });

    query.on('error',function(err) {
      console.log('DB Error Caught: '+ err);
    });

     // return the user retrieved
    query.on('row', function(row) {
        data.push(row);
    });

    // return the event retrieved
    query.on('end', function() {
      // client.end();
      var json = JSON.stringify(data);
      console.log(json);
      response.writeHead(200, {'content-type':'application/json', 'content-length':json.length});
      response.end(json);
    });
}// END function getEvents
exports.getEvents = getEvents;

/**
+   \brief updateEvent
+
+       This function will update an event
+
+   \author Salvatore D'Agostino
+   \date  2012-10-14 21:46
+   \param response     The response to return to the client
+   \param eventId      The event id to update
+   \param eventInfo    The updated event information
+   \param client       (PSQL) PSQL client object
+
+   \return True if pass, False otherwise
**/
function updateEvent(response,eventId,event,client)
{
  console.log('updating event: ' + eventId);
  var eventData   = JSON.parse(event);
  var query;

  query = client.query({
    name: 'Update Event',
    text: "UPDATE events SET status = $1, name = $2, creator = $3, last_modified = current_timestamp WHERE id = $4",
    values: [eventData.status, eventData.name, eventData.creator,eventId]
  });

  query.on('error',function(err){
    console.log('DB Error Caught: ' + err);
    response.writeHead(500,{"Content-Type":"text/plain"});
    response.write("Error Updating Event!");
    response.end();
  });

  query.on('end', function(result){
    // Send response to client
    response.writeHead(200,{"Content-Type":"text/plain"});
    response.write("Event Updated!");
    response.end();
  });

}// END function updateEvent
exports.updateEvent = updateEvent;

/**
+   \brief deleteEvent
+
+       This function will delete a event object from the DB
+
+   \author Salvatore D'Agostino
+   \date  2012-10-14 21:48
+   \param reponse    The response to return to the client
+   \param eventId     The ID of the event to delete
+   \param client     (PSQL) PSQL client object
+
+   \return True if pass, False otherwise
**/
function deleteEvent(response,eventId,client)
{
  console.log('Deleting event: ' + eventId);

  var query;

  query = client.query({
    name: 'delete event',
    text: "UPDATE events SET status = '0' where id = $1",
    values: [eventId]
  });

  query.on('error',function(err) { console.log('DB Error Caught: '+ err); } );

  query.on('end', function(result) {
    // console.log(result.command);
  });

  response.writeHead(200, {'content-type':'text/plain'});
  response.write("Event deleted!");
  response.end();
}// END function deleteEvent
exports.deleteEvent = deleteEvent;