# PdfExport

Provides a Backend-API for converting SVG images to a pdf file using Google Chrome Headless.

Install it, start the server and open the docs page at [http://localhost:8080](http://localhost:8080) to find the API definition and examples.

Based on the idea in [https://github.com/Szpadel/chrome-headless-render-pdf](https://github.com/Szpadel/chrome-headless-render-pdf)

## Deployment on OpenShift
This project is designed to run out-of-the-box when deployed on OpenShift.
Steps to perform:

* Select your project
* Click "Add to Project"
* Tab "Browser Catalog" > "JavaScript"
* Image: Node.JS, latest
* Options:
    * Name: `<your-app-name>`
    * Git-Repository URL: `path-to/pdf-export-service`
    * Git-Reference: specific version, e.g. `v2.0.0`
    * Context-Dir: /
    * Build Pod: at least 500M memory (edit in the build configuration yaml after creating)
      ```yaml
        resources:
          limits:
            cpu: '1'
            memory: 1G
          requests:
            cpu: 500m
            memory: 500M
      ```
* Create
* Edit your builds Settings via "Builds" > "your-app-name" > "Actions" > "Edit"
* In section "ImageConfiguration" select an image with node and chrome.


## Local Installation
```
npm install
```

## Configuration
The service can be configured with the following environment variables:
* `PDF_EXPORT_CHROME_ARGS`: additional command line arguments to be passed to chrome
* `PDF_EXPORT_SKIP_INSTALL_CHROME`: skip automatic chrome installation. Note: chrome installation will also be skipped
   if the environment variable `CHROME_BIN` is set
* `PDFEXPORT_PORT`: Port the webserver will listen to. Defaults to `8080`


### Windows
On windows with Google Chrome already installed, do the following:

After cloning the repository, set the following environment variable:
```
set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
set PDF_EXPORT_SKIP_INSTALL_CHROME=1
```
Note: setting environment variables works differently in PowerShell:
```
$env:PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 1
$env:PDF_EXPORT_SKIP_INSTALL_CHROME = 1
```
Then run 
```
npm install --no-optional
```

## Start Server
```
npm run start
```

You can specify the following options:

* `--chrome-bin` Path to the chrome binary. Defaults to `server/chrome/opt/google/chrome/chrome`
* `--port` Port to run the server. Defaults to `8080`.

Alternatively, you can set the environment variables `PDFEXPORT_PORT` and `CHROME_BIN`.
To temporarily disable https errors, set the environment variable `PDFEXPORT_TEMPORARILY_IGNORE_HTTPS_ERRORS=1`.

For running the server on windows, use the following command:

```
npm run start -- --port=4205 --chrome-bin="C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome"
```

Open the docs page at [http://localhost:8080](http://localhost:8080) to find the API definition and examples.

## Troubleshooting

To test whether Chrome correctly converts a given html file to pdf, you can run chrome headless directly with
```
"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome" --no-sandbox --headless --enable-logging --print-to-pdf=C:\Users\myuser\Desktop\my-file.pdf C:\Users\myuser\Desktop\my-file.html
```
Some errors shown are not relevant and the pdf file is still generated.
