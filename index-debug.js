/*
 * Primary file for uptime API
 * 
 *
 */

 // dependencies
 var server = require('./lib/server');
 var workers = require('./lib/workers');
 var cli = require('./lib/cli');
 var exampledebuggingproblem = require('./lib/exampledebuggingproblem');

 // Declare the app
 var app = {};

 app.init = function(){

    // breakpoint
    debugger;

    // start the server
    server.init();
    debugger;

    // start the workers
    debugger;
    workers.init();
    debugger;

    // start the cli
    debugger;
    setTimeout(function(){
        cli.init();
    }, 50)
    debugger;

    debugger;
    var foo = 1;
    console.log('Assigned 1 to foo');
    debugger;

    debugger;
    foo++;
    console.log('incremented foo');
    debugger;

    debugger;
    foo = foo * foo;
    console.log('squared foo');
    debugger;

    debugger;
    foo = foo.toString();
    console.log('cast foo to string');
    debugger;

    // call the init script that throws an error
    exampledebuggingproblem.init();
    console.log('just called the library');
    debugger;
 };

 app.init();

 module.exports = app;