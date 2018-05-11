/**
 * Example vm in node
 */

 var vm = require('vm');

 // define a context for the script to run in
 // variables become available in the script
 var context = {
     'foo':25
 };

 var script = new vm.Script(`
    foo = foo * 2;
    var bar = foo +1;
    var fizz = 52;
 `);

 // Run the script
 script.runInNewContext(context);

 console.log(context);