/*
 * Primary file for uptime API
 * 
 *
 */

 // dependencies
 var server = require('./lib/server');
 var workers = require('./lib/workers');

 // Declare the app
 var app = {};

 app.init = function(){
    // start the server
    server.init();

    // start the workers
    workers.init();
 };

 app.init();

 module.exports = app;