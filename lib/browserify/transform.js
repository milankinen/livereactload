'use strict';

var util     = require('util'),
    path     = require('path'),
    through  = require('through2'),
    extend   = require('deep-extend'),
    defaults = require('../defaults.json'),
    pjson    = require('../../package.json');


module.exports = function(file, opts) {
  var config  = extend({}, defaults, getConfig(opts)),
      content = ''

  var isLiveReactloadModule = path.resolve(file).indexOf(path.resolve(__dirname, '..', '..')) === 0
  var isReactModule         = file.indexOf(getModulePath('react')) !== -1
  var isBrowserifyModule    = file.indexOf(getModulePath('browserify')) !== -1

  return through(
    function(dat, enc, next) {
      content += dat
      next()
    },
    function(next) {
      var meta = {isLiveReactloadModule: isLiveReactloadModule, isReactModule: isReactModule, isBrowserifyModule: isBrowserifyModule}
      if (path.extname(file) !== '.json') {
        this.push(injectLiveReloading(injectReactCaching(content, meta, file), config, file, meta))
      } else {
        this.push(content)
      }
      next()
    }
  )
}

function getConfig(opts) {
  var keys = ['reloadPort', 'notifyPort', 'preventCache', 'hostname']
  var conf = {}
  keys.forEach(function(key) {
    if (opts && typeof opts[key] !== 'undefined') {
      conf[key] = opts[key]
    }
  })
  return conf
}

function getModulePath(mod) {
  return path.sep + path.join('node_modules', mod) + path.sep
}

function injectLiveReloading(content, config, file, meta) {
  var addReloadDependencies = ';require("' + pjson.name + '/lib/browser/add-reactload-deps")(' + JSON.stringify(config) + ', require("react"), require("react/lib/ReactMount"));',
      reloadifyExports      = ';require("' + pjson.name + '/lib/browser/reloadify-exports")(' + JSON.stringify(file) + ', module);';

  var canBeInjected = !meta.isLiveReactloadModule && !meta.isReactModule && !meta.isBrowserifyModule

  return util.format("%s%s\n%s",
    canBeInjected ? addReloadDependencies : '',
    content,
    canBeInjected ? reloadifyExports : ''
  )
}

function injectReactCaching(content, meta, file) {
  var reactReplacement = ''
    + '(function() {'
    + '  window.__livereactload = window.__livereactload || {};'
    + '  window.__livereactload.React = window.__livereactload.React || req("react");'
    + '  return (window.__livereactload.reactWithHotClasses(window.__livereactload, ' + JSON.stringify(file) + '));'
    + '})();'

  var reactAddonsReplacement = ''
    + '(function() {'
    + '  window.__livereactload = window.__livereactload || {};'
    + '  window.__livereactload.ReactAddons = window.__livereactload.ReactAddons || window.__livereactload.weaveAddons(req("react/addons"));'
    + '  return (window.__livereactload.ReactAddons);'
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
    + '      if (name === "react/addons")              return ' + reactAddonsReplacement
    + '      if (name === "react/lib/ReactMount")      return ' + reactMountReplacement
    + '      if (name && name.indexOf("react/") === 0) return ' + reactOtherReplacement
    + '      return (req(name));'
    + '    })'
    + '  } else { return (req(name)); }'          // NodeJS
    + '})(require);'

  var canBeInjected = !meta.isLiveReactloadModule
  return canBeInjected ? wrapper.replace(/ /g, '') + content : content
}
