fs = require('fs-extra');
path = require('path');

var exports = module.exports = {};

/**
 * Copies api-definition.yml to api-definition.bundle.yml and resolves all local $ref: './something' paths
 *
 * @param apiPath path to the folder containing apiDefinitionFile and related files
 * @param apiDefinitionFile name of the api definition file
 * @param apiDistPath path to the folder for storing the bundle file
 * @param apiDefinitionBundleFile name of the bundle file
 */
function bundleApiDefinition(apiPath, apiDefinitionFile, apiDistPath, apiDefinitionBundleFile) {

  fs.readFile(path.resolve(__dirname, apiPath+'/'+apiDefinitionFile), 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    console.log("##### Bundling "+apiDefinitionFile+" into "+apiDefinitionBundleFile+" #####\n");

    var lines = data.split("\n");
    var refString = '$ref:';
    var bundleStr = '';
    bundleStr += "#\r\n# Automatically compiled file. Changes will be overwritten!\r\n# Original file: "+apiDefinitionFile+"\r\n#\r\n\r\n";

    // loop through each line
    lines.forEach(function(line) {

      // if the line starts with $ref:
      if(line.trim().indexOf(refString) === 0) {

        console.log("reference found");
        // number of whitespaces for indentation
        var whitespaces = line.indexOf(refString);
        // parse the reference path
        var refPath = line.substring(whitespaces+refString.length).replace(/"/g, "").replace(/'/g, "").trim();
        console.log(refPath);

        // if the path starts with a relative path, resolve the reference file content
        if (refPath.indexOf('./') === 0 || refPath.indexOf('/') === 0) {
          console.log("reference is relative");

          // trim . at the beginning of the path
          if (refPath.indexOf('.') === 0) {
            refPath = refPath.substring('.'.length);
          }

          line = "";
          var absolutePath = path.resolve(__dirname, apiPath+refPath);
          var contents = fs.readFileSync(absolutePath).toString();
          // add each refLine to line with prepended whitespaces
          contents.split("\n").forEach(function(refLine) {
            line += " ".repeat(whitespaces)+refLine+"\n";
          });
        }

        console.log("");
      }

      // merge all lines to final output
      bundleStr += line + "\n";
    });

    fs.ensureDirSync(path.resolve(__dirname, apiDistPath));
    fs.writeFile(path.resolve(__dirname, apiDistPath+'/'+apiDefinitionBundleFile), bundleStr, function(err) {
      if (err) throw err;
      console.log("##### Bundling done #####\n\n");
    });
  });
}
exports.bundleApiDefinition = bundleApiDefinition;
