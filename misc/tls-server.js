/**
 * Example TLS server
 * Listens to 6000 and sends 'pong' to clients
 */

// dep
var tls = require('tls');
var fs = require('fs');
var path = require('path');

// server options
var options = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

var server = tls.createServer(options, function (connection) {
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