var fs = require('fs-extra');
var path = require('path');
var mkdirp = require('mkdirp');
var util = require('util');
var camelCase = require('camel-case');
var merge = require('deepmerge');

module.exports = {
  podsDir: '',
  importFile: '',
  filePath: '',
  includingAppName: '',
  lang: 'en',

  description: 'Generates a locales/[lang].js file',

  beforeInstall: function (options) {
    if (!options.taskOptions.pod) {
      throw new Error('You must use pods with ember-cli-locales-pods. Run with --pod.');
    }

    this.podsDir = false; //this._locals(options).fileMap.__path__.replace('/' + options.entity.name, '');
    this.importFile = this.podsDir ? this.podsDir.replace(/(\\|\/)$/, '') : 'pods';
    this.includingAppName = options.project.pkg.name;
    this.filePath = path.join(options.project.root, 'app/locales/' + this.importFile + '/');
    this.lang = options.entity.options.lang || this.lang;
  },

  afterInstall: function (options) {
    this.addLocaleToImportFile(options.entity.name);
  },

  createImportString: function(name) {
    var replacementString = "___EMBER-CLI-LOCALES-PODS-REPLACE_WITH_CONTENT___";
    var arrayToObject = function(object, inputArray) {
      var newKey;

      if (inputArray.length > 0) {
        newKey = inputArray.shift();
        object[newKey] = arrayToObject({}, inputArray);
        return object;
      } else {
        return replacementString;
      }
    };
    var hashString = JSON.stringify(arrayToObject({}, name.split('/'), replacementString));
    var varName = camelCase(name.replace(/\W/g, '-'));
    var podsDir = this.podsDir ? this.importFile + '/' : '';
    var outputString = "import " + varName + " from '" + this.includingAppName + '/pods/' + podsDir + name + "/locales/"+ this.lang +"';\n";
        outputString += "LocalManager.pushLocale(" + hashString.replace('"'+replacementString+'"', varName).replace(/_/g, "-") + ");\n";

    return outputString;
  },

  createNewImportFileString: function(newContent) {
    var contents = "import LocalManager from 'ember-cli-locales-pods/utils/local_manager';\n\n";

    contents += newContent;
    contents += "\nexport default LocalManager.getLocales();\n";
    return contents;
  },

  addLocaleToImportFile: function(name, options) {
    var importLocalePath = path.join(this.filePath, this.lang +'.js');
    var newLine = this.createImportString(name);
    var source,
      currentContents;

    if (!fs.existsSync(this.filePath)) {
      mkdirp(this.filePath);
    }

    if (!fs.existsSync(importLocalePath)) {
      fs.writeFileSync(importLocalePath, this.createNewImportFileString(newLine), 'utf8');
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

    console.log("Translation Path: " + name.replace(/\//g, '.'));
  }

};
