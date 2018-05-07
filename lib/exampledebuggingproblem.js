/**
 * This is a lib to demonstrate something throwing an error from its init
 */

 // container for maodule
 var example = {};

 example.init = function(){
     // throw an error
     var foo = bar;
 }

 module.exports = example;