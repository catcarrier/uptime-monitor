/**
 * Example http2 serve
 */

 var http2 = require('http2');

 var server = http2.createServer();

 // on a stream, send back some html
 server.on('stream', function(stream, headers){
     stream.respond({
         'status':200,
         'content-type':'text/html'
     });
     stream.end('<html><body><p>hi there</p></body></html>');
 });

 server.listen(6000);