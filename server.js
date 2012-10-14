var http = require("http");
var url  = require("url") ;
var port = process.env.PORT || 5000;


function start(route,handle)
{
    function onRequest(request,response)
    {
        var pathname = url.parse(request.url).pathname;
        console.log("Request for " + pathname + " received.");

        route(handle,pathname);

        response.writeHead(200,{"Content-Type":"text/plain"});
        response.write("Hello World");
        response.end();
    }

    http.createServer(onRequest).listen(port,function(){
        console.log("Server is listening on port: " + port );
    });
}

exports.start = start;
