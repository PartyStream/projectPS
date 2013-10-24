/**
+   \brief returnRESTResponse
+
+       This function will return a structured response
+
+   \author Salvatore D'Agostino
+   \date  2013-09-11
+   \param response   (OBJ)    The response handle
+   \param error      (BOOL)   Did an error occur?
+   \param message    (STRING) User friendly message
+   \param data       (MIXED)  Data to return to client
+
+   \return return
**/
function returnRESTResponse(response,error,message,data)
{
    var array = {
        "error"   : error,
        "message" : message,
        "data"    : data
    };

    var json = JSON.stringify(array);

    if (error) {
        // TODO: These codes should intelligently returned
        response.writeHead(500, {
          'content-type':'application/json',
          'content-length':json.length
        });
        response.end(json);
    } else {
        response.writeHead(200, {
          'content-type':'application/json',
          'content-length':json.length
        });
        response.end(json);
    }

}// END function returnRESTResponse
exports.returnRESTResponse = returnRESTResponse;