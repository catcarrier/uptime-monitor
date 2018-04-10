/**
 * Request handlers
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');

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

                // console.log(phone, tokenIsValid);

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
handlers._users.delete = function (data, cb) {
    // check that phone number is valid
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.length == 10 ? data.queryStringObject.phone : false;
    if (phone) {

        console.log(phone)

        // Get the token from the headers
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        console.log(token)

        // confirm the token is associated with this phone number, not expired
        handlers.tokens.verifyToken(token, phone, function (tokenIsValid) {

            if (tokenIsValid) {
                _data.read('users', phone, function (err, userData) {
                    if (!err && userData) {
                        _data.delete('users', phone, function (err) {
                            if (!err) {
                                
                                // delete this user's checks
                                var userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                var checksToDelete = userChecks.length;
                                if(checksToDelete > 0) {

                                    // delete those checks
                                    var checksDeleted = 0;
                                    var deletionErrors = false;

                                    // loop through checks
                                    userChecks.forEach(function(checkId){
                                        _data.delete('checks', checkId, function(err){
                                            if(err) { deletionErrors = true; }
                                            checksDeleted++;
                                        } );
                                        if(checksDeleted == checksToDelete) {
                                            cb(200);
                                        } else {
                                            cb(500, {'Error':'Errors encoutnered while deleting user checks - some checks may not have been deleted'});
                                        }
                                    });

                                } else {
                                    cb(200);
                                }

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

    // look up the token
    _data.read('tokens', id, function (err, tokenData) {

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

// Checks
handlers.checks = function (data, callback) {
    var supportedMethods = ['post', 'get', 'put', 'delete'];
    if (supportedMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for all the checks methods
handlers._checks = {};

// checks - post
// The user is adding a check - enforce the five-check limit
// Required: protocol, url, method, successCodes, timeoutSeconds
// Optional: none
handlers._checks.post = function (data, cb) {
    var protocol = typeof (data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof (data.payload.url) == 'string' && data.payload.url.length > 0 ? data.payload.url : false;
    var method = typeof (data.payload.method) == 'string' && ['post', 'put', 'get', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    var timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && (data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5) ? data.payload.timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {

        // did user send a valid token?

        // get token from headers
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        // look up the user associated with this token
        _data.read('tokens', token, function (err, tokenData) {
            if (!err && tokenData) {
                var userPhone = tokenData.phone;

                _data.read('users', userPhone, function (err, userData) {
                    if (!err && userData) {
                        // What checks does this user have at present?
                        var userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                        // Verify that user has less than the max # of checks per user
                        if (userChecks.length < config.maxChecks) {
                            // create a random id for the check
                            var checkId = helpers.createRandomString(20);

                            // Create the check object and include the user's phone as a key
                            var checkObject = {
                                'id': checkId,
                                'userPhone': userPhone,
                                'protocol': protocol,
                                'url': url,
                                'method': method,
                                'successCodes': successCodes,
                                'timeoutSeconds': timeoutSeconds
                            };

                            // persist the new object
                            _data.create('checks', checkId, checkObject, function (err) {
                                if (!err) {
                                    // add the new checkid to the user's object

                                    // userData.checks may be undefined, so make sure it's assigned, if only to the def empty array
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    // Save the user data
                                    _data.update('users', userPhone, userData, function (err) {
                                        if (!err) {
                                            // return the data about the new check
                                            // This tells the caller the new checkid
                                            cb(200, checkObject)
                                        } else {
                                            cb(500, { 'Error': 'Could not update the user with the new check' });
                                        }
                                    })

                                } else {
                                    cb(500, { 'Error': 'Could not create the new check.' });
                                }
                            })

                        } else {
                            cb(400, { 'Error': 'User already has maximum mnumber of checks (' + config.maxChecks + ')' });
                        }

                    } else {
                        cb(403); // token does not map to a user
                    }
                })

            } else {
                cb(403);
            }
        });

    } else {
        cb(400, { 'Error': 'Missing required inputs, or inputs are invalid' })
    }
};


// checks - put
// Required: id
// Optional: at least one of: {protocol, url, method, successCodes, timeoutSeconds}
handlers._checks.put = function (data, cb) {

    // Check for required field
    var id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

    // Check for optional fields
    var protocol = typeof (data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof (data.payload.url) == 'string' && data.payload.url.length > 0 ? data.payload.url : false;
    var method = typeof (data.payload.method) == 'string' && ['post', 'put', 'get', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    var timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && (data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5) ? data.payload.timeoutSeconds : false;

    // console.log(id, protocol, url, method, successCodes, timeoutSeconds);
    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            // Look up the check - does it exist?
            _data.read('checks', id, function (err, checkData) {
                if (!err && checkData) {
                    // check for a valid token
                    var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

                    // Verify the token belongs to the user who created the check
                    handlers.tokens.verifyToken(token, checkData.userPhone, function (tokenIsValid) {
                        if (tokenIsValid) {
                            // Update the check
                            if (protocol) { checkData.protocol = protocol; }
                            if (url) { checkData.url = url; }
                            if (method) { checkData.method = method; }
                            if (successCodes) { checkData.successCodes = successCodes; }
                            if (timeoutSeconds) { checkData.timeoutSeconds = timeoutSeconds; }

                            _data.update('checks', id, checkData, function (err) {
                                if (!err) {
                                    cb(200);
                                } else {
                                    cb(500, { 'Error': 'Unable to update the check' });
                                }
                            });

                        } else {
                            cb(403);
                        }
                    });

                } else {
                    cb(400, { 'Error': 'No such check' });
                }
            });


        } else {
            cb(400, { 'Error': 'Missing required inputs, or inputs are invalid' })
        }
    } else {
        cb(400, { 'Error': 'Missing required inputs, or inputs are invalid' })
    }
}


// checks - get
// Required: id
// Optional: none
handlers._checks.get = function (data, cb) {
    // Check that id is valid
    // this comes from the query string, as this is a get
    var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.length == 20 ? data.queryStringObject.id : false;
    if (id) {

        // Look up the check
        _data.read('checks', id, function (err, checkData) {
            if (!err && checkData) {



                // Get the token from the request headers
                var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

                if (token) {

                    // Verify the given token is valid and belongs to the user who created the check
                    // check.userPhone == token.phone
                    handlers.tokens.verifyToken(token, checkData.userPhone, function (tokenIsValid) {


                        if (tokenIsValid) {
                            // return the checkData
                            cb(200, checkData);
                        } else {
                            cb(403);
                        }
                    });
                } else {
                    cb(403, { 'Error': 'Missing required token in header, or header is invalid/expired' });
                }
            } else {
                cb(404);
            }
        });
    } else {
        cb(400, { 'Error': 'Missing required field' });
    }
};


// checks - delete
// Required: id
// Optional: none
handlers._checks.delete = function (data, cb) {

    // for delete we use query string as payload may be ignored
    var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.length == 20 ? data.queryStringObject.id : false;

    if (id) {
       
        // Look up the check
        _data.read('checks', id, function (err, checkData) {
            
            if (!err && checkData) {

                // Get the token from the request headers
                var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

                if (token) {

                    // Verify the given token is valid and belongs to the user who created the check
                    handlers.tokens.verifyToken(token, checkData.userPhone, function (tokenIsValid) {
                        if (tokenIsValid) {

                            _data.delete('checks', id, function (err) {
                                if (!err) {

                                    // get the user who created this check
                                    _data.read('users', checkData.userPhone, function (err, userData) {
                                        if (!err && userData) {

                                            // Do not assume the user data has any checks
                                            var userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                                            // remove this check from that array
                                            var index = userChecks.indexOf(id);
                                            if (index > -1) { userChecks.splice(index, 1) }

                                            userData.checks = userChecks;

                                            //console.log(userData);

                                            //Save the updated user
                                            _data.update('users', userData.phone, userData, function (err) {
                                                if (!err) {

                                                    // return success
                                                    cb(204);
                                                } else {
                                                    cb(500, { 'Error': 'Unable to remove user references to the check' });
                                                }
                                            })

                                        } else {
                                            cb(500, { 'Error': 'Unable to remove references to the check' });
                                        }
                                    });
                                } else {
                                    cb(500, { 'Error': 'Unable to delete the check' });
                                }
                            });
                        } else {
                            cb(403);
                        }
                    });
                } else {
                    cb(403, { 'Error': 'Missing required token in header, or header is invalid/expired' });
                }
            } else {
                cb(404);
            }
        });


    } else {
        cb(400, { 'Error': 'Missing required field' });
    }
};


handlers.ping = function (data, cb) {
    cb(200);
};

handlers.notFound = function (data, cb) {
    cb(404);
};

module.exports = handlers;