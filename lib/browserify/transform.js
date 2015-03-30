'use strict';

var util     = require('util'),
    path     = require('path'),
    through  = require('through2'),
    defaults = require('../defaults.json'),
    pjson    = require('../../package.json');


module.exports = function(file, opts) {
  var port    = opts.config && opts.config.port ? opts.config.port : defaults.reloadPort,
      content = ''

  var isLiveReactloadModule = path.resolve(file).indexOf(path.resolve(__dirname, '..')) === 0
  var isReactModule         = file.indexOf('node_modules/react/') !== -1
  var isBrowserifyModule    = file.indexOf('node_modules/browserify/') !== -1

  return through(
    function(dat, enc, next) {
      content += dat
      next()
    },
    function(next) {
      var meta = {isLiveReactloadModule: isLiveReactloadModule, isReactModule: isReactModule, isBrowserifyModule: isBrowserifyModule}
      this.push(injectLiveReloading(injectReactCaching(content, meta), port, file, meta))
      next()
    }
  )
}


function injectLiveReloading(content, port, file, meta) {
  var addReloadDependencies = ';require("' + pjson.name + '/lib/browser/add-reactload-deps")(' + port + ', require("react"), require("react/lib/ReactMount"));',
      reloadifyExports      = ';require("' + pjson.name + '/lib/browser/reloadify-exports")("' + file + '", module);';

  var canBeInjected = !meta.isLiveReactloadModule && !meta.isReactModule && !meta.isBrowserifyModule

  return util.format("%s%s\n%s",
    canBeInjected ? addReloadDependencies : '',
    content,
    canBeInjected ? reloadifyExports : ''
  )
}

function injectReactCaching(content, meta) {
  var reactReplacement = ''
    + '(function() {'
    + '  window.__livereactload = window.__livereactload || {};'
    + '  window.__livereactload.React = window.__livereactload.React || req("react");'
    + '  return (window.__livereactload.React);'
    + '})();'

  var reactMountReplacement = ''
    + '(function() {'
    + '  window.__livereactload = window.__livereactload || {};'
    + '  window.__livereactload.ReactMount = window.__livereactload.ReactMount || req("react/lib/ReactMount");'
    + '  return (window.__livereactload.ReactMount);'
    + '})();'

  var reactOtherReplacement = ''
    + '(function(name) { '
    + '  window.__livereactload = window.__livereactload || {};'
    + '  window.__livereactload["__reactExport_"+name] = window.__livereactload["__reactExport_"+name] || req(name);'
    + '  return (window.__livereactload["__reactExport_"+name]);'
    + '})(name);'

  var wrapper = ''
    + ';require = (function(req) {'
    + '  if (typeof(window) !== "undefined") {'   // Browser
    + '    return (function(name) {'
    + '      if (name === "react")                     return ' + reactReplacement
    + '      if (name === "react/lib/ReactMount")      return ' + reactMountReplacement
    + '      if (name && name.indexOf("react/") === 0) return ' + reactOtherReplacement
    + '      return (req(name));'
    + '    })'
    + '  } else { return (req(name)); }'          // NodeJS
    + '})(require);'

  var canBeInjected = !meta.isLiveReactloadModule
  return canBeInjected ? wrapper.replace(/ /g, '') + content : content
}
