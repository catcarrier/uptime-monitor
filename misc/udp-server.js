/**
 * Create a udp datagram server
 */

 //dep
 var dgram = require('dgram');

 // create a server
 var server = dgram.createSocket('udp4');

 server.on('message', function(messageBuffer, sender){
     // do something with incoming messge, or do something with the sender
     var messageString = messageBuffer.toString();
     console.log(messageString);
 });

 // Bind to 600
 server.bind(6000);
