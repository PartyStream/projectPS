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
+   \param eventName  (STRING)  The name of the event for this file
+   \param creator    (STRING)  The ID of the creator
+   \param fileName   (STRING)  The name of the file
+   \param data       (BIN)     The contents of the file
+   \param s3         (CONN)    The contents of the file
+   \param client     (PSQL)    The PSQL client objects
+
+   \return True if pass, False otherwise
**/
function createPicture(response,eventName,creator,fileName,data,s3)
{
    var awsS3 = require('./amazonS3');

    // code
    
}// END function createPicture
exports.createPicture = createPicture;