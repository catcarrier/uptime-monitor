/**
 * Example udp client
 */

 //dep
 var dgram = require('dgram');

 // create the client
 var client = dgram.createSocket('udp4');

 // define the msg and pull it in to a buffer
var messageString = "This is a message";
var messageBuffer = Buffer.from(messageString);

// send the msg
client.send(messageBuffer,  6000, 'localhost', function(err){
    client.close();
})
