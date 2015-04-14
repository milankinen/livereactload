
var warn   = require('../safe-warn'),
    weaver = require('./exports-weaver');


module.exports = function forceUpdateApplication(lrload) {
  executeReloadCallbacks(lrload)
  forceUpdateRootInstances(lrload)
  weaver.init(lrload)
}

function executeReloadCallbacks(lrload) {
  if (lrload.onReloadCallbacks) {
    var callbacks = lrload.onReloadCallbacks
    lrload.onReloadCallbacks = []
    for (var i = 0 ; i < callbacks.length ; i++) {
      try {
        callbacks[i]()
      } catch(e) {
        warn(JSON.stringify({
          msg: 'Caught an exception while running onReload-callback',
          callback: callbacks[i],
          exception: e
        }))
      }
    }
  }
}

function forceUpdateRootInstances(lrload) {
  var rootInstances = lrload.ReactMount._instancesByReactRootID || lrload.ReactMount._instancesByContainerID || {};
  var rootIds = Object.keys(rootInstances);

  for (var i = 0; i < rootIds.length; i++) {
    var instance = rootInstances[rootIds[i]];
    forceUpdateInstance(instance, lrload);
  }
}

function forceUpdateInstance(instance, lrload) {
  if (lrload.React.Component) {
    // React 0.13.x
    lrload.React.Component.prototype.forceUpdate.call(instance._instance);
  } else if (instance.forceUpdate) {
    // React 0.12.x
    instance.forceUpdate();
  } else {
    // non supported version
    warn('LiveReactload does not know how to force update React version "' + lrload.React.version + '". ' +
    'Please raise an issue at https://github.com/milankinen/livereactload/issues');
  }
}
