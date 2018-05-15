/**
 * Request handlers
 */

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');
var _url = require('url');
var dns = require('dns');
var _performance = require('perf_hooks').performance;
var util = require('util');
var debug = util.debuglog('performance'); // start with NODE_DEBUG=performance

var handlers = {};

/*
 * HTML handlers
 * 
 */
handlers.index = function (data, cb) {
    // Reject if not GET
    if (data.method == 'get') {
        // prepare for globals interpolation
        var templateData = {
            'head.title': 'Uptime Monitor',
            'head.description': 'Uptime monitoring for http/s sites',
            'body.class': 'index'
        }

        // Read in index template as a string
        helpers.getTemplate('index', templateData, function (err, str) {


            if (!err && str) {
                // add universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        cb(200, str, 'html');
                    } else {
                        cb(500, undefined, 'html');
                    }
                });
            } else {
                cb(500, undefined, 'html');
            }
        })
    } else {
        cb(405, undefined, 'html');
    }
}

handlers.accountCreate = function (data, cb) {

    // Reject if not GET
    if (data.method == 'get') {
        // prepare for globals interpolation
        var templateData = {
            'head.title': 'Create an Account',
            'head.description': 'Signup easy and quick!',
            'body.class': 'accountCreate'
        }

        // Read in index template as a string
        helpers.getTemplate('accountCreate', templateData, function (err, str) {


            if (!err && str) {
                // add universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        cb(200, str, 'html');
                    } else {
                        cb(500, undefined, 'html');
                    }
                });
            } else {
                cb(500, undefined, 'html');
            }
        })
    } else {
        cb(405, undefined, 'html');
    }

}

// Edit your account
handlers.accountEdit = function (data, cb) {
    // Reject if not GET
    if (data.method == 'get') {
        // prepare for globals interpolation
        var templateData = {
            'head.title': 'Account settings',
            'body.class': 'accountEdit'
        }

        // Read in index template as a string
        helpers.getTemplate('accountEdit', templateData, function (err, str) {


            if (!err && str) {
                // add universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        cb(200, str, 'html');
                    } else {
                        cb(500, undefined, 'html');
                    }
                });
            } else {
                cb(500, undefined, 'html');
            }
        })
    } else {
        cb(405, undefined, 'html');
    }
}

// Account has been deleted
handlers.accountDeleted = function (data, cb) {
    // Reject if not GET
    if (data.method == 'get') {
        // prepare for globals interpolation
        var templateData = {
            'head.title': 'Account deleted',
            'head.description': 'Your account has been deleted',
            'body.class': 'accountDeleted'
        }

        // Read in index template as a string
        helpers.getTemplate('accountDeleted', templateData, function (err, str) {


            if (!err && str) {
                // add universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        cb(200, str, 'html');
                    } else {
                        cb(500, undefined, 'html');
                    }
                });
            } else {
                cb(500, undefined, 'html');
            }
        })
    } else {
        cb(405, undefined, 'html');
    }
}

// Create a new check
handlers.checksCreate = function (data, cb) {
    // Reject if not GET
    if (data.method == 'get') {
        // prepare for globals interpolation
        var templateData = {
            'head.title': 'Create a new check',
            'body.class': 'checksCreate'
        }

        // Read in index template as a string
        helpers.getTemplate('checksCreate', templateData, function (err, str) {


            if (!err && str) {
                // add universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        cb(200, str, 'html');
                    } else {
                        cb(500, undefined, 'html');
                    }
                });
            } else {
                cb(500, undefined, 'html');
            }
        })
    } else {
        cb(405, undefined, 'html');
    }
}

// Dashboard (view all checks)
handlers.checksList = function (data, cb) {
    // Reject if not GET
    if (data.method == 'get') {
        // prepare for globals interpolation
        var templateData = {
            'head.title': 'Dashboard',
            'body.class': 'checksList'
        }

        // Read in index template as a string
        helpers.getTemplate('checksList', templateData, function (err, str) {


            if (!err && str) {
                // add universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        cb(200, str, 'html');
                    } else {
                        cb(500, undefined, 'html');
                    }
                });
            } else {
                cb(500, undefined, 'html');
            }
        })
    } else {
        cb(405, undefined, 'html');
    }
}

// Edit a check
handlers.checksEdit = function (data, cb) {
    // Reject if not GET
    if (data.method == 'get') {
        // prepare for globals interpolation
        var templateData = {
            'head.title': 'Check Details',
            'body.class': 'checksEdit'
        }

        // Read in index template as a string
        helpers.getTemplate('checksEdit', templateData, function (err, str) {


            if (!err && str) {
                // add universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        cb(200, str, 'html');
                    } else {
                        cb(500, undefined, 'html');
                    }
                });
            } else {
                cb(500, undefined, 'html');
            }
        })
    } else {
        cb(405, undefined, 'html');
    }
}


// Create new session
handlers.sessionCreate = function (data, cb) {
    // Reject if not GET
    if (data.method == 'get') {
        // prepare for globals interpolation
        var templateData = {
            'head.title': 'Log in to your Account',
            'head.description': 'Please enter your phone number and password',
            'body.class': 'sessionCreate'
        }

        // Read in index template as a string
        helpers.getTemplate('sessionCreate', templateData, function (err, str) {


            if (!err && str) {
                // add universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        cb(200, str, 'html');
                    } else {
                        cb(500, undefined, 'html');
                    }
                });
            } else {
                cb(500, undefined, 'html');
            }
        })
    } else {
        cb(405, undefined, 'html');
    }
}

// session deleted
handlers.sessionDeleted = function (data, cb) {
    // Reject if not GET
    if (data.method == 'get') {
        // prepare for globals interpolation
        var templateData = {
            'head.title': 'Logged Out',
            'head.description': 'You have been logged out',
            'body.class': 'sessionDeleted'
        }

        // Read in index template as a string
        helpers.getTemplate('sessionDeleted', templateData, function (err, str) {


            if (!err && str) {
                // add universal header and footer
                helpers.addUniversalTemplates(str, templateData, function (err, str) {
                    if (!err && str) {
                        cb(200, str, 'html');
                    } else {
                        cb(500, undefined, 'html');
                    }
                });
            } else {
                cb(500, undefined, 'html');
            }
        })
    } else {
        cb(405, undefined, 'html');
    }
}


// serve favicon
handlers.favicon = function (data, cb) {
    if (data.method == 'get') {
        // read in the favicon's data
        helpers.getStaticAsset('favicon.ico', function (err, data) {
            if (!err && data) {
                cb(200, data, 'favicon');
            } else {
                cb(500);
            }
        })
    } else {
        cb(405);
    }
}

// serve all public assets
handlers.public = function (data, cb) {
    if (data.method == 'get') {
        // get the filename beign requested -- trim off the leading 'public'
        var trimmedAssetName = data.trimmedPath.replace('public/', '').trim();

        //console.log(trimmedAssetName)

        if (trimmedAssetName.length > 0) {
            // we know the asset filename -- read in its data
            helpers.getStaticAsset(trimmedAssetName, function (err, data) {
                if (!err && data) {

                    //if(trimmedAssetName=='app.js') {console.log(typeof(data))}
                    //console.log(data);

                    // what mime type is it? Check the filename. Default to text.
                    var contentType = 'plain';

                    if (trimmedAssetName.indexOf('.css') > -1) {
                        contentType = 'css';
                    }

                    if (trimmedAssetName.indexOf('.js') > -1) {
                        contentType = 'js';
                    }

                    if (trimmedAssetName.indexOf('.png') > -1) {
                        contentType = 'png';
                    }

                    if (trimmedAssetName.indexOf('.jpg') > -1) {
                        contentType = 'jpg';
                    }

                    // if the user requested the icon from the public folder instead 
                    // of from the base url, make the contentType 'favicon'
                    if (trimmedAssetName.indexOf('.ico') > -1) {
                        contentType = 'favicon';
                    }

                    cb(200, data, contentType);

                } else {
                    cb(404);
                }
            })
        } else {
            cb(404); // nothing requested
        }
    } else {
        cb(405); // if not GET
    }
}


/*
 *JSON API handlers
 * 
 */

handlers.exampleError = function (data, cb) {
    var err = new Error('This is an example error');
    throw (err);
}

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

        // Get the token from the headers
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        //console.log('token is ' + token);

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
                                if (checksToDelete > 0) {

                                    // delete those checks
                                    var checksDeleted = 0;
                                    var deletionErrors = false;

                                    // loop through checks
                                    userChecks.forEach(function (checkId) {
                                        _data.delete('checks', checkId, function (err) {
                                            if (err) { deletionErrors = true; }
                                            checksDeleted++;
                                        });
                                        if (checksDeleted == checksToDelete) {
                                            cb(200);
                                        } else {
                                            cb(500, { 'Error': 'Errors encountered while deleting user checks - some checks may not have been deleted' });
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

    _performance.mark('entered function');

    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.length == 10 ? data.payload.phone : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;

    _performance.mark('inputs validated');


    if (phone && password) {
        // look up the user matching this phone

        _performance.mark('beginning user lookup');

        _data.read('users', phone, function (err, userData) {

            _performance.mark('user lokup complete');

            if (!err && userData) {
                // Hash the sent password, compare with the password from the user object

                _performance.mark('beginning password hashing');

                var hashedPassword = helpers.hash(password);

                _performance.mark('password hashing complete');

                if (hashedPassword == userData.hashedPassword) {
                    // create a new token with a random name, set expiry to +1 day

                    _performance.mark('creating data for token');

                    var tokenId = helpers.createRandomString(20);

                    // expires in one day
                    var expires = Date.now() + (1000 * 60 * 60 * 24);

                    // expires in 2 minutes
                    //var expires = Date.now() + (1000 * 60 * 2);

                    var tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    _performance.mark('beginning storing token');

                    _data.create('tokens', tokenId, tokenObject, function (err) {

                        _performance.mark('storing token complete');

                        // Gather the performance measurements
                        _performance.measure('Beginning to end', 'entered function', 'storing token complete');
                        _performance.measure('Validating user input', 'entered function', 'inputs validated');
                        _performance.measure('User lookup', 'beginning user lookup', 'user lokup complete');
                        _performance.measure('Password hashing', 'beginning password hashing', 'password hashing complete');
                        _performance.measure('Token data creation', 'creating data for token', 'beginning storing token');
                        _performance.measure('Token Storage', 'beginning storing token', 'storing token complete');

                        // log out the measurements
                        var measurements = _performance.getEntriesByType('measure'); // array of measurements
                        measurements.forEach(function (measurement) {
                            debug('\x1b[33m%s\x1b[0m' /* yellow */, measurement.name + ' ' + measurement.duration);
                        })

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

                    // extend one hour
                    //tokenObject.expires = Date.now() + (1000 * 60 * 60);

                    // extend two minutes
                    tokenObject.expires = Date.now() + (1000 * 60 * 1);

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

    //console.log(protocol, url, method, successCodes, timeoutSeconds)

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

                            // Verify that the url given has dns entries, so we do not create
                            // a check with a url that points to nothing
                            var parsedUrl = _url.parse(protocol + '://' + url, true);
                            var hostName = typeof (parsedUrl.hostname) == 'string' && parsedUrl.hostname.length > 0 ? parsedUrl.hostname : false;
                            dns.resolve(hostName, function (err, records) {
                                if (!err && records) {

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
                                    cb(400, { 'Error': 'Hostname did not resolve to any dns entries.' });
                                }
                            });
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