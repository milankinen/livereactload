
var warn = require('./safe-warn');


module.exports = function(file, mod) {
  if (typeof window !== 'undefined') {
    (function() {
      'use strict';
      var lrload = (window.__livereactload || {});
      if (lrload.makeExportsHot) {
        lrload.makeExportsHot(file, mod);
      } else {
        warn('Something went wrong with LiveReactload initialization. Reloading is not enabled.');
      }
    })();
  }
}


