'use strict';

var util   = require('util'),
    ttools = require('browserify-transform-tools')

module.exports = ttools.makeStringTransform('reactloadify', {}, transform)


function transform(content, opts, done) {
  //console.log('REACTLOAD', JSON.stringify(transformOptions, null, 2))
  var prefix = 'require("reactloadify/client/prefix")("' + opts.file + '");'
  var suffix = 'require("reactloadify/client/suffix")("' + opts.file + '", module.exports);'
  done(null, util.format('\n%s\n%s\n%s\n', prefix, content, suffix))
}
