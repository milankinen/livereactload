'use strict';

var util     = require('util'),
    ttools   = require('browserify-transform-tools'),
    defaults = require('../defaults.json'),
    pjson    = require('../../package.json');

module.exports = function(bundle, opts) {
  bundle.transform(ttools.makeRequireTransform('livereactload-cacheReact', {evaluateArguments: true}, cacheReact))
  bundle.transform(ttools.makeStringTransform('livereactload-injectLiveReloading', injectLiveReloading))
}


function injectLiveReloading(content, opts, done) {
  var port                  = opts.config && opts.config.port ? opts.config.port : defaults.reloadPort,
      addReloadDependencies = ';require("' + pjson.name + '/lib/browser/add-reactload-deps")(' + port + ', require("react"));',
      reloadifyExports      = ';require("' + pjson.name + '/lib/browser/reloadify-exports")("' + opts.file + '", module);';

  done(null, util.format("%s%s\n%s", addReloadDependencies, content, reloadifyExports));
}

function cacheReact(args, opts, done) {
  if (args[0] === 'react') {
    var reactReplacement =
      '(function() { ' +
      '  return (typeof(window) !== "undefined" && window.__livereactload) ? ' +
      '         window.__livereactload.React : require("react"); ' +
      '})()'
    done(null, reactReplacement.replace(/ /g, ''))
  } else if (args[0] === 'react/addons') {
    var reactAddonsReplacement =
      '(function() { ' +
      '  if (typeof(window) !== "undefined" && window.__livereactload) {' +
      '    if (!window.__livereactload.addons) window.__livereactload.addons = require("react/addons");' +
      '    return (window.__livereactload.addons);' +
      '  } else {' +
      '     require("react/addons");' +
      '  }' +
      '})()'
    done(null, reactAddonsReplacement.replace(/ /g, ''));
  } else {
    done();
  }
}
