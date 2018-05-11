/**
 * Example repl server
 * Take in 'fizz' and log out 'buzz'
 */

 var repl = require('repl');

 // start the repl
 repl.start({
    'prompt':'>',
    'eval':function(str){ 
        // evaluation function
        console.log('Evaluation stage, received '+ str);

        // if the user said 'fizz' reply with 'buzz'
        if (str.indexOf('fizz') > -1) { console.log('buzz'); }
     }
 });

