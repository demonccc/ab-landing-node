//
// Simple node app to A/B test static landing pages in the content dir.
//
// The content dir should contain landing pages named landing0.html, landing1.html, landing2.html.
//
// When running this server, a different landing page will be returned, in round-robin fashion,
// upon each request.
//

// Return one of 3 pages: landing0.html, landing1.html, landing2.html.
var totalPages = 3;
var pageNamePrefix = "landing";


var connect = require("connect");
var http = require("http");
var fs = require("fs");

process.on("uncaughtException", function(err){
    console.error(err.stack);
});


var port = process.env.PORT || 5000;

console.log("ab-landing listening on port " + port);

var app = connect()
    // return content from the content dir to handle css/js requests
    .use(connect.static("content"))

    // any request that doesn't exactly match something in the content dir will be handled here:
    .use(function(request, response){
        handleRequest(request, response);
    })
    .listen(port);



function handleRequest(request, response) {
    var pageNumber = 0;

    if (request.url == "/") {
        var counter = incrementNumberInFileSync("counter");

        pageNumber = counter % totalPages;
    }

    var filename = "content/" + pageNamePrefix + pageNumber + ".html";
    returnHtmlPage(filename, response);
}

// Increment the number in a file, and return the previous number.
// If the file doesn't exist, it will be created, 0 will be returned, and 1 will be written to the file.
// Using sync functions here to prevent concurrent access/modification of the counter file.
function incrementNumberInFileSync(filename) {
    var counter = 0;

    if (fs.existsSync(filename)) {
        counter = fs.readFileSync(filename).toString();
    }

    fs.writeFileSync(filename, parseInt(counter) + 1);

    return counter;
}

// Return the given html page to the client and end the response.
function returnHtmlPage(htmlFilePath, response) {

    fs.readFile(htmlFilePath, function(err, html) {
        if(err) {
            throw err;
        }

        response.writeHeader(200, {"Content-Type": "text/html"});
        response.write(html);
        response.end();
    });

}
