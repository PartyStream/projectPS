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
    text: "INSERT INTO events(name, creator,date_created) values($1, $2,current_timestamp)",
    values: [event.name, event.userId]
  });
  
  query.on('end', function() {  });

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
+   \brief updateEvent
+
+       This function will update an event by adding users to it
+
+   \author Salvatore D'Agostino
+   \date  2012-10-14 21:46
+   \param response     The response to return to the client
+   \param eventObject  The event data to update
+   \param client       (PSQL) PSQL client object
+
+   \return True if pass, False otherwise
**/
function updateEvent(response,eventObject,client)
{
  console.log('updating event: ' + eventObject);
  var eventUsers   = JSON.parse(eventObject);
  var query;

  for (var i = eventUsers.length - 1; i >= 0; i--)
  {
    console.dir(eventUsers[i]);
    query = client.query({
      name: 'update event',
      text: "INSERT INTO event_users (event_id,user_id) values ($1,$2)",
      values: [eventUsers[i].event_id, eventUsers[i].user_id]
    });
    
  }

  query.on('error',function(err) { console.log('DB Error Caught: '+ err); } );
  
  query.on('end', function(result) {
    // console.log(result.command);
  });

  // Send response to client
  response.writeHead(200,{"Content-Type":"text/plain"});
  response.write("Event Updated!");
  response.end();
    
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