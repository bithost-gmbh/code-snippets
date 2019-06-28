var fs =    require('fs-extra'),
  path =  require('path'),
  child_process = require('child_process'),
  minimist = require('minimist')
  bundle = require('./bundle');

var argv = minimist(process.argv.slice(2));

/**
 * Script for Running several utility scripts concerning swagger codegen.
 */


/**
 * Executes a shell command.
 * @param command {string} command to execute
 * @param [redirectOutput] {boolean} whether to redirect the console output to the current console. Defaults to true.
 *                                 Should be set to false if the return value should be captured via exec().toString()
 * @returns {Buffer | string}
 */
function execCmd(command, redirectOutput) {
  if (typeof redirectOutput === 'undefined') redirectOutput = true;
  var options = {};
  if (redirectOutput) {
    options.stdio = [0,1,2];
  }
  return child_process.execSync(command, options);
}

var command = argv['_'][0];

if (command === 'bundle') {
  // Bundles the .yml file, i.e. resolves all references and inserts the content of the referenced files.
  var swaggerFile = argv.f;
  var relativeDistPath = argv.d;
  if (typeof relativeDistPath === 'undefined') relativeDistPath = '../dist';
  if (!swaggerFile) {
    console.log('Please specify a .yml file with -f');
    return;
  }
  commandBundle(swaggerFile, relativeDistPath);

} else if (command === 'server') {
  // Bundles the .yml file, i.e. resolves all references and inserts the content of the referenced files.
  var swaggerFile = argv.f;
  var relativeDistPath = argv.d;
  if (typeof relativeDistPath === 'undefined') relativeDistPath = '../dist';
  if (!swaggerFile) {
    console.log('Please specify a .yml file with -f');
    return;
  }
  commandServer(swaggerFile, relativeDistPath);

} else {
  console.log('Please use one of the following commands: bundle, ')
}

/**
 * Bundles the .yml file, i.e. resolves all references and inserts the content of the referenced files.
 * @param swaggerFile Location of the .yml file
 * @param relativeDistPath Location of the dist directory in relation to the swaggerFile, defaults to '../dist'.
 * @return path to the generated dist file
 */
function commandBundle(swaggerFile, relativeDistPath) {
  var sourcePath = path.resolve(path.dirname(swaggerFile));
  var sourceFile = path.basename(swaggerFile);
  var distPath = path.resolve(sourcePath, relativeDistPath);
  var distFile = 'api-definition.bundle.yml';
  bundle.bundleApiDefinition(sourcePath, sourceFile, distPath, distFile);
  return path.resolve(distPath, distFile);
}

function commandServer(swaggerFile, relativeDistPath) {
  var sourcePath = path.resolve(path.dirname(swaggerFile));
  var distPath = path.resolve(sourcePath, relativeDistPath);
  var binPath = execCmd('npm bin', false).toString().trim().replace('\n', '');
  var swaggerEditorDistPath = path.resolve(binPath, '../swagger-editor-dist');
  var httpServerBin = path.resolve(binPath, '../http-server/bin/http-server');
  var editorPath = path.resolve(__dirname, 'editor');


  execCmd('node '+httpServerBin+' '+editorPath+' -p 5200 --cors -o -c-1 | ' +
     'node '+httpServerBin+' '+swaggerEditorDistPath+' -p 5201 | ' +
     'node '+httpServerBin+' '+distPath+' -p 5202 --cors -c-1')
}
