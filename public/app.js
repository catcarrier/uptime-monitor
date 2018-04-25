/*
 * Front end logic for application
 * 
 */

// Container for front end app
var app = {};

// config
app.config = {
    'sessionToken' : false /* todo persist to localStorage */
};

// ajax client for restful interface
app.client = {};

app.client.request = function(headers, path, method, queryStringObject, payload, cb) {
    // set defaults
    // on the client side, methods must be uppercased.
    headers = typeof(headers) == 'object' && headers !== null ? headers : {};
    path = typeof(path) == 'string' ? path : '/';
    method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
    queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof(payload) == 'object' && payload !== null ? payload : {};
    cb = typeof(cb) == 'function' ? cb : false; /* callback is optional */

    // For each querrystring param sent, ass it to the path
    var requestUrl = path + '?';
    var counter = 0;
    for (var queryKey in queryStringObject) {
        if(queryStringObject.hasOwnProperty(queryKey)){
            // if we are past the first param, prepend the param with an &
            if(counter > 1) { requestUrl += '&' }
            requestUrl += queryKey + '=' + queryStringObject[queryKey];
        }
    }

    // form the http request as a JSON type
    var xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    // For each header sent, add it to the request one by one
    for (var headerKey in headers) {
        xhr.setRequestHeader(headerKey, headers[headerKey]);
    }

    // If there is a session token, add it as a header named 'token'.
    // add the token's id, not the whole object
    if(app.config.sessionToken) {
        xhr.setRequestHeader('token', app.config.sessionToken.id);
    }

    // handle the response
    xhr.onreadystatechange = function(){
        if(xhr.readyState == XMLHttpRequest.DONE) {
            var statusCode = xhr.status;
            var responseReturned = xhr.responseText;

            // We do not necessarily care about the response. If the calling code
            // wants the response, it will have provided a callback.
            if(cb) { 
                try {
                    var parsedResponse = JSON.parse(responseReturned);
                    cb(parsedResponse);
                } catch(err) {
                    cb(statusCode, false);
                }
             }
        }
    }

    // send the payload as json
    var payloadString = JSON.stringify(payload);
    xhr.send(payloadString);

}


