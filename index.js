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

app.init = function (cb) {
    // start the server
    server.init();

    // start the workers
    workers.init();

    // start the cli
    setTimeout(function () {
        cli.init();
        cb(); /* cb enables api testing of this module e.g. 'app.init does not throw' */
    }, 50)
};

// Execute init only if the file is being invoked directly.
// This allows test runners to include the file and then
// invoke init() on their own schedule.
if (require.main === module) {
    app.init(function () { } /* testing-only cb */);
}

module.exports = app;