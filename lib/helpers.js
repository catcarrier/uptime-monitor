// Various helper functions
var crypto = require('crypto');
var config = require('./config');

var helpers = {};

// create sha256 hash
helpers.hash= function(str) {
    if(typeof(str)=='string' && str.length>0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

// Convert a json string to an object in all cases without throwing
helpers.parseJsonToObject = function(str) {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch(e) {
        console.log('Error parsing payload to json! The payload will be treated as {}.');
        return {};
    }
};

// Createa string of random alphanum chars of a given length
helpers.createRandomString = function(strLength) {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if(strLength > 0) {
        // Define all the chars that can go into a string
        var possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var str = '';
        for(var i = 1; i <= strLength; i++) {
            var randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
            str += randomChar;
        }
        return str;
    } else {
        return false;
    }
}

module.exports = helpers;