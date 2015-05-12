'use strict';

var clone = require('./clone-object')

module.exports = {
  init: function(lrload) {
    lrload.weaveAddons = function(ra) {
      var addons = clone(ra.addons)
      if (addons.PureRenderMixin) {
        var origShouldComponentUpdate = addons.PureRenderMixin.shouldComponentUpdate
        addons.PureRenderMixin.shouldComponentUpdate = function(nextProps, nextState) {
          if (lrload.__forceUpdating) {
            return true
          } else {
            return origShouldComponentUpdate.apply(this, Array.prototype.slice.call(arguments))
          }
        }
      }
      ra.addons = addons
      return ra
    }
  }
}
