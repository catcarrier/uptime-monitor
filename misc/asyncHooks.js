/**
 * async hooks example
 * 
 * Do not use async methods -- eg, console.log -- to track async operations.
 * In this example we use fs.writeSynch to block the thread while
 * we log what is happening
 * 
 */



var async_hooks = require('async_hooks');
var fs = require('fs');

// Target execution context
var targetExecutionContext = false;

// write an arbitrary asynch function
var whatTimeIsIt = function (cb) {
    setInterval(function () {
        fs.writeSync(1, 'When the setInterval runs, the execution context is ' + async_hooks.executionAsyncId() + '\n');
        cb(Date.now());
    }, 1000);
};


whatTimeIsIt(function(time){
    fs.writeSync(1, "The time is " + time + "\n");
});

// Hooks
var hooks = {
    init(asyncId, type,triggerAsync){
        fs.writeSync(1, "Hook init " + asyncId + '\n');
    },
    before(asyncId){
        fs.writeSync(1, "Hook before " + asyncId + '\n');
    },
    after(asyncId){
        fs.writeSync(1, "Hook after " + asyncId + '\n');
    },
    destroy(asyncId){
        fs.writeSync(1, "Hook destroy " + asyncId + '\n');
    },
    promiseResolve(asyncId){
        fs.writeSync(1, "Hook promiseResolve " + asyncId + '\n');
    }
};

// new inst of async_hooks
var asyncHook = async_hooks.createHook(hooks);
asyncHook.enable();