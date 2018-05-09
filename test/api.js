/**
 * API tests
 * 
 */

 // dep
 var app = require('./../index');
 var assert = require('assert');
 var http = require('http');
 var config = require('./../lib/config');

 // holder for tests
 var api = {};

 // helper to create http requests and get a response back
 var helpers = {};
 helpers.makeGetRequest = function(path, cb){
    // configure the request details
    var requestDetails = {
        'protocol' : 'http:', /* colon required */
        'hostname' : 'localhost',
        'port' : config.httpPort,
        'method' : 'GET',
        'path' : path,
        'headers' : {
            'Content-Type' : 'application/json'
        }
    };

    // Send the request, hand off the response to the callback
    var req = http.request(requestDetails, function(res){
        cb(res);
    });
    req.end();

 }

 // The main init() should run without throwing
 api['app init should start without throwing'] = function(done){
    assert.doesNotThrow(function(){

        // app.init must take a callback for this test to run
        app.init(function(err){
            done();
        });
    }, TypeError);
 }

 // Make a request to ping
 api['/ping should respond to GET with 200'] = function(done){
    helpers.makeGetRequest('/ping', function(res){
        assert.equal(res.statusCode, 200);
        done();
    });
 }

  // Make a request to /api/users - should return 400 because we are not including authentication
  api['/api/users should respond to GET with 400'] = function(done){
    helpers.makeGetRequest('/api/users', function(res){
        assert.equal(res.statusCode, 400);
        done();
    });
 }

  // A random path should respond to GET with 404
  api['Random path should respond to GET with 404'] = function(done){
    helpers.makeGetRequest('this/path/does/not/exist', function(res){
        assert.equal(res.statusCode, 404);
        done();
    });
 }


 module.exports = api;