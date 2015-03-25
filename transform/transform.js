'use strict';

var util   = require('util'),
    ttools = require('browserify-transform-tools')

module.exports = ttools.makeStringTransform('reactloadify', {}, transform)


function transform(content, opts, done) {
  //console.log('REACTLOAD', JSON.stringify(transformOptions, null, 2))
  var prefix = 'require("reactloadify/client/prefix")("' + opts.file + '");'
  var suffix = 'require("reactloadify/client/suffix")("' + opts.file + '", module);'

  var replace = "(function() { if (typeof window !== 'undefined') { if (!window.__reactt) { window.__reactt = require('react'); } return window.__reactt; } return require('react'); })()"
  var replacera = "(function() { if (typeof window !== 'undefined') { if (!window.__reactta) { window.__reactta = require('react/addons'); } return window.__reactta; } return require('react/addons'); })()"

  var reactlified = content.replace(/require\("react"\)/g, replace).replace(/require\("react\/addons"\)/g, replacera)
  done(null, util.format('\n%s\n%s\n%s\n', prefix, reactlified, suffix))
}
