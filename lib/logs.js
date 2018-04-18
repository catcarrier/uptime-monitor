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
lib.append = function (file, str, cb) {
    // open the file for append
    fs.open(lib.baseDir + file + '.log', 'a', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            fs.appendFile(fileDescriptor, str + '\n', function (err) {
                if (!err) {
                    fs.close(fileDescriptor, function (err) {
                        if (!err) {
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

// list all the logs, and optionally include compressed logs
lib.list = function (includeCompressedLogs, cb) {
    fs.readdir(lib.baseDir, function (err, data) {
        if (!err && data && data.length > 0) {
            // create an array to hold trimmed filenames
            var trimmedFilenames = [];
            data.forEach(function (fileName) {
                // add all .log files
                if (fileName.indexOf('.log') > -1) {
                    trimmedFilenames.push(fileName.replace('.log', ''));
                }

                // optionally add the compressed files
                // We are base64 encoding them for easier reading later so here we 
                if (fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
                    // trim and push
                    trimmedFilenames.push(fileName.replace('.gz.b64', ''));
                }
            });

            cb(false, trimmedFilenames);

        } else {
            cb(err, data);
        }
    })
};

// Compress the contents of one .log file into a .gz.b64 file in the same dir
_logs.compress = function (logId, newFileId, cb) {
    var sourceFile = logId + '.log';
    var destFile = newFileId + '.gz.b64';

    // Read the source file
    fs.readFile(lib.baseDir + sourceFile, 'utf8', function (err, inputString) {
        if (!err && inputString) {
            // compress the data using gzip
            zlib.gzip(inputString, function (err, buffer) {
                if (!err && buffer) {
                    // Send the compressed data to the dest file
                    fs.open(lib.baseDir + destFile, 'wx', function (err, fileDescriptor) {
                        if (!err && fileDescriptor) {
                            // Write to the dest file
                            fs.writeFile(fileDescriptor, buffer.toString('base64'), function (err) {
                                if (!err) {
                                    fs.close(fileDescriptor, function (err) {
                                        if (!err) {
                                            cb(false);
                                        } else {
                                            cb(err);
                                        }
                                    })
                                } else {
                                    cb(err);
                                }
                            })

                        } else {
                            cb(err);
                        }
                    });
                } else {
                    cb(err);
                }
            });
        } else {
            cb(err);
        }
    });

};


module.exports = lib;