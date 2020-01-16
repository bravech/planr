var http = require("http");
var express = require("express");
var app = express();

http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});

    response.end("Hello World\n");
}
).listen(8081)