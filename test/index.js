/**
 * Test runner
 */

// app logic for test runner
_app = {};

// container for tests
_app.tests = {};

// add the unit tests as a dependency
_app.tests.unit = require('./unit');

// Count all the tests
_app.countTests = function () {
    var counter = 0;
    for (var key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            var subTests = _app.tests[key];
            for (var testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    counter++;
                }
            }
        }
    }
    return counter;
}

// Produce a test outcome report
_app.produceTestReport = function (limit, successes, errors) {
    console.log("");
    console.log("------------------------------ BEGIN TEST REPORT ------------------------------");
    console.log("Total tests: " + limit);
    console.log("Pass: " + successes);
    console.log("Fail: " + errors.length);
    console.log("");

    // If there are errors, print them in detail
    if (errors.length > 0) {
        console.log("------------------------------ BEGIN ERROR DETAILS ------------------------------");
        console.log("");

        errors.forEach(function(testError){
            console.log('\x1b[31m%s\x1b[0m', testError.name);
            console.log(testError.error);
            console.log("");
        });

        console.log("");
        console.log("------------------------------ END ERROR DETAILS ------------------------------");
    }

    console.log("");
    console.log("------------------------------ END TEST REPORT ------------------------------");
}

// Run all the tests, collecting the errors and successes
_app.runTests = function () {
    var errors = [];
    var successes = 0;
    var limit = _app.countTests();
    var counter = 0;

    // keys include 'unit'...
    for (var key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            var subTests = _app.tests[key];
            for (var testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {

                    // run the test in a closure
                    (function () {
                        var tmpTestName = testName;
                        var testValue = subTests[testName];

                        // Call the test, and pass the cb (named 'done')
                        try {
                            testValue(function () {
                                // this is the done()

                                // log green
                                console.log('\x1b[32m%s\x1b[0m', tmpTestName);
                                counter++;
                                successes++;
                                if (counter == limit) {
                                    _app.produceTestReport(limit, successes, errors);
                                }
                            });
                        } catch (e) {
                            // If it throws it fails, so capture the error thrown,
                            // and log it in red
                            errors.push({
                                'name': testName,
                                'error': e
                            });

                            // log red
                            console.log('\x1b[31m%s\x1b[0m', tmpTestName);
                            counter++;
                            if (counter == limit) {
                                _app.produceTestReport(limit, successes, errors);
                            }
                        }

                    })();
                }
            }
        }

    }
}

// run the tests
_app.runTests();