module.exports = function(file) {
  if (typeof window !== 'undefined') {
    (function() {
      'use strict';

      var reactloadify = window.__reactloadify = (window.__reactloadify || {})
      if (reactloadify.initialized) {
        // prefix must be added only once
        return
      }

      var WebSocket = require('ws')
      var ws = new WebSocket('ws://127.0.0.1:4455/changes')
      ws.onmessage = function() {
        console.log('update requested')
      }

      reactloadify.initialized = true
    })()
  }
}

