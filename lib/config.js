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
    'hashingSecret': 'SecretDecoderRing'
};

environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'SecretDecoderRing'
};

// Determine which env to export
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that 'current env' matches one of our defined envs. If not, default to staging
var envToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// export
module.exports = envToExport;