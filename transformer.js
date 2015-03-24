'use strict';

var transformTools = require('browserify-transform-tools')

module.exports = transformTools.makeStringTransform('reactloadify', {}, transform)


function transform(content, transformOptions, done) {
  done(null, content)
}
