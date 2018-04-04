/**
 *  Export config vars
 * 
 */

// Container for al lenvs
var environments = {};

// staging (default) env
environments.staging = {
    'port': 3000,
    'envName': 'staging'
};

environments.production = {
    'port': 5000,
    'envName': 'production'
};

// Determine which env to export
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that 'current env' matches one of our defined envs. If not, default to staging
var envToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// export
module.exports = envToExport;