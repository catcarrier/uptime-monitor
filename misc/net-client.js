/**
 * Example tcp client aka 'net'
 * Connects to 6000 and sends 'ping'
 */

 var net = require('net');

 var outboundMessage = 'ping';

 var client = net.createConnection({'port':6000}, function(connection){
     client.write(outboundMessage);
 });

 // When the server writes back, log what it says, then kill client
 client.on('data', function(inboundMessage){
    var messageString =  inboundMessage.toString();
    console.log("I wrote "+ outboundMessage + " and they replied " + messageString);
    client.end();
 })