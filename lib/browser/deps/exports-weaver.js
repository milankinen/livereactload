

module.exports = {
  init: function(lrload) {
    var reactHotApi    = require('react-hot-api'),
        makeExportsHot = require('./make-exports-hot')

    var makeHot = reactHotApi(function() { return [] })

    lrload.makeExportsHot = function(filename, mod) {
      return makeExportsHot(mod, lrload.React, filename, makeHot)
    }
  }
}
