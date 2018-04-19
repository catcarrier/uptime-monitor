// Server related tasks


// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');

// Instantiate the server module object
var server = {};

// @TODO Test the sendToTwilio call - get rid of this
// helpers.sendTwilioSms('3024639958', 'hello', function(err){
//     console.log(err);
// });


// Instantiate the (http) server
server.httpServer = http.createServer(function (req, res) {
    server.unifiedServer(req, res);
});

// Instantiate the (https) server
server.httpsServerOptions = {
    'key': fs.readFileSync( path.join(__dirname, '/../https/key.pem') ),
    'cert': fs.readFileSync( path.join(__dirname, '/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, function (req, res) {
    server.unifiedServer(req, res);
});

// All the server logic for http and https
server.unifiedServer = function (req, res) {
    // parse the url - returns object
    var parsedUrl = url.parse(req.url, true);

    // get the path
    var trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

    // get the query string as an object
    var queryStringObject = parsedUrl.query;

    // console.log('queryStringObject: ', queryStringObject);

    // get the http method
    var method = req.method.toLowerCase();

    // get the headers as an object
    var headers = req.headers;

    // get the payload if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
        buffer += decoder.end();

        // choose the handler for this request
        var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        chosenHandler(data, function (statusCode, payload) {
            // use the status code called back by the handler, or a default
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            // use the payload called back by the handler, or an empty object
            // we only accept an object here
            payload = typeof (payload) == 'object' ? payload : {};

            // Convert payload to string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // log what path was requested
            //console.log('Returning this response:', statusCode, payloadString);
        });
    });
};

// Define a request router
server.router = {
    'tokens': handlers.tokens,
    'ping': handlers.ping,
    'users': handlers.users,
    'checks': handlers.checks
};

server.init = function () {
    // start the http server
    server.httpServer.listen(config.httpPort, function () {
        console.log('\x1b[36m%s\x1b[0m', 'http server is listening on port ' + config.httpPort);
    });

    // start the https server
    server.httpsServer.listen(config.httpsPort, function () {
        console.log('\x1b[35m%s\x1b[0m', 'https server is listening on port ' + config.httpsPort);
    });

}


module.exports = server;