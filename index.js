"use strict";

var loaderUtils = require("loader-utils");
var assign = require("object-assign");
var asciidoctor = require('asciidoctor.js')();
var requestSync = require("sync-request");

// default option
var defaultOptions = {
  safe: 'unsafe',
  sourceHighlighter: 'highlightjs'
};

module.exports = function (content) {

  // merge params and default config
  var query = loaderUtils.parseQuery(this.query);
  var options = assign({}, defaultOptions, query, this.options["asciidoctorLoader"]);
  
  try {
    content = JSON.parse(content);
  } catch (e) {
    throw new Error('The .index file is not a valid json. ' + e.toString());
  }

  for (var k in content) {
    if (content.hasOwnProperty(k)) {
      let url = content[k];
      var res = requestSync('GET', url);
      var rawContent = res.getBody('utf8');

      var doc = asciidoctor.convert(rawContent, options);
      content[k] = doc;
    }
  }

  this.cacheable();
  return `module.exports = ${JSON.stringify(content)};`;
};
