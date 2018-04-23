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
var util = require('util');
var debug = util.debuglog('server');

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

    debug('queryStringObject: ', queryStringObject);

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

        chosenHandler(data, function (statusCode, payload, contentType) {

            // api handlers may not return contentType, as they assume json. Default it to json.
            contentType = typeof(contentType) == 'string' ? contentType : 'json';

            // use the status code called back by the handler, or a default
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            // Return the response parts that are content-specific.
            var payloadString = ''; // For html response; replace this with {} if response is to be json
            if (contentType == 'json') {
                res.setHeader('Content-Type', 'application/json');
                payload = typeof (payload) == 'object' ? payload : {};
                payloadString = JSON.stringify(payload);
            }
            if(contentType=='html'){
                res.setHeader('Content-Type', 'text/html');
                payloadString = typeof(payload) == 'string' ? payload : '';
            }

            // Return the response types common to all content types
            res.writeHead(statusCode);
            res.end(payloadString);    
            

            // log what path was requested
            // if the response is 200 print green, otherwise red
            if(statusCode === 200) {
                debug('\x1b[32m%s\x1b[0m' /* green */, method.toUpperCase() + ' /' + trimmedPath + ' ' +statusCode );
            } else {
                debug('\x1b[31m%s\x1b[0m' /* red */, method.toUpperCase() + ' /' + trimmedPath + ' ' +statusCode );
            }
           
        });
    });
};

// Define a request router
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted' : handlers.sessionDeleted,
    'checks/all' : handlers.checksList,
    'checks/create' : handlers.checksCreate,
    'checks/edit':handlers.checksEdit,
    'ping': handlers.ping,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks
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