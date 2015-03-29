
var warn = require('../safe-warn');

module.exports = function forceUpdateApplication(lrload) {
  if (!(typeof window.onload === 'function' && window.onload.__is_livereactload)) {
    var rootInstances = lrload.ReactMount._instancesByReactRootID || lrload.ReactMount._instancesByContainerID || {};
    var rootIds = Object.keys(rootInstances);

    for (var i = 0; i < rootIds.length; i++) {
      var instance = rootInstances[rootIds[i]];
      forceUpdateInstance(instance, lrload);
    }
  }
};


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
