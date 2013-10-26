/**
//
//  constants.js
//  projectPS
//
//    This is a file to define constants for use withing the API
//
//  Created by Robbie Caputo on 2013-08-08 23:36
//  Copyright 2013. All rights reserved.
//
**/

/** \brief define
*
*        This function defines constants to use throughtout the API.
*        Using Object.defineProperty these can never be overwritten and are added to the exports class.
*
*    \author Robbie Caputo
*    \date  2013-08-08 23:32
*    \param constants an object containing the constants name and value
*
**/
function define(constants) {
    for (var key in constants) {
       if (constants.hasOwnProperty(key))
       {
            Object.defineProperty(exports, key, {
                value:      constants[key],
                enumerable: true
            });
       }
    }
}// END function define


//  =====================
//  = HTTP STATUS CODES =
//  =====================

define({
        "HTTP_OK":                   200,
        "HTTP_CREATED":              201,
        "HTTP_BAD_REQUEST":          400,
        "HTTP_UNAUTHORIZED":         401,
        "HTTP_FORBIDDEN":            403,
        "HTTP_NOT_FOUND":            404,
        "HTTP_CONFLICT":             409,
        "HTTP_GONE":                 410,
        "HTTP_INTERNAL_SEVER_ERROR": 500
      });


