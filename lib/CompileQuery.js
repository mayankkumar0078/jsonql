var JsonqlCompiler, LookupSchemaMap, args, compiler, err, error, error1, error2, error3, fs, minimist, query, queryStr, respondError, result, schemaJson, schemaMap, schemaPath, schemaStr, yaml;

minimist = require('minimist');

yaml = require('js-yaml');

fs = require('fs');

LookupSchemaMap = require('./LookupSchemaMap');

JsonqlCompiler = require('./JsonqlCompiler');

respondError = function(message) {
  return console.log(JSON.stringify({
    error: message
  }));
};

args = require('minimist')(process.argv.slice(2));

schemaPath = args._[0];

queryStr = args._[1];

if (!schemaPath) {
  return respondError("Compile process was called without schema document file");
}

if (!queryStr) {
  return respondError("Compile process was called without JSON input");
}

try {
  schemaStr = fs.readFileSync(schemaPath, 'utf8');
} catch (error) {
  err = error;
  return respondError("Cannot load file " + schemaPath + ": " + err);
}

try {
  if (schemaPath.match(/.yaml$/)) {
    schemaJson = yaml.safeLoad(schemaStr);
  } else {
    schemaJson = JSON.parse(schemaStr);
  }
} catch (error1) {
  err = error1;
  return respondError("Cannot parse file " + schemaPath + ": " + err);
}

try {
  query = JSON.parse(queryStr);
} catch (error2) {
  err = error2;
  return respondError("Cannot parse query: " + err);
}

schemaMap = new LookupSchemaMap(schemaJson);

compiler = new JsonqlCompiler(schemaMap);

try {
  result = compiler.compileQuery(query);
  console.log(JSON.stringify({
    query: {
      sql: result.toInline(),
      params: []
    }
  }));
} catch (error3) {
  err = error3;
  return respondError("Cannot compile query: " + err);
}
