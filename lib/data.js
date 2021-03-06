/**
 * library for storing and editing data
 */
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

var lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = function (dir, file, data, cb) {

    // try to open the file for writing
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {

            // Convert data to string
            var stringData = JSON.stringify(data);

            // write to file and close
            fs.writeFile(fileDescriptor, stringData, function (err) {
                if (!err) {
                    fs.close(fileDescriptor, function (err) {
                        if(!err) {
                            cb(false); // return false for err
                        } else {
                            cb('Error closing new file!');
                        }
                    });
                } else {
                    cb('Error writing to new file');
                }
            })
        } else {
            cb('Could not create file -- it may already exist.');
        }
    });
};

// read data from a file
lib.read = function(dir, file, callback) {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function(err, data){
        if(!err && data) {
            var parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    } );
};

lib.update = function(dir, filename, data, cb) {
    // open the file for writing

    fs.open(lib.baseDir + dir + '/' + filename + '.json', 'r+', function(err, fileDescriptor) {
        if(!err && fileDescriptor) {
            var stringData = JSON.stringify(data);

            // truncate
            fs.truncate(fileDescriptor, function(err) {
                if(!err) {
                    // write and close
                    fs.writeFile(fileDescriptor, stringData, function (err) {
                        if(!err) {
                            fs.close(fileDescriptor, function(err) {
                                if (err) {
                                    cb('Error closing updated file: ' + err);
                                } else {
                                    cb(false);
                                }
                            });
                        } else {
                            cb('Error writing to existing file: ' + err);
                        }
                    });
                } else {
                    cb('Error truncating the file: ' + err);
                }

            });

        } else {
            cb('Could not open the file for updating -- it may not exist.');
        }
    } )
};

lib.delete = function(dir, filename, cb) {
    fs.unlink(lib.baseDir + dir + '/' + filename + '.json', function(err){
        if(!err) {
            cb(false);
        } else {
            cb("Error removing the file " + filename);
        }
    })
};

// List all the items in a directory
lib.list = function(dir, cb) {
    fs.readdir(lib.baseDir + dir + '/', function(err, data /* array */) {
        if(!err && data && data.length > 0) {
            var trimmedFileNames = [];
            data.forEach(function(fileName) {
                // trim off '.json', to return just the root
                // Note the assumption that all filenames end in .json
                trimmedFileNames.push( fileName.replace('.json','') )
            });
            cb(false,trimmedFileNames);
        } else {
            cb(err, data);
        }
    });
};

module.exports = lib;
