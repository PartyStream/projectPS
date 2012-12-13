/**
//
//  pictures.js
//  projectPS
//
//    This is the Picture Model of the PartyStream project
//
//  Created by Salvatore D'Agostino on 2012-12-09 15:36
//  Copyright 2012. All rights reserved.
//
**/

/**
+   \brief createPicture
+
+       This function will create a picture object
+
+   \author Salvatore D'Agostino
+   \date  2012-12-09 15:41
+   \param response   (HTTP)    The response to return to the client
+   \param eventId    (STRING)  The name of the event for this file
+   \param creator    (STRING)  The ID of the creator
+   \param picture    (FILE)    The file that was uploaded
+   \param data       (BIN)     The contents of the file
+   \param s3         (CONN)    The contents of the file
+   \param client     (PSQL)    The PSQL client objects
+
+   \return True if pass, False otherwise
**/
function createPicture(response,eventId,creator,picture,s3,client)
{
    var awsS3 = require('./amazonS3');

    // TODO create record in DB for picture and get back ID
    console.log('Inserting image into DB');

    query = client.query({
      name: 'insert picture',
      text: "INSERT INTO pictures (name,owner,date_created) values ($1,$2,current_timestamp) RETURNING id",
      values: [picture.name, creator]
    });

    query.on('error',function(err) {
        console.log('DB Error Caught: '+ err);
        // Send response to client
        response.writeHead(200,{"Content-Type":"text/plain"});
        response.write("Could not upload picture");
        response.end();
    });

    var pictureId;
    // return the id of the picture inserted
    query.on('row', function(row) {
        pictureId = row;
        console.log('Inserted picture ID: '+pictureId.id);

        // TODO Create event relation in picture_events join table
        console.log('Creating relation between picture and event');
        query = client.query({
          name: 'insert picture_events',
          text: "INSERT INTO picture_events (picture_id,event_id) values ($1,$2)",
          values: [pictureId.id, eventId]
        });

        query.on('error',function(err) {
            console.log('DB Error Caught: '+ err);
            // Send response to client
            response.writeHead(200,{"Content-Type":"text/plain"});
            response.write("Could not upload picture");
            response.end();
        });

        query.on('row', function(row) { });
    });

    

    // TODO use ID as filename to upload to S3

    // code

    // Send response to client
    response.writeHead(200,{"Content-Type":"text/plain"});
    response.write("Picture Uploaded!");
    response.end();
    
}// END function createPicture
exports.createPicture = createPicture;