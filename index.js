/*
 * Primary file for uptime API
 * 
 *
 */

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');

// Server response to all requests with a string
var server = http.createServer(function (req, res) {

    // parse the url - returns object
    var parsedUrl = url.parse(req.url, true);

    // console.log(parsedUrl.pathname);

    // get the path
    var trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

    // console.log(trimmedPath);

    // get the query string as an object
    var queryStringObject = parsedUrl.query;

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
        var chosenHandler = router[trimmedPath] ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };
        chosenHandler(data, function (statusCode, payload) {
            // use the status code called back by the handler, or a default
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            // use the payload called back by the handler, or an empty object
            // we only accept an object here
            payload = typeof (payload) == 'object' ? payload : {};

            // Convert payload to string
            var payloadString = JSON.stringify(payload);

            // console.log(payloadString);

            // Return the response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // log what path was requested
            console.log('Returning this response:', statusCode, payloadString);
        });
    });
});


// Start the server and listen
server.listen(config.port, function () {
    console.log('Server is listening on port ' + config.port + ' in ' + config.envName);
});

// Defined handlers
var handlers = {};

handlers.sample = function (data, cb) {

    // callback a http status code and a payload object
    cb(406, { 'name': 'sample handler' });
};

handlers.notFound = function (data, cb) {
    cb(404);
};


// Define a request router
var router = {
    'sample': handlers.sample
};