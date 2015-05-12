
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
      callbacks[i]()
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
    lrload.__forceUpdating = true;
    lrload.React.Component.prototype.forceUpdate.call(instance._instance, function() {
      lrload.__forceUpdating = false;
    });
  } else if (instance.forceUpdate) {
    // React 0.12.x
    lrload.__forceUpdating = true;
    console.log('force update start')
    instance.forceUpdate(function() {
      console.log('force update end')
      lrload.__forceUpdating = false;
    });
  } else {
    // non supported version
    warn('LiveReactload does not know how to force update React version "' + lrload.React.version + '". ' +
         'Please raise an issue at https://github.com/milankinen/livereactload/issues');
  }
}
