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
+   \author Robbie Caputo
+   \date  2013-07-25 21:10
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
  var awsS3         = require('./amazonS3');
  var fs            = require('fs');
  var crypto        = require('crypto');
  var hash          = {};
  var timestampMS   = Date.now();
  var hashDigest    = "";
  var fileExtension = "";
  var mime          = "";
  var url;

  if (picture !== undefined) {
    // create record in DB for picture and get back ID
    mime          = picture.type;
    var temp      = mime.split('/');
    fileExtension = temp[1];
    console.log('Inserting image into DB');

    //create hash object using sha1
    hash = crypto.createHash('sha1');
    //update the hash using a unique string
    hash.update(creator + picture.name + timestampMS);
    hashDigest = hash.digest('hex');

    query = client.query({
      name: 'insert picture',
      text: "INSERT INTO pictures "+
            "(id,name,owner,url,hash,date_created,mime,extension) " +
        "VALUES (uuid_generate_v4(),$1,$2,$3,$4,current_timestamp,$5,$6) " +
        "RETURNING id",
      values: [picture.name, creator, url, hashDigest,mime,fileExtension]
    });

    query.on('row', function(row, result) {
      result.addRow(row);
    });

    query.on('error',function(err) {
      console.log('DB Error Caught: '+ err);
      // Send response to client
      console.dir(err);
    });

    query.on('end',function(result) {
      if (result === false) {
        restResponse.returnRESTResponse(
            response,
            true,
            "Error uploading picture",
            null);
      } else if (result.rowCount === 0 || result.rowCount === null) {
        restResponse.returnRESTResponse(
            response,
            true,
            "Error uploading picture",
            null);
      } else {

        var insertedPicture;
        var bucket      = process.env.S3_BUCKET_NAME;
        insertedPicture = result.rows[0];
        console.log('Inserted picture ID: '+insertedPicture.id);

        //get uploaded picture's extension
        fileExtenstion = path.extname(picture.name);

        url = 'https://s3.amazonaws.com/'+
            bucket+
            '/'+
            eventId+
            '/'+
            hashDigest+
            fileExtenstion;

        // TODO update event updated field (timestamp)

        // TODO: Make sure event exists
        dbHelper.doesIdExist('events',eventId,client,function(exists){
          console.dir(exists);

          if (exists === true) {
            // Create event relation in picture_events join table
            console.log('Creating relation between picture and event');
            query = client.query({
              name: 'insert picture_events',
              text: "INSERT INTO picture_events (picture_id,event_id) values ($1,$2)",
              values: [insertedPicture.id, eventId]
            });

            query.on('error',function(err) {
              console.log('DB Error Caught: '+ err);
              // Send response to client
              restResponse.returnRESTResponse(
                response,
                true,
                "Could not upload picture",
                null);
            });

            query = client.query({
              name: 'add image URL',
              text: "UPDATE pictures SET url = $1 WHERE id = $2",
              values: [url,insertedPicture.id]
            });

            query.on('error',function(err) {
              console.log('DB Error Caught: '+ err);
              // Send response to client
              restResponse.returnRESTResponse(
                response,
                true,
                "Could not set picture URL",
                null);
            });


            console.log('Openning file');

            // use ID as filename to upload to S3
            fs.readFile(picture.path,function(err,data) {
              if(err)
              {
                console.log(err);
                // Send response to client
                restResponse.returnRESTResponse(
                  response,
                  true,
                  "Could not upload picture",
                  null);
              }
              else
              {
                var fileName = hashDigest+fileExtenstion;
                var key      = eventId+'/'+fileName;
                var body     = data;
                var params   = {
                  "ACL"         : "public-read",
                  "Body"        : body,
                  "Bucket"      : bucket,
                  "Key"         : key,
                  "ContentType" : picture.type
                };

                console.log("Object to be put:");
                console.dir(params);
                s3.putObject(params,function(err,data){
                  if (err){
                    console.log('Error uploading image:' + err);
                    // TODO: Rollback DB!
                    restResponse.returnRESTResponse(
                      response,
                      true,
                      "Error uploading Image",
                      null);
                  } else {
                    console.log("response from AWS:");
                    console.dir(data);
                    // Send response to client
                    restResponse.returnRESTResponse(
                      response,
                      false,
                      "Picture Uploaded",
                      null);
                  }
                });
              }
            });
          } else {
            restResponse.returnRESTResponse(
              response,
              true,
              "Event not found",
              null);
          }
        });
      }
    });
  } else {
    restResponse.returnRESTResponse(
      response,
      true,
      "No picture found",
      null);
  }

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
function readPictures(response,eventId,client,start,limit)
{
  if(typeof(start)==='undefined') start = 0;
  if(typeof(limit)==='undefined') limit = 25;
  console.log('Getting all pictures for event: '+ eventId);

  var query;
  var data = [];
  var sql =  "SELECT p.*,e.id AS event_id ";
    sql += "FROM pictures p ";
    sql += "JOIN picture_events pe ON p.id = pe.picture_id ";
    sql += "JOIN events e ON e.id = pe.event_id ";
    sql += "WHERE e.id = $1";
    sql += "LIMIT $2 OFFSET $3";

  console.log("QUERY: "+sql);

  query = client.query({
    name: 'read pictures',
    text: sql,
    values: [eventId,limit,start]
  });

   // return the pictures retrieved
  query.on('row', function(row) {
    data.push(row);
  });

  query.on('end', function() {
    // client.end();
    restResponse.returnRESTResponse(
      response,
      false,
      "",
      data);
  });

  query.on('error',function(err) {
    console.log('Unable to read pictures: '+ err);
  } );
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
  var sql =  "SELECT CONCAT(p.hash,'.',p.extension) AS id, p.name,p.date_created ";
    sql += "FROM pictures p ";
    sql += "WHERE p.id = $1";


  query = client.query({
    name: 'read picture',
    text: sql,
    values: [pictureId]
  });

  // return the pictures retrieved
  query.on('row', function(row,result) {
    result.addRow(row);
  });

  query.on('error',function(err) {
    console.log('Unable to read pictures: '+ err);
  } );

  query.on('end', function(result) {
    if (result === false) {
      restResponse.returnRESTResponse(
        response,
        true,
        "Could not find picture",
        null);
    } else if (result.rowCount === 0 || result.rowCount === null) {
      restResponse.returnRESTResponse(
        response,
        true,
        "Could not find picture",
        null);
    } else {
      fileName = result.rows[0];
      // get image data from S3
      awsS3.download(s3,process.env.S3_BUCKET_NAME,eventId,fileName,response);
    }
  });

}// END function readPicture
exports.readPicture = readPicture;

/**
+   \brief updatePicture
+
+       This function will update a picture record
+
+   \author Salvatore D'Agostino
+   \date  2013-06-29 14:39
+   \param response   (HTTP) The response to return to the client
+   \param pictureId  (INT)  The ID of the picture to udpate
+   \param client     (PSQL) PSQL client object
+   \param data       (JSON) The new picture data to update
+
+   \return Success message if passed, Error otherwise
**/
function updatePicture(response,pictureId,client,data)
{
  console.log('updating picture: ' + pictureId);
  console.dir(data);
  var pictureData = JSON.parse(data);
  var query;

  query = client.query({
    name: 'Update Picture',
    text: "UPDATE pictures SET name = $1, owner = $2, "+
      "date_updated = current_timestamp WHERE id = $3",
    values: [pictureData.name, pictureData.owner,pictureId]
  });

  query.on('error',function(err){
    console.log('DB Error Caught: ' + err);
    restResponse.returnRESTResponse(
      response,
      true,
      "Error updating picture",
      null);
  });

  query.on('end', function(result){
    // Send response to client
    restResponse.returnRESTResponse(
    response,
      false,
      "Picture updated",
      null);
  });

}// END function updatePicture
exports.updatePicture = updatePicture;

/**
+   \brief deletePicture
+
+       This function will delete a picture
+
+   \author Salvatore D'Agostino
+   \date  2013-06-29 16:16
+   \param response   (HTTP) The response to return to the client
+   \param pictureId  (INT)  The ID of the picture to udpate
+   \param client     (PSQL) PSQL client object
+   \param s3         (CONN)    The contents of the file
+
+   \return return
**/
function deletePicture(response,eventId,pictureId,client,s3)
{
  console.log('Deleting picture: ' + pictureId);

  var query;

  // Delete picture from S3 (async)
  var s3Object    = new Object();
  s3Object.Bucket = process.env.S3_BUCKET_NAME;
  s3Object.Key    = eventId+'/'+pictureId+'.png';
  console.dir(s3Object);
  s3.deleteObject(s3Object,function(err,data){
    if (err !== null) {
      console.log("Error from S3: " + err);
    }
  });

  // Delete picture from event
  query = client.query({
    name: 'delete picture_events',
    text: "DELETE FROM picture_events WHERE picture_id = $1",
    values: [pictureId]
  });

  query.on('error',function(err) {
    restResponse.returnRESTResponse(
      response,
      true,
      "Could not delete picture from event",
      null);
  });

  query.on('end', function(result) {
    // Delete picture from pictures
    query = client.query({
      name: 'delete picture',
      text: "DELETE FROM pictures WHERE id = $1",
      values: [pictureId]
    });

    query.on('error',function(err) {
      restResponse.returnRESTResponse(
        response,
        true,
        "Could not delete picture",
        null);
    });

    query.on('end', function(result) {
      restResponse.returnRESTResponse(
        response,
        false,
        "Picture deleted",
        null);
    });
  });


}// END function deletePicture
exports.deletePicture = deletePicture;