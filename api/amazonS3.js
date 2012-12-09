/**
//
//  fileName
//  projectPS
//
//    This is the Amazon AWS S3 file storage
//
//  Created by Salvatore D'Agostino on 2012-12-09 14:51
//  Copyright 2012. All rights reserved.
//
**/


/**
+   \brief upload
+
+       This function will upload a file to the S3 storage
+
+   \author Salvatore D'Agostino
+   \date  2012-12-09 14:57
+   \param s3       instance of aws connection
+   \param bucket   the name of the bucket
+   \param fileName the name of the file
+   \param fileData the file contents
+
+   \return True if success, False otherwise
**/
function upload(s3,bucket,fileName,fileData)
{
    var data = {Bucket: bucket, Key: fileName, Body: fileData};
    
    s3.client.putObject(data).done(function(resp) {
        console.log("Successfully uploaded data to myBucket/myKey");
    });
    
}// END function upload
exports.upload = upload;