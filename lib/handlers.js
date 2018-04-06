/**
 * Request handlers
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');

var handlers = {};

// Blanket handler for users -- checks whether the method is supported,
// forwards request to a method-specific handler
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

// Users - get
// Required data: phone
// Optoinal data : none
handlers._users.get = function (data, cb) {
    // Check that phone number is valid
    // this comes from the query string, as this is a get
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.length == 10 ? data.queryStringObject.phone : false;
    if (phone) {

        // Get the token from the request headers
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        if (token) {
            // Verify the given token is valid for the phone number
            handlers.tokens.verifyToken(token, phone, function (tokenIsValid) {
                if (tokenIsValid) {
                    _data.read('users', phone, function (err, data) {
                        if (!err && data) {
                            // remove hashed password
                            delete data.hashedPassword;
                            cb(200, data);
                        } else {
                            cb(404);
                        }
                    });
                } else {
                    cb(403, { 'Error': 'Missing required token in header, or header is invalid/expired' });
                }
            });
        } else {
            cb(403, { 'Error': 'Missing required token in header, or header is invalid/expired' });
        }
    } else {
        cb(400, { 'Error': 'Missing required field' });
    }
};

// Required data: firstname, lastname, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, cb) {

    // console.log(data);

    // check that required fields are filled out
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

    // area code plus seven-digit number, no spaces, no other chars
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;
    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

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
        });

    } else {
        cb(400, { 'Error': 'Missing required fields' });
    }

};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one is required)
handlers._users.put = function (data, cb) {
    // Check for required field
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    // Check for optional fields
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;

    // Error if the phone is invalid
    if (phone) {

        // optional fields - must supply at least one
        if (firstName || lastName || password) {

            // The requestor should have this token in their headers. Check whether it has expired.
            var token = typeof (data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token : false;

            // Verify the token is valid for the phone number
            handlers.tokens.verifyToken(token, phone, function (tokenIsValid) {
                if (tokenIsValid) {

                    // check that the user exists
                    _data.read('users', phone, function (err, userData) {
                        if (!err && data) {
                            // Update the fields
                            if (firstName) { userData.firstName = firstName; }
                            if (lastName) { userData.lastName = lastName; }
                            if (password) { userData.hashedPassword = helpers.hashedPassword(password); }
                            _data.update('users', phone, userData, function (err) {
                                if (!err) {
                                    cb(200);
                                } else {
                                    console.log(err);
                                    cb(500, { 'Error': 'An error occurred while attempting to update the user' });
                                }
                            });
                        } else {
                            cb(400, { 'Error': 'No such user' })
                        }
                    })
                } else {
                    cb(403, { 'Error': 'Missing required token in header, or header is invalid/expired' });
                }
            })

        } else {
            cb(400, { 'Error': 'Missing required field' });
        }

    } else {
        cb(400, { 'Error': 'Missing required field - phone' });
    }

};

// Users - delete
// Required fields: phone
// @TODO only let an authenticated user delete an object; do not let them delete anyone else's object.
// @TODO Cleanup any other data for the deleted user.
handlers._users.delete = function (data, cb) {
    // check that phone number is valid
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.length == 10 ? data.queryStringObject.phone : false;
    if (phone) {

        // Get the token from the headers
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        // confirm the token is associated with this phone number, not expired
        handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
            if (tokenIsValid) {
                _data.read('users', phone, function (err, data) {
                    if (!err && data) {
                        _data.delete('users', phone, function (err) {
                            if (!err) {
                                cb(200);
                            } else {
                                cb(500, { 'Error': 'An error occured while attempting to delete the user' });
                            }
                        });
                    } else {
                        cb(400, { 'Error': 'Could not find the specified user' });
                    }
                });
            } else {
                cb(403, { 'Error': 'Missing required token in header, or header is invalid/expired' });
            }
        });
    } else {
        cb(400, { 'Error': 'Missing required field' });
    }
};

// Tokens
// Blanket handler for tokens
handlers.tokens = function (data, callback) {
    var supportedMethods = ['post', 'get', 'put', 'delete'];
    if (supportedMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Tokens - container for all the tokens methods
handlers._tokens = {};

// Tokens - post
// Required: phone, password
// Optional: none
handlers._tokens.post = function (data, cb) {

    //console.log('starting handlers.tokens')

    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.length == 10 ? data.payload.phone : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;
    if (phone && password) {
        // look up the user matching this phone
        _data.read('users', phone, function (err, userData) {
            if (!err && userData) {
                // Hash the sent password, compare with the password from the user object
                var hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.hashedPassword) {
                    // create a new token with a random name, set expiry to +1 hour
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + (1000 * 60 * 60);
                    var tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };
                    _data.create('tokens', tokenId, tokenObject, function (err) {
                        if (!err) {
                            cb(200, tokenObject);
                        } else {
                            cb(500, { 'Error': 'Could not create token' });
                        }
                    });
                } else {
                    cb(400, { 'Error': 'Unable to validate the password' });
                }

            } else {
                cb(400, { 'Error': 'No matching user' });
            }
        })

    } else {
        cb(400, { 'Error': 'Missing required fields' });
    }

};

// Tokens - put
// Required fields: id, extend
// Optional: none
handlers._tokens.put = function (data, cb) {
    var id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id : false;
    var extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? data.payload.id : false;
    if (id && extend) {
        _data.read('tokens', id, function (err, tokenObject) {

            //console.log(err, tokenObject)

            if (!err && tokenObject) {
                // is token already expired?
                if (tokenObject.expires > Date.now()) {
                    tokenObject.expires = Date.now() + (1000 * 60 * 60);
                    _data.update('tokens', id, tokenObject, function (err) {
                        if (!err) {
                            cb(200);
                        } else {
                            cb(500, { 'Error': 'Unable to update the  token\'s expiration' });
                        }
                    })
                } else {
                    cb(400, { 'Error': 'Token is expired' });
                }

            } else {
                cb(400, { 'Error': 'No such token' });
            }
        })
    } else {
        cb(400, { 'Error': '' })
    }
};

// Tokens - get
// Required: id
// Optional: none
handlers._tokens.get = function (data, cb) {
    // check that the id they sent is valid
    var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id : false;
    if (id) {
        _data.read('tokens', id, function (err, tokenData) {
            if (!err && tokenData) {
                cb(200, tokenData);
            } else {
                cb(404);
            }
        });
    } else {
        cb(400, { 'Error': 'Missing required field' });
    }

};

// Tokens - delete
// Required: id
// Optional: none
handlers._tokens.delete = function (data, cb) {
    // check that id is valid
    var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.length == 20 ? data.queryStringObject.id : false;
    if (id) {
        _data.read('tokens', id, function (err, data) {
            if (!err && data) {
                _data.delete('tokens', id, function (err) {
                    if (!err) {
                        cb(200);
                    } else {
                        cb(500, { 'Error': 'An error occured while attempting to delete the token' });
                    }
                });
            } else {
                cb(400, { 'Error': 'Could not find the specified token' });
            }
        });
    } else {
        cb(400, { 'Error': 'Missing required field' });
    }
};

// Verify that a given token is currently valid for a given user
handlers.tokens.verifyToken = function (id, phone, cb) {

    // console.log(id, phone);

    // look up the token
    _data.read('tokens', id, function (err, tokenData) {

        // console.log(err, tokenData);

        if (!err && tokenData) {
            // check that the token is for the given user
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                cb(true);
            } else {
                cb(false);
            }
        } else {
            cb(400, { 'Error': 'Token not found' });
        }
    })
}


handlers.ping = function (data, cb) {
    cb(200);
};

handlers.notFound = function (data, cb) {
    cb(404);
};

module.exports = handlers;