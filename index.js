/*
 * Primary file for uptime API
 * 
 *
 */

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// Server response to all requests with a string
var server = http.createServer(function (req, res) {

    // parse the url
    var parsedUrl = url.parse(req.url, true);

    // get the path
    var trimmedPath = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

    //console.log(trimmedPath);

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
            statusCode = typeof (statusCode) == 'number' ? statuscode : 200;

            // use the payload called back by the handler, or an empty object
            // we only accept an object here
            payload = typeof (payload) == 'object' ? payload : {};

            // Convert payload to string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.writeHead(statusCode);
            res.end(payloadString);

            // log what path was requested
            console.log('Returning this response:', statusCode, payloadString);
        });
    });
});


// Start the server and listen on port 3000
server.listen(3000, function () {
    console.log('Server is listening on port 3000 now.');
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