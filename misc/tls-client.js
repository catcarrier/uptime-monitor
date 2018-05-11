/**
 * Example TLS client
 * Connects to 6000 and sends 'ping'
 * 
 */

 // dep
var tls = require('tls');
var fs = require('fs');
var path = require('path');

// server options
// Becuase we use a self-signed cert we have to include the cert (called 'ca' here) in each request.
// this is not necessary with a real cert.
// Note that the key.pem is not needed.
var options = {
    'ca': fs.readFileSync(path.join(__dirname, '/../https/cert.pem')) // only required becuase using self-
};

 var outboundMessage = 'ping';

 var client = tls.connect(6000, options, function(connection){
     client.write(outboundMessage);
 });

 // When the server writes back, log what it says, then kill client
 client.on('data', function(inboundMessage){
    var messageString =  inboundMessage.toString();
    console.log("I wrote "+ outboundMessage + " and they replied " + messageString);
    client.end();
 })