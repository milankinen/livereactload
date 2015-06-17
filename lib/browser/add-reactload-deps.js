
module.exports = function(config, React, ReactMount) {
  if (typeof window !== 'undefined') {
    (function() {
      'use strict';

      var lrload = window.__livereactload = (window.__livereactload || {})
      if (lrload.React) {
        // deps need to be initialized only once
        return;
      }

      lrload.React = React;
      lrload.ReactMount = ReactMount;
      require('./deps/livereload-client').init(lrload, config);
      require('./deps/exports-weaver').init(lrload);
      require('./deps/addons-weaver').init(lrload);
    })()
  }
};
