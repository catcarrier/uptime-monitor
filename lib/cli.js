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

// input handlers
e.on('man', function (str) {
    cli.responders.help();
});

e.on('help', function (str) {
    cli.responders.help();
});

e.on('exit', function (str) {
    cli.responders.exit();
});

e.on('stats', function (str) {
    cli.responders.stats();
});

e.on('list users', function (str) {
    cli.responders.listUsers();
});

e.on('more user info', function (str) {
    cli.responders.moreUserInfo(str);
});

e.on('list checks', function (str) {
    cli.responders.listChecks(str);
});

e.on('more check info', function (str) {
    cli.responders.moreCheckInfo(str);
});

e.on('list logs', function (str) {
    cli.responders.listLogs();
});

e.on('more log info', function (str) {
    cli.responders.moreLogInfo(str);
});




// responders
cli.responders = {};

// help / man
cli.responders.help = function () {
    var commands = {
        'exit': 'Kill the CLI and the application',
        'man': 'Show this help page',
        'help': 'alias man',
        'stats': 'Get statistics on the OS and resource utilization',
        'list users': 'Show a list of registered users',
        'more user info --{userId}': 'Show details of a specific user',
        'list checks [--up|--down]': 'Show list of all active checks, with their state. Optionally, show only up, or down checks.',
        'more check info --{checkId}': 'Show details of a specific check',
        'list logs': 'Show list of all log files, compressed and uncompressed',
        'more log info --{fileName}': 'Show details of a specific log file',
    };

    // show a header for the help page that is as wide as string screen
    cli.horizontalLine();
    cli.centered('CLI manual');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // show each command, followed by its explanation in white and yellow respectively
    for (var key in commands) {
        if (commands.hasOwnProperty(key)) {
            var value = commands[key];
            var line = '\x1b[33m' + key + '\x1b[0m';

            // pad each line to 60 chars
            var padding = 60 - line.length;
            for (var i = 0; i < padding; i++) {
                line += ' ';
            }
            line += value;
            console.log(line);
            cli.verticalSpace();
        };
    }

    cli.verticalSpace();

    // end with another horizontal line
    cli.horizontalLine();

}

// Output n vertical spaces
cli.verticalSpace = function(lines){
    lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
    for(var i = 0; i < lines; i++){
        console.log('');
    }
}

// Output a horizontal line
cli.horizontalLine = function(){
    // get teh available screen size
    var width = process.stdout.columns;
    var line = '';
    for(var i = 0;i<width;i++){ line += '-'; }
    console.log(line);
}

// Create centered text on the screen
cli.centered = function(str){
    str = typeof(str) =='string' ? str : false;
    if(str){
        var width = process.stdout.columns;
        var padLength = Math.floor( (width - str.length)/2);

        var pad = '';
        for(var i=0; i<padLength; i++){ pad += ' '; }

        console.log( pad + str + pad);
    }
}


// exit
cli.responders.exit = function () {
    process.exit(0);
}

cli.responders.stats = function () {
    console.log('You asked for stats');
}

cli.responders.listUsers = function () {
    console.log('You asked to list users');
}

cli.responders.moreUserInfo = function (str) {
    console.log('You asked for more user info', str);
}

cli.responders.listChecks = function (str) {
    console.log('You asked to list checks', str);
}

cli.responders.moreCheckInfo = function (str) {
    console.log('You asked for more check info', str);
}

cli.responders.listLogs = function () {
    console.log('You asked to list logs');
}

cli.responders.moreLogInfo = function (str) {
    console.log('You asked for more log info', str);
}








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
        uniqueInputs.some(function (input) {
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true;

                // emit an event matching the unique input
                // and include the full string given by the user
                e.emit(input, str);

                // break out of the loop
                return true;
            }
        });

        // if we reached the end of the loop and no match found, alert the user
        if (!matchFound) {
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

