/**
 * CLI-related tasks
 * 
 */

// dependencies
var readline = require('readline');
var util = require('util');
var debug = util.debuglog('cli');
var events = require('events');
class _events extends events { }; // extend the event class, best practice
var e = new _events(); // instantiate the subclass

// create the cli module
var cli = {};

cli.processInput = function (str) {
    str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : false;

    // only process the input if the user typed something
    if (str) {
        // codify the unique strings that identify questions the user can ask
        var uniqueInputs = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more log info'
        ];

        // go through the possible inputs, emit an event when a match is found
        var matchFound = false;
        var counter = 0;
        uniqueInputs.some(function(input){
            if(str.toLowerCase().indexOf(input) > -1){
                matchFound = true;

                // emit an event matching the unique input
                // and include the full string given by the user
                e.emit(input, str);

                // break out of the loop
                return true;
            }
        });

        // if we reached the end of the loop and no match found, alert the user
        if(!matchFound){
            console.log('Sorry, not recognized, try again');
        }


    }

}

cli.init = function () {
    // send the start message to the console in dark blue
    console.log('\x1b[34m%s\x1b[0m', 'cli is running');

    // Start the interface
    var _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '>' /* defines the prompt but does not create it */
    });

    // Create an initial prompt
    _interface.prompt();

    // handle each line of input separately
    _interface.on('line', function (str) {
        // send to input processor
        cli.processInput(str);

        // reinit the prompt, so the user sees the prompt again after typing input
        _interface.prompt();
    });

    // If the user stops the cli, kill the associated process
    _interface.on('close', function () {
        process.exit(0);
    })

}

module.exports = cli;

