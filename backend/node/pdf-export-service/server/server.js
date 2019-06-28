var express = require('express');
var compression = require('compression');
var morgan = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var svg2pdf = require('./api/svg2pdf');
var argv = require('optimist').argv;


/** Server port to listen on */
var SERVER_PORT = argv.port || process.env.PDFEXPORT_PORT || 8080;

/** Public path for assets the web server will be delivering.*/
var PUBLIC_PATH = path.join(__dirname, 'public');

// initialize express.js app
var app = express();

// Request Logging
app.use(morgan('combined'));

// Security Settings
// see http://expressjs.com/de/advanced/best-practice-security.html
app.disable('x-powered-by');

// Performance Settings
// see http://expressjs.com/de/advanced/best-practice-performance.html
app.use(compression());

// support json-encoded bodies
app.use(bodyParser.json({limit: '50mb'}));

// allow CORS, since this is a public api
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// convert svg to pdf
app.post('/api/svg2pdf', svg2pdf.post);

// serve default docs
app.get('/*', function(req, res, next) {
    res.status(200).sendFile(path.join(PUBLIC_PATH, '/docs.html'));
});

app.listen(SERVER_PORT, function () {
    console.log('HTTP Server listening on port '+SERVER_PORT);
});

module.exports = app;
