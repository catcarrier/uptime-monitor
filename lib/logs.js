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
lib.list = function (includeCompressedLogs, includeCompressedLogsOnly, cb) {
    fs.readdir(lib.baseDir, function (err, data) {
        if (!err && data && data.length > 0) {
            // create an array to hold trimmed filenames
            var trimmedFilenames = [];
            data.forEach(function (fileName) {
                // include all .log files -- unless the caller requested compressed logs only
                if (fileName.indexOf('.log') > -1 && !includeCompressedLogsOnly) {
                    trimmedFilenames.push(fileName.replace('.log', ''));
                }

                // optionally add the compressed files
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
lib.compress = function (logId, newFileId, cb) {
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

// Decompress the contents of a .gz.b64 file into a string variable
lib.decompress = function(fileId, cb){
    var fileName = fileId + ".gz.b64";

    fs.readFile(lib.baseDir + fileName , 'utf8', function(err,str /* base64 encoded string */){
        if(!err && str) {
            // decompress that string
            var inputBuffer = Buffer.from(str, 'base64');
            zlib.unzip(inputBuffer, function(err, outputBuffer){
                if(!err && outputBuffer) {
                    var str = outputBuffer.toString('utf8');
                    cb(false, str);
                } else {
                    cb(err);
                }
            });
        } else {
            cb(err);
        }
    });
};

// Truncate logs
lib.truncate = function(logId, cb){
    fs.truncate(lib.baseDir + logId + '.log', 0, function(err){
        if(!err) {
            cb(false);
        } else {
            cb(err);
        }
    })
}

// Delete a log file by full name
lib.delete = function(logId /* with .ext */, cb){
    fs.unlink(logId, function(err){
        if(!err) {
            cb(false);
        } else {
            cb('Unable to unlink log file ' + logId);
        }
    })
}

module.exports = lib;