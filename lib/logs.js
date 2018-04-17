/**
 * A library for storing and rotating logs
 */
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

// Container
var lib = {};

// base directory of the logs folder
lib.baseDir = path.join(__dirname, '/../.logs/');

// Append a string to a file, create file if not exist
//append(logFileName, logString, function(err){
lib.append = function(file, str, cb){
    // open the file for append
    fs.open(lib.baseDir + file + '.log', 'a', function(err, fileDescriptor) {
        if(!err && fileDescriptor) {
            fs.appendFile(fileDescriptor, str + '\n', function(err){
                if(!err) {
                    fs.close(fileDescriptor, function(err){
                        if(!err) {
                            cb(false);
                        } else {
                            cb('Error closing the log file after append!');
                        }
                    })
                } else {
                    cb('Error appending the log file');
                }
            });
        } else {
            console.log('Could not open file for appending');
        }
    });


}


module.exports = lib;