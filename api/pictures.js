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
    var fs    = require('fs');

    // create record in DB for picture and get back ID
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

    // TODO update event updated field (timestamp)

    var pictureId;
    // return the id of the picture inserted
    query.on('row', function(row) {
        pictureId = row;
        console.log('Inserted picture ID: '+pictureId.id);

        // Create event relation in picture_events join table
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

        console.log('Openning file');
        
        // use ID as filename to upload to S3
        fs.readFile(picture.path,function(err,data) {
            if(err)
            {
                console.log(err);

                // Send response to client
                response.writeHead(200,{"Content-Type":"text/plain"});
                response.write("Could not upload picture");
                response.end();
            }
            else
            {
                // TODO dynamically get file format
                var fileName = pictureId.id + ".png";
                console.log("FileName: " + fileName);
                awsS3.upload(s3,process.env.S3_BUCKET_NAME,eventId,fileName,data);
            }
        });

        console.log('File uploaded');


    });

    // Send response to client
    response.writeHead(200,{"Content-Type":"text/plain"});
    response.write("Picture Uploaded!");
    response.end();
    
}// END function createPicture
exports.createPicture = createPicture;

/**
+   \brief readPictures
+
+       This function will return all picture objects for a given event
+
+   \author Salvatore D'Agostino
+   \date  2012-12-15 16:07
+   \param response   The response to return to the client
+   \param eventId    The ID of the event
+   \param client     (PSQL) PSQL client object
+
+   \return JSON ARRAY of all picture objects, False otherwise
**/
function readPictures(response,eventId,client)
{
    console.log('Getting all pictures for event: '+ eventId);

    var query;
    var data = [];
    var sql =  "SELECT p.*,e.id AS event_id ";
        sql += "FROM pictures p ";
        sql += "JOIN picture_events pe ON p.id = pe.picture_id ";
        sql += "JOIN events e ON e.id = pe.event_id ";
        sql += "WHERE e.id = $1";

    console.log("QUERY: "+sql);

    query = client.query({
        name: 'read pictures',
        text: sql,
        values: [eventId]
    });

     // return the pictures retrieved
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

    query.on('error',function(err) { console.log('Unable to read pictures: '+ err); } );
}// END function readPictures
exports.readPictures = readPictures;

/**
+   \brief readPicture
+
+       This function sends back a single picture
+
+   \author Salvatore D'Agostino
+   \date  2012-12-22 00:14
+   \param response   (HTTP)    The response to return to the client
+   \param eventId    (INT)     The ID of the event
+   \param pictureId  (INT)     The ID of the picture
+   \param client     (PSQL)    PSQL client object
+   \param s3         (CONN)    The contents of the file
+
+   \return JSON ARRAY containing image data
**/
function readPicture(response,eventId,pictureId,client,s3)
{
    console.log('Getting picture: '+ pictureId);

    var awsS3 = require('./amazonS3');
    var query;
    var data = [];
    var sql =  "SELECT CONCAT(p.id,'.png') AS id, p.name,p.date_created ";
        sql += "FROM pictures p ";
        sql += "WHERE p.id = $1";

    console.log("QUERY: "+sql);

    query = client.query({
        name: 'read pictures',
        text: sql,
        values: [pictureId]
    });

    // return the pictures retrieved
    query.on('row', function(row) {
        data.push(row);
    });

    query.on('end', function() {
        // get image data from S3
        awsS3.download(s3,process.env.S3_BUCKET_NAME,eventId,data[0],response);
    });

    query.on('error',function(err) { console.log('Unable to read pictures: '+ err); } );
    
}// END function readPicture
exports.readPicture = readPicture;