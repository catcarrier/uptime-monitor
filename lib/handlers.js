/**
 * Request handlers
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');

var handlers = {};

handlers.users = function (data, callback) {
    var supportedMethods = ['post', 'get', 'put', 'delete'];
    if (supportedMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the users submethods
handlers._users = {};

handlers._users.get = function (data, cb) {
    //todo
};

// Required data: firstname, lastname, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, cb) {

    // console.log(data);

    // check that required fields are filled out
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

    // area code plus seven-digit number, no spaces, no other chars
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure user phone number does not already exist
        _data.read('users', phone, function (err, data) {
            if (err) {
                // hash the password
                var hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    // Create the user object
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };

                    // Persist the new user
                    _data.create('users', userObject.phone, userObject, function (err) {
                        if (!err) {
                            cb(200);
                        } else {
                            cb(500, { 'Error': 'Could not create the new user.' })
                        }
                    })
                } else {
                    cb(500, { 'Error': 'Could not hash the user password' });
                }

            } else {
                cb(400, { 'Error': 'A user with that phone number already exists.' });
            }
        })



    } else {
        cb(400, { 'Error': 'Missing required fields' });
    }

};

handlers._users.put = function (data, cb) {
    //todo
};

handlers._users.delete = function (data, cb) {
    //todo
};


handlers.ping = function (data, cb) {
    cb(200);
};

handlers.notFound = function (data, cb) {
    cb(404);
};

module.exports = handlers;