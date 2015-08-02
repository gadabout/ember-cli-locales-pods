var fs = require('fs-extra');
var path = require('path');
var mkdirp = require('mkdirp');
var util = require('util');
var camelCase = require('camel-case');
var merge = require('deepmerge');

module.exports = {
  podsDir: '',
  packName: '',
  lang: 'en',

  description: 'Generates a locales/[lang].js file',

  beforeInstall: function (options) {
    this.podsDir = this._locals(options).fileMap.__path__.replace('/' + options.entity.name, '');
    this.packName = options.project.pkg.name;
    this.lang = options.entity.options.lang || this.lang;

    if (!options.taskOptions.pod) {
      throw new Error('You must use pods with ember-cli-locales-pods. Run with --pod.');
    }
  },

  afterInstall: function (options) {
    //console.log(util.inspect(options.project, false, null));
    var entity = options.entity;

    addLocaleToImportFile(entity.name, {
      name: entity.name,
      root: options.project.root,
      podsDir: this.podsDir,
      lang: this.lang,
      packName: this.packName
    });
  }
};

function clean(stringIn, replaceWith) {
  replaceWith = replaceWith || '';
  return stringIn.replace(/\W/g, replaceWith);
}

function arrayToObject(object, inputArray, deepContent) {
  var newKey;

  if (inputArray.length > 0) {
    newKey = inputArray.shift();
    object[newKey] = arrayToObject({}, inputArray, deepContent);
    return object;
  } else {
    return deepContent;
  }
}

function addLocaleToImportFile (name, options) {
  var i;
  var replacementString = "___EMBER-CLI-LOCALES-PODS-REPLACE_WITH_CONTENT___";
  var hashString = JSON.stringify(arrayToObject({}, options.name.split('/'), replacementString));
  var importFile = options.podsDir ? options.podsDir.replace(/(\\|\/)$/, '') : 'pods',
    filePath = path.join(options.root, 'app/locales/' + importFile + '/'),
    importLocalePath = path.join(filePath, options.lang +'.js'),
    podsDir = options.podsDir ? importFile + '/' : '',
    varName = camelCase(clean(options.name, '-')),
    newLine = "import " + varName + " from \"" + options.packName + '/' + podsDir + options.name + "/locales/"+ options.lang +"\";\n",
    source,
    currentContents,
    contents;

  newLine += "LocalManager.pushLocale(" + hashString.replace('"'+replacementString+'"', varName) + ");\n";

  if (!fs.existsSync(filePath)) {
    mkdirp(filePath);
  }

  if (!fs.existsSync(importLocalePath)) {
      contents = "import LocalManager from 'ember-cli-locales-pods/utils/local_manager';\n\n";
      contents += newLine;
      contents += "\nexport default LocalManager.getLocales();\n";
      fs.writeFileSync(importLocalePath, contents, 'utf8');
  } else {
      currentContents = fs.readFileSync(importLocalePath, 'utf8');
      lines = currentContents.split("\n");
      lastLines = lines.splice(-2, 2).join("\n");
      source = lines.join("\n");
      source += "\n";
      source += newLine;
      source += "\n";
      source += lastLines;
      fs.writeFileSync(importLocalePath, source);
  }

  console.log("Translation Path: " + options.name.replace(/\//g, '.'));

}
