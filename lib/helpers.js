// Various helper functions
var crypto = require('crypto');
var config = require('./config');
var https = require('https');
var querystring = require('querystring');
var path = require('path');
var fs = require('fs');
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
        //console.log('Error parsing payload to json! The payload will be treated as {}.');
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

// Send an sms via Twilio
helpers.sendTwilioSms = function(phone, msg, cb) {
    // validate params
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
    if(phone && msg) {
        // configure the request payload
        var payload = {
            'From' : config.twilio.fromPhone,
            'To' : '+1' + phone,
            'Body' : msg
        };

        // stringify the payload
        // do not use json.stringify here -- twilio uses urlencoded, so we use querystring to return a urlencoded version
        var stringPayload = querystring.stringify(payload);

        // configure request details
        var requestDetails = {
            'protocol' : 'https:',
            'hostname' : 'api.twilio.com',
            'method'   : 'POST',
            'path'     : '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
            'auth'     : config.twilio.accountSid + ':' + config.twilio.authToken,
            'headers'  : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length' : Buffer.byteLength(stringPayload)
            }   
        };

        // Instantiate the request object and assign a callback
        var req = https.request(requestDetails, function(res){

            // get the status of the sent request
            var status = res.statusCode;
            if(status == 200 || status == 201) {
                cb(false); // error-back pattern, false means ok
            } else {
                cb('Status code was ' + status);
            }
        });

        // Bind to the error event so it is not thrown - that would kill the thread
        req.on('error', function(e) {
            cb(e);
        });

        // Add the payload
        req.write(stringPayload);

        // send the request - this will invoke the callback shown above
        req.end();
    } else {
        cb('Params missing or invalid');
    }
}

// Get the string content of a template
helpers.getTemplate = function(templateName, data, cb){
    //console.log(cb);
    templateName = typeof(templateName)=='string' && templateName.length > 0 ? templateName : false;

    //console.log(templateName);

    data = typeof(data) == 'object' && data !== null ? data : {};
    if(templateName) {
        var templatesDir = path.join(__dirname, '/../templates');
        fs.readFile(templatesDir + '/' + templateName + '.html', 'utf8', function(err, str){
            if(!err && str) {
                var finalString = helpers.interpolate(str, data);
                cb(false, finalString);
            } else {
                cb('No such template');
            }
        } )
    } else {
       cb('No valid template-name supplied');
    }
};

// Add the universal header and footer to a string (content of a template), 
// and pass the data object to the header and footer for interpolation
helpers.addUniversalTemplates = function(str, data, cb) {
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};

    // get header
    helpers.getTemplate('_header', data, function(err, headerString){
        if(!err && headerString) {
            // get the footer
            helpers.getTemplate('_footer', data, function(err, footerString){
                if(!err && footerString) {
                    // concat
                    var fullString = headerString + str + footerString;
                    cb(false, fullString);
                } else {
                    cb('Could not find the footer template');
                }
            });
        } else {
            cb('Could not find the header template');
        }
    });
}


// Take a given string and a data object, and find-replace all the keys within it
helpers.interpolate = function(str, data) {
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data !== null ? data : {};

    // Add the template globals to the data object, appending their keyname with 'global'
    for(var keyName in config.templateGlobals) {
        if( config.templateGlobals.hasOwnProperty(keyName) ) {
            data['global.' + keyName] = config.templateGlobals[keyName]
        }
    }

    // For each key in the data object, insert its value into the string at the corresponding placeholder
    for(var key in data) {
        if(data.hasOwnProperty(key) && typeof(data[key]) == 'string'){
            var replace = data[key];
            var find = '{' + key + '}';
            str = str.replace(find, replace);
        }
    }
    return str;
}

// Get the content of a static resource
helpers.getStaticAsset = function(fileName, cb){

    //console.log(fileName)
    fileName = typeof(fileName)=='string' && fileName.length > 0 ? fileName : false;
    if(fileName) {
        var publicDir = path.join(__dirname, '/../public/');

        //console.log(publicDir + fileName)
        fs.readFile(publicDir + fileName, function(err, data){

            //console.log(data);
            if(!err && data) {
                cb(false, data);
            } else {
                cb('No file found!');
            }
        });
    } else {
        cb('No valid filename specified');
    }

}

module.exports = helpers;