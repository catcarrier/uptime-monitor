/**
 * Example http2 client
 */

 var http2 = require('http2');

 //create client
var client = http2.connect('http://localhost:6000');

// create request
var req = client.request({
    ':path':'/',
});

// when a msg is received, add the pieces together until the end
// in http2 the client can read payloads form the server just as the server can read from the client
var str = '';
req.on('data', function(chunk){
    str += chunk;
});

req.on('end', function(){
    console.log(str);
});

// fire off the request
req.end();