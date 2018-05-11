/**
 * Example tcp aka 'net' server
 * Listens to 6000 and sends 'pong' to clients
 */

// dep
var net = require('net');

var server = net.createServer(function (connection) {
    // send the word 'pong'
    var outboundMessage = 'pong';
    connection.write(outboundMessage);

    // When the client sends something, log it out
    connection.on('data',function(inboundMessage){
        var messageString = inboundMessage.toString();
        console.log("I wrote " + outboundMessage + " and they said " + messageString);
    }); 
});

server.listen(6000);