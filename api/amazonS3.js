/**
//
//  fileName
//  projectPS
//
//    This is the Amazon AWS S3 file storage module
//
//  Created by Salvatore D'Agostino on 2012-12-09 14:51
//  Copyright 2012. All rights reserved.
//
**/

/**
+   \brief createBucket
+
+       This function will create a bucket in amazon S3
+
+   \author Salvatore D'Agostino
+   \date  2012-12-09 15:58
+   \param s3         (CONN)    The contents of the file
+   \param bucketName (STRING)  The name of the bucket
+   \param callBack   (FUNC)    callback function
+
+   \return True if pass, False otherwise
**/
function createBucket(s3,bucketName,callBack)
{
    s3.client.createBucket({Bucket: bucketName}).done(function(resp) {
      console.log("S3 SUCCESS: Bucket "+bucketName+" CREATED!");
      callBack(true);
    }).fail(function(resp) {
      console.log(resp.error);
      callBack(false);
    });

}// END function createBucket
exports.createBucket = createBucket;

/**
+   \brief createFolder
+
+       This function will create a folder in a given bucket
+
+   \author Salvatore D'Agostino
+   \date  2012-12-09 16:44
+   \param s3           (CONN)    The contents of the file
+   \param bucketName   (STRING)  The name of the bucket
+   \param folderName   (STRING)  The name of the folder
+   \param callBack     (FUNC)    callback function
+
+   \return True if pass, False otherwise
**/
// function createFolder(s3,bucketName,folderName,callBack)
// {
//     var data = {Bucket: bucketName, Key: "projectPS/test"};

//     s3.client.putObject(data).done(function(resp) {
//         console.log("Successfully uploaded data to myBucket/myKey");
//         callBack(true);
//     });

// }// END function createFolder
// exports.createFolder = createFolder;

/**
+   \brief upload
+
+       This function will upload a file to the S3 storage
+
+   \author Salvatore D'Agostino
+   \date  2012-12-09 14:57
+   \param s3       instance of aws connection
+   \param bucket   the name of the bucket
+   \param eventId  the id of the event
+   \param fileName the name of the file
+   \param fileData the file contents
+
+   \return True if success, False otherwise
**/
function upload(s3,bucket,eventId,fileName,fileData)
{
  console.log('Uploading file: '+fileName);
  var path = eventId + "/" + fileName;
  var imageData = {Bucket: bucket, Key: path, Body: fileData};

  s3.client.putObject(imageData,function(err,data) {
    console.dir(imageData);
    if (err == null){
      console.log("Successfully uploaded data to: " + path);
    } else {
      console.log("Error uploading file to S3: " + err);
    }
  });

}// END function upload
exports.upload = upload;

/**
+   \brief download
+
+       This function will download a file from a bucket and send all the data
+       back to the client
+
+   \author Salvatore D'Agostino
+   \date  2012-12-22 00:43
+   \param s3       instance of aws connection
+   \param bucket   the name of the bucket
+   \param eventId  the id of the event
+   \param fileData all the file data
+
+   \return return
**/
function download(s3,bucket,eventId,fileData,response)
{
  console.log('Downloading file: '+fileData.id);
  var path = eventId + "/" + fileData.id;
  var file = {Bucket: bucket, Key: path};

  console.dir(file);

  s3.client.getObject(file,function(err, data) {

    if (err)
    {
      console.log(err);
      restResponse.returnRESTResponse(
        response,
        true,
        "Could not download picture from AWS",
        null);
    }
    else
    {
      fileData.file = data;

      var json = JSON.stringify(fileData);
      console.log(fileData);
      restResponse.returnRESTResponse(
        response,
        false,
        "",
        json);
    }
  });

}// END function download
exports.download = download;

