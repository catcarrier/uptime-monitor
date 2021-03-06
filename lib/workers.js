/**
 * Worker-related tasks
 */

// dependencies
var path = require('path');
var fs = require('fs');
var _data = require('./data');
var http = require('http');
var https = require('https');
var helpers = require('./helpers');
var url = require('url');
var _logs = require('./logs');
var util = require('util');
var debug = util.debuglog('workers');

var workers = {};

// look up all the checks, get their data, send to a validator
workers.gatherAllChecks = function () {
    // Get all the checks in the system
    _data.list('checks', function (err, checks) {
        if (!err && checks && checks.length > 0) {

            checks.forEach(function (check /* filename w/o trailing .json */) {
                // Read in the check
                _data.read('checks', check, function (err, originalCheckData) {
                    if (!err && originalCheckData) {
                        // pass the data to the check validator. It
                        // will continue or log an error.
                        workers.validateCheckData(originalCheckData);
                    } else {
                        debug('Error reading data for check ' + check);
                    }
                });
            });


        } else {
            // TODO log this
            // this is a background worker, so there is no one to send a response to
            debug('Could not find any checks to process');
        }
    });
};

// Sanity check the check-data
workers.validateCheckData = function (originalCheckData) {
    originalCheckData = typeof (originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {};
    originalCheckData.id = typeof (originalCheckData.id) == 'string' && originalCheckData.id.length == 20 ? originalCheckData.id : false;
    originalCheckData.userPhone = typeof (originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.length == 10 ? originalCheckData.userPhone : false;
    originalCheckData.protocol = typeof (originalCheckData.protocol) == 'string' && ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
    originalCheckData.url = typeof (originalCheckData.url) == 'string' && originalCheckData.url.length > 0 ? originalCheckData.url : false;
    originalCheckData.method = typeof (originalCheckData.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
    originalCheckData.successCodes = typeof (originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
    originalCheckData.timeoutSeconds = typeof (originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;

    // Set the keys that may not be set if the workers have never seen this check before
    // There are two such keys: state, and lastChecked

    // state
    // Set this to 'down' if never checked before
    originalCheckData.state = typeof (originalCheckData.state) == 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';

    // lastChecked
    // This is a number, but it defaults to false, so we can distinguish between checks that are 'down' because
    // they have never been checked, and those that were checked and were actually down
    originalCheckData.lastChecked = typeof (originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

    //debug(originalCheckData);

    // if all the checks pass, pass the data to the next step
    if (originalCheckData.id
        && originalCheckData.userPhone
        && originalCheckData.protocol
        && originalCheckData.url
        && originalCheckData.method
        && originalCheckData.successCodes
        && originalCheckData.timeoutSeconds) {

        workers.performCheck(originalCheckData);

    } else {
        debug('This check is not formatted correctly - skipping it.');
    }
}

// Perform the check, and send the checkData and the result to the next step
workers.performCheck = function (originalCheckData) {

    // prepare the initial check outcome
    var checkOutcome = {
        'error': false,
        'responseCode': false
    };

    // Mark that the outcome has not been sent yet
    var outcomeSent = false;

    // parse the hostname and path
    var parsedUrl = url.parse(originalCheckData.protocol + "://" + originalCheckData.url, true);
    var hostName = parsedUrl.hostname;
    var path = parsedUrl.path; // Using path, not pathname, becuase we need the whole url the user gave us to check

    // Construct a request
    var requestDetails = {
        'protocol': originalCheckData.protocol + ':',
        'hostname': hostName,
        'method': originalCheckData.method.toUpperCase(), /* uppercase needed here */
        'path': path,
        'timeout': originalCheckData.timeoutSeconds * 1000 /* this key expects millis */
    };

    // Instantiate the request object, using either http or https module
    var _moduleToUse = originalCheckData.protocol == 'http' ? http : https;
    var req = _moduleToUse.request(requestDetails, function (res) {
        // get the status of the sent request
        var status = res.statusCode;


        // update the check outcome
        checkOutcome.responseCode = status;

        // Has any other handler (error, timeout... ) already sent a response?
        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // Bind to the err event, so it does not get thrown - this would crash the thread
    req.on('error', function (e) {

        // Update the checkoutcome and pass the error along
        checkOutcome.error = {
            'error': true,
            'value': e
        };
        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // Bind to the timeout event
    req.on('timeout', function (e) {

        // Update the checkoutcome and pass the error along
        checkOutcome.error = {
            'error': true,
            'value': 'timeout'
        };
        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    // Send the request
    req.end();
};

// Process the checkoutcome and update the check data as needed, and trigger an alert to the user as needed.
// Special logic for accomodating a check that has never been tested before: because checks are 'down'
// by default, do not alert if the state is changing from down to up, if the check has never been tested before.
workers.processCheckOutcome = function (originalCheckData, checkOutcome) {
    // Decide if the check is up or down

    // The check is up if 
    // (1) there is no error, and
    // (2) there is a response code, and
    // (3) that code is one of those listed as a success code in this check.
    var state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    // Decide if an alert is needed
    // We text users when status changes from up to down, or from down to up, except if this is the first
    // time we're checking this one.
    // When we create a check we set lastChecked to false, and we set it to a number when we do check it.
    // If lastchecked is false, send no alert.
    var alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false;

    // log the outcome
    var timeOfCheck = Date.now();
    workers.log(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck);

    // Update the checkData with new state and last check time
    var newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = timeOfCheck;

    // Save this update
    _data.update('checks', newCheckData.id, newCheckData, function (err) {
        if (!err) {
            // Send the new check data to the next step (send alert) if needed
            if (alertWarranted) {
                workers.alertUserToStatusChange(newCheckData);
            } else {
                debug('Check outcome has not changed, no alert needed');
            }
        } else {
            debug('Error trying to save a check update');
        }
    })
}

// Alert the user to a change in their check status
workers.alertUserToStatusChange = function (newCheckData) {
    var msg = "Alert: your check for "
        + newCheckData.method.toUpperCase() + " "
        + newCheckData.protocol
        + "://" + newCheckData.url
        + " is currently " + newCheckData.state + ".";

    helpers.sendTwilioSms(newCheckData.userPhone, msg, function (err) {
        if (!err) {
            debug("Success! User was alerted to a status change in their check via sms.");
        } else {
            debug("Error: could not send sms alert from a state change");
        }
    })
}

workers.log = function (originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck) {
    // form the log data
    var logData = {
        'check': originalCheckData,
        'outcome': checkOutcome,
        'state': state,
        'alert': alertWarranted,
        'time': timeOfCheck
    };

    // convert data to string
    var logString = JSON.stringify(logData);

    // Determine the name of the log file
    var logFileName = originalCheckData.id;

    // append the log string to the output file
    _logs.append(logFileName, logString, function (err) {
        if (!err) {
            debug('Logging to file succeeded');
        } else {
            debug('Logging to file failed!');
        }
    });

}

// Timer to execute the worker process once per minute
workers.loop = function () {
    setInterval(function () {
        workers.gatherAllChecks();
    }, 1000 * 5);
};

// timer to execute the log-rotation process once a day
workers.logRotationLoop = function () {
    setInterval(function () {
        workers.rotateLogs();
    }, 1000 * 60 * 60 * 24);
};

// Compress the log files
workers.rotateLogs = function () {
    // list all the non-compressed log files
    _logs.list(false /* include compressed */, false /* compressed only */, function (err, logs) {
        if (!err && logs && logs.length) {
            logs.forEach(function (logName) {
                // compress the data to a new file
                var logId = logName.replace('.log', '');
                var newFileId = logId + '-' + Date.now();
                _logs.compress(logId, newFileId, function (err) {
                    if (!err) {
                        // truncate the original log
                        _logs.truncate(logId, function (err) {
                            if (!err) {
                                debug('Truncated ' + logId + ' OK.');
                            } else {
                                debug('Error truncating ' + logId, err);
                            }
                        });
                    } else {
                        debug('Error compressing ' + logId, err);
                    }
                });

            });
        } else {
            debug('Could not find any logs to rotate.');
        }
    });


};

workers.logPurgeLoop = function () {
    // delete old compressed logs each day
    // setTimeout(function(){
    //     workers.purgeCompressedLogs
    // }, 1000 * 60 * 60 * 24);

    // delete old compressed logs every...
    // TODO use setInterval
    setTimeout(function () {
        workers.purgeCompressedLogs();
    }, 1000 * 5);

}

workers.purgeCompressedLogs = function () {
    _logs.list(true /* include compressed */, true /* only compressed */, function (err, logFilenames) {
        if (!err && logFilenames && logFilenames.length > 1) {
            logFilenames.forEach(function (fileName) {
                // compressed files have a '-' in the name
                if (fileName.indexOf('-') > -1) {

                    // was it compressed more than 7 days ago? Whack it.
                    var currentDate = new Date();
                    var cutoffDate = new Date();
                    cutoffDate.setDate(currentDate.getDate() - 7);

                    // compressed logs are in format xxx-<date>.gz.b64,
                    // where <date> is the compression date. But we do not get the
                    // extension back from .list(), so we only care about xxx-<date>.
                    //
                    // We are iterating over compressed logs only because we passed
                    // true for the second arg, above.
                    //
                    // Split the filename on '-' and examine the date portion.
                    var elems = fileName.split('-');

                    if (elems.length == 2) {
                        var elem = elems[1]; // the date portion
                        var compressDate = new Date( new Number(elem) );
                        try {
                            if (compressDate < cutoffDate) {
                                debug('purging ' + fileName + ', compressed date '+ compressDate);
                                _logs.delete(fileName, function(err){
                                    if(err) {
                                        console.log(err);
                                        debug(err);
                                    } else {
                                        console.log('purged ' + fileName + ' OK');
                                        debug('purged ' + fileName + ' OK');
                                    }
                                });
                            }
                        } catch (e) {
                            debug(e);
                        }
                    }

                } // if filename.indexOf...
            }) // logFile foreach
        } else {
            // there are no logs
        }
    })
}


workers.tokenPurgeLoop = function () {
    //Purge every 2 hours
    setInterval(function () {
        workers.purgeExpiredTokens();
    }, 1000 * 60 * 60 * 2);

    //purge every 3 minutes
    // setInterval(function(){
    //     workers.purgeExpiredTokens();
    // }, 1000 * 60 * 3);
}

workers.purgeExpiredTokens = function () {
    // read all tokens
    // get token expiry as date (is stored as number)
    // compare token expiry to Date.now
    // if expirey < now then delete token
    console.log('purging tokens')

    _data.list('tokens', function (err, fileList) {
        if (!err && fileList && fileList.length > 0) {

            //console.log('got ' +fileList.length + " tokens" );

            var logId = 'tokenpurge';

            fileList.forEach(function (tokenFileName) {
                _data.read('tokens', tokenFileName, function (err, obj) {
                    if (!err && obj) {
                        var currentTime = Date.now();
                        var expiry = obj.expires;
                        if (expiry < currentTime) {

                            //console.log('Purging expired token ' + tokenFileName);

                            _data.delete('tokens', tokenFileName, function (err) {
                                if (!err) {
                                    _logs.append(logId, new Date() + ' Deleting expired token ' + tokenFileName, function () { });
                                } else {
                                    _logs.append(logId, new Date() + ' Unable to delete expired token ' + tokenFileName + ":" + err, function () { });
                                }
                            });
                        } else {
                            //console.log('token ' + tokenFileName + ' ok' );
                        }
                    } else {
                        debug('Could not read a token for ' + tokenFileName + '.');
                    }
                });
            });
        } else {
            debug('Could not list tokens, or no tokens found.');
        }
    })
}

workers.init = function () {
    // Execute all the checks
    workers.gatherAllChecks();

    // Call a loop so the checks execute on their own
    workers.loop();

    // Compress all the logs immediately
    workers.rotateLogs();

    // Call the compression loop so logs will be compressed later on
    workers.logRotationLoop();

    // Purge expired tokens every n hours
    workers.tokenPurgeLoop();

    // purge old compressed logs
    workers.logPurgeLoop();

    // To console, in yellow
    console.log('\x1b[33m%s\x1b[0m', 'Background workers are running');
};

module.exports = workers;