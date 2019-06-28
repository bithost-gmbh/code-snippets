var path = require('path'),
    tmp = require('tmp'),
    fs = require('fs'),
    contentDisposition = require('content-disposition'),
    puppeteer = require('puppeteer');
var argv = require('optimist').argv;

var exports = module.exports = {};


/** Path to the chrome installation */
var CHROME_PATH = path.join(__dirname, '../chrome');

/** Path to the chrome binary */
var CHROME_BIN = argv['chrome-bin'] || process.env.CHROME_BIN || path.join(CHROME_PATH, 'opt/google/chrome/chrome');

/** Options to be passed to google chrome */
var CHROME_OPTIONS = [
    '--no-sandbox',
    '--headless',
    '--disable-gpu',
    '--disable-setuid-sandbox',
];
if (process.env.PDF_EXPORT_CHROME_ARGS) {
    CHROME_OPTIONS.push(process.env.PDF_EXPORT_CHROME_ARGS);
}

/** List of paths to be added to LD_LIBRARY_PATH */
var LD_LIBRARY_PATHS = [];
if (!process.env.CHROME_BIN) {
    LD_LIBRARY_PATHS.push(
        path.join(CHROME_PATH, 'usr/lib64'),
        path.join(CHROME_PATH, 'lib64')
    )
}


/**
 * Handles a POST request to convert svg images to pdf
 * @param req
 * @param res
 * @param next
 */
exports.post = function(req, res, next) {
    if (!req.body || !req.body.svgFiles || !req.body.svgFiles.length) {
        res.status(500).send('Error: missing svg files');
        return;
    }

    // copy the environment variables, otherwise we will add to LD_LIBRARY_PATH on every request,
    // leading to an error E2BIG when starting chrome, since the command line args (environment variables) grow exponentially in size
    var env_copy = Object.assign({}, process.env);
    // set the LD_LIBRARY_PATH environment variable to enable chrome to find the shared libraries needed
    if (env_copy.LD_LIBRARY_PATH) {
        LD_LIBRARY_PATHS.push(env_copy.LD_LIBRARY_PATH);
    }
    env_copy.LD_LIBRARY_PATH = LD_LIBRARY_PATHS.join(':');

    // create temp html file with svg data
    var tmpobj = tmp.fileSync({postfix: '.html'});
    var html = getSvgPagesHtml(req.body.svgFiles, req.body.baseUrl);
    fs.writeFileSync(tmpobj.fd, html);


    var downloadFilename = req.body.filename || 'Export.pdf';

    if (req.body.returnHTML) {
        // send html file as response
        downloadFilename += '.html';
        res.status(200)
            .header('Content-type', 'application/force-download; charset=utf-8')
            .header('Content-type', 'text/html; charset=utf-8')
            .header('Content-Disposition', contentDisposition(downloadFilename))
            .send(html);
    } else {
        (async () => {
            try {
                // launch Chrome
                const browser = await puppeteer.launch({
                    executablePath: CHROME_BIN,
                    args: CHROME_OPTIONS,
                    env: env_copy,
                    ignoreHTTPSErrors: process.env.PDFEXPORT_TEMPORARILY_IGNORE_HTTPS_ERRORS === '1',
                });
                const page = await browser.newPage();

                // go to html page containing the svg files
                await page.goto('file://'+tmpobj.name);

                // get the pdf buffer
                const pdf = await page.pdf({
                    printBackground: true,
                    landscape: req.body.orientation === 'landscape',
                    format: 'A4',
                    displayHeaderFooter: !!req.body.displayHeaderFooter,
                    headerTemplate: req.body.headerTemplate ? req.body.headerTemplate + getEmbeddedFontStyles() : '',
                    footerTemplate: req.body.footerTemplate ? req.body.footerTemplate + getEmbeddedFontStyles() : '',
                    margin: req.body.margin ? req.body.margin : {}
                });

                // send pdf file as response
                res.status(200)
                    .header('Content-type', 'application/force-download; charset=utf-8')
                    .header('Content-type', 'application/octet-stream; charset=utf-8')
                    .header('Content-Disposition', contentDisposition(downloadFilename))
                    .send(pdf);

                // close browser and remove temp file
                await browser.close();
                fs.unlink(tmpobj.name, () => {});
            } catch (e) {
                console.log('Error running chrome!', e);
                res.status(500).send('Error: could not run chrome pdf export:\n' + e.toString());
            }
        })();
    }
}

/**
 * Returns html containing each svg file in a separate "page" div in order to print the svg files given on separate pages.
 * @param {string[]} svgFiles array of svg strings
 * @param {string} baseUrl
 * @returns {string} html
 */
function getSvgPagesHtml(svgFiles, baseUrl) {
    var pages = '';
    svgFiles.forEach((svgFile) => {
        pages += '<div class="pdfexport-page">' + svgFile + '</div>';
    });
    var baseUrlTag = '';
    if (baseUrl) {
        baseUrlTag = `<base href="${maskHTML(baseUrl)}">`;
    }

    var html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="content-type" content="text/html;charset=UTF-8" />
        <title>Paginated HTML</title>
        <style type="text/css">
          html, body {
              margin: 0;
              padding: 0;
          }
          div.pdfexport-page
          {
            page-break-after: always;
            page-break-inside: avoid;
            -webkit-region-break-inside: avoid;
            position: relative;
          }
        </style>
        ${baseUrlTag}
      </head>
      <body>
        ${pages}
      </body>
    </html>
    `;
    return html;
}

/**
 * Convert all applicable characters to HTML entities.
 * Converts: '"&<>
 * @param {string} HTML
 * @returns {string}
 */
function maskHTML(HTML)
{
    HTML = HTML +'';
    return HTML.replace( /&/g,"&amp;").replace( /"/g,"&quot;").replace( /'/g,"&#039;").replace( /</g,"&lt;").replace( />/g,"&gt;");
}
