'use strict';

var transformTools = require('browserify-transform-tools')

module.exports = transformTools.makeStringTransform('reactloadify', {}, transform)


function transform(content, transformOptions, done) {
  console.log('REACTLOAD', JSON.stringify(transformOptions, null, 2))
  done(null, content)
}
