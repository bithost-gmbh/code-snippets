var fs = require('fs-extra'),
    path =  require('path'),
    request = require('request');

var argv = require('optimist').argv;

/**
 * Script to update the mock data.
 * Will read the current mock-data.json and for each key found (url) will load the data and write it to the file.
 */

// --file=mock-data.json
if (!argv['file']) {
    console.log('please provide a mock-data file parameter!');
    process.exit(1);
}

var mockDataPath = path.resolve(__dirname, '../../../../../test/resources/' + argv['file']);
var mockDataCopyPath = path.resolve(__dirname, '../../../../../../../bla/src/app/testing/mock-data/' + argv['file']);

var mockData = require(mockDataPath);
var mockDataLines = fs.readFileSync(mockDataPath, {encoding: 'utf8'}).split('\n');
var mockDataStrings = {};
var mockDataUrls = Object.keys(mockData).sort();
var mockDataResetUrls = require(path.resolve(__dirname, 'reset-mock-data.js')).resetMockDataUrls;

var updatedData = {};
var requestsRunning = 0;

// parse each line as a string
mockDataLines.forEach(function(line){
   line = line.trim();
   if (line.length && line.indexOf('"') === 0) {
       var urlEndPosition = line.indexOf('"', 1);
       if (urlEndPosition > -1) {
            var url = line.substring(1, urlEndPosition);
            var colonIndex = line.indexOf(':', urlEndPosition);
            var lastCommaIndex = line.lastIndexOf(',');
            if (colonIndex > -1 && lastCommaIndex > -1) {
                mockDataStrings[url] = line.substring(colonIndex + 1, lastCommaIndex).trim();
            }
       }
   }
});

mockDataUrls.forEach(function(url){
   if (!url || url === '__dummy__') {
       return;
   }
   // either --force-update=true or the value must be null or the url in the list of reset urls to update the data
   if (!(argv['force-update'] || mockData[url] === null || mockDataResetUrls.indexOf(url) > -1)) {
       updatedData[url] = mockDataStrings[url];
       return;
   }

   ++requestsRunning;
   console.log('updating ' + url);
   request.get('http://localhost:8080/v1' + url, function(error, response, body) {
       --requestsRunning;
       if (error) {
           console.warn(error);
           return;
       }
       updatedData[url] = body;
       console.log('updated ' + url);
       if (requestsRunning === 0) {
           writeMockData();
       }
   });
});


function writeMockData() {
    console.log('');
    console.log('writing data to ' + mockDataPath);
    fs.writeFileSync(mockDataPath, '{\n');
    mockDataUrls.forEach(function(url) {
        if (url === '__dummy__') {
            return;
        }
        fs.appendFileSync(mockDataPath, '  "' + url + '": ' + updatedData[url] + ',\n');
    });
    fs.appendFileSync(mockDataPath, '  "__dummy__": null\n');
    fs.appendFileSync(mockDataPath, '}');

    fs.copyFileSync(mockDataPath, mockDataCopyPath);

    console.log('\n\ndone!');
}
