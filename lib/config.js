/**
 *  Export config vars
 * 
 */

// Container for al lenvs
var environments = {};

// staging (default) env
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'SecretDecoderRing',
    'maxChecks': 5,
    'twilio': {
        'accountSid': 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken': '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone': '+15005550006'
    }
};

environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'SecretDecoderRing',
    'maxChecks': 5,
    'twilio': {
        'fromPhone': '',
        'accountSid': '',
        'authToken': ''
    }
};

// Determine which env to export
var currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that 'current env' matches one of our defined envs. If not, default to staging
var envToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// export
module.exports = envToExport;