/*
 * Primary file for uptime API
 * 
 *
 */

// dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var cli = require('./lib/cli');
var cluster = require('cluster');
var os = require('os');

// Declare the app
var app = {};

app.init = function (cb) {

    if (cluster.isMaster) {
        workers.init();

        // start the cli
        setTimeout(function () {
            cli.init();
            cb(); /* cb enables api testing of this module e.g. 'app.init does not throw' */
        }, 50)

        // Start one instance of the server for each cpu in the os. 
        // Each iteration will start this same file again in a new, non-master thread.
        // In each case, the if-condition 'cluster.isMaster' (above) will return false,
        // and so that thread will run server.init, below.
        // The net effect is that the workers and the cli run only on the master thread,
        // but the http server runs on every cpu, for better responsiveness.
        // Node will handle sharing the ports among all these threads.
        for (var i = 0; i < os.cpus().length; i++) {
            cluster.fork(); // this starts up the app again, in a new, non-master thread
        }

    } else {
        server.init();
    }
};

// Execute init only if the file is being invoked directly.
// This allows test runners to include the file and then
// invoke init() on their own schedule.
if (require.main === module) {
    app.init(function () { } /* testing-only cb */);
}

module.exports = app;