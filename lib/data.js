/**
 * library for storing and editing data
 */
var fs = require('fs');
var path = require('path');

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



module.exports = lib;
