/**
 * Unit tests
 */

// dep
var helpers = require('./../lib/helpers');
var assert = require('assert');
var logs = require('./../lib/logs');
var exampleDebuggingProblem = require('./../lib/exampledebuggingproblem');

// holder for tests
var unit = {};


// Assert that getANumber returns a number
unit['helpers.getANumber should return a number'] = function (done) {
    var val = helpers.getANumber();
    assert.equal(typeof (val), 'number');
    done();
};

// Assert that getANumber returns 1
unit['helpers.getANumber should return 1'] = function (done) {
    var val = helpers.getANumber();
    assert.equal(val, 1);
    done();
};

// Assert that getANumber returns 2
unit['helpers.getANumber should return 2'] = function (done) {
    var val = helpers.getANumber();
    assert.equal(val, 2);
    done();
};

// logs.list should call back an array and a false error
unit['logs.list should call back a false error and an array of filenames']= function(done){
    logs.list(true, function(err, logFileNames){
        assert.equal(err, false);
        assert.ok(logFileNames instanceof Array); // ok asserts truthiness
        assert.ok(logFileNames.length > 0);
        done();
    })
}

// truncate should not throw even if @id param is bad
unit['logs.truncate does not throw if logId does not exist, calls back an error instead'] = function(done){
    assert.doesNotThrow(function(){
        logs.truncate('no_such_logid', function(err){
            assert.ok(err);
            done();
        })
    }, TypeError);
}

// exampleDebuggingProblem.init should not throw, but it does
unit['exampleDebuggingProblem.init should not throw when called'] = function(done){
    assert.doesNotThrow(function(){
        exampleDebuggingProblem.init();
        done();
    }, TypeError);
}

module.exports = unit;