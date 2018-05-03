/*
 * Primary file for uptime API
 * 
 *
 */

 // dependencies
 var server = require('./lib/server');
 var workers = require('./lib/workers');
 var cli = require('./lib/cli');

 // Declare the app
 var app = {};

 app.init = function(){
    // start the server
    server.init();

    // start the workers
    workers.init();

    // start the cli
    setTimeout(function(){
        cli.init();
    }, 50)
 };

 app.init();

 module.exports = app;