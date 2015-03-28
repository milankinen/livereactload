'use strict';

var util     = require('util'),
    through  = require('through2'),
    defaults = require('../defaults.json'),
    pjson    = require('../../package.json');


module.exports = function(file, opts) {
  var port    = opts.config && opts.config.port ? opts.config.port : defaults.reloadPort,
      content = ''

  return through(
    function(dat, enc, next) {
      content += dat
      next()
    },
    function(next) {
      this.push(injectLiveReloading(injectReactCaching(content), port, file))
      next()
    }
  )
}


function injectLiveReloading(content, port, file) {
  var addReloadDependencies = ';require("' + pjson.name + '/lib/browser/add-reactload-deps")(' + port + ', require("react"));',
      reloadifyExports      = ';require("' + pjson.name + '/lib/browser/reloadify-exports")("' + file + '", module);';

  return util.format("%s%s\n%s", addReloadDependencies, content, reloadifyExports)
}

function injectReactCaching(content) {
  var reactReplacement = ''
    + '(function() { '
    + '  return (typeof(window) !== "undefined" && window.__livereactload) ? '
    + '         window.__livereactload.React : req("react"); '
    + '})();'

  var reactAddonsReplacement = ''
    + '(function() { '
    + '  if (typeof(window) !== "undefined" && window.__livereactload) {'
    + '    if (!window.__livereactload.addons) window.__livereactload.addons = req("react/addons");'
    + '    return (window.__livereactload.addons);'
    + '  } else {'
    + '     req("react/addons");'
    + '  }'
    + '})();'

  var wrapper = ''
    + ';require = (function(req) {'
    + '  return (function(name) {'
    + '    if (name === "react")        return ' + reactReplacement
    + '    if (name === "react/addons") return ' + reactAddonsReplacement
    + '    return (req(name));'
    + '  })'
    + '})(require);'

  return wrapper.replace(/ /g, '') + content
}
