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
      var rawContent = "";
      try {
        var res = requestSync('GET', url);
        rawContent = res.getBody('utf8');
      } catch (e) {
        throw new Error('Could not fetch asciidoc for url: ' + url);
      }

      var attributes = "";
      if (options['document-attributes'] !== null) {
        attributes = requestSync('GET', options['document-attributes']).getBody('utf8');
      }
      if (options['plain'] === true) {
        content[k] = rawContent;
        content['document-attributes'] = attributes;
      } else {
        var doc = asciidoctor.convert(attributes + rawContent, options);
        content[k] = doc;
      }
    }
  }

  this.cacheable();
  return `module.exports = ${JSON.stringify(content)};`;
};
