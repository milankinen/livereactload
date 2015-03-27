
module.exports = function(port, React) {
  if (typeof window !== 'undefined') {
    (function() {
      'use strict';

      var lrload = window.__livereactload = (window.__livereactload || {})
      if (lrload.React) {
        // deps need to be initialized only once
        return
      }

      lrload.React = React;

      var WebSocket = require('ws')
      var ws = lrload.client = new WebSocket('ws://127.0.0.1:' + port)
      ws.onmessage = function() {
        var src = getScriptURL()
        loadScript(src)
      }

      var makeHot = require('react-hot-api')(function() {
        return typeof lrload.getRootInstances === 'function' ? lrload.getRootInstances() : []
      })

      var makeExportsHot = require('./make-exports-hot')
      lrload.makeExportsHot = function(filename, mod) {
        return makeExportsHot(mod, React, filename, makeHot)
      }


      function loadScript(src) {
        var numTries = 0
        tryLoad()

        function tryLoad() {
          var script = document.createElement('script')
          script.setAttribute('src', src);
          script.addEventListener('error', function() {
            if (numTries < 30) {
              numTries++
              setTimeout(tryLoad, 300)
            }
          }, true)
          document.getElementsByTagName('head')[0].appendChild(script)
        }
      }

      function getScriptURL() {
        try {
          throw new Error()
        }
        catch(e) {
          var stackLines = e.stack.split('\n')
          for(var i = 0; i < stackLines.length; i++){
            if (stackLines[i].match(/http[s]?:\/\//)) {
              return stackLines[i].match(/((http[s]?:\/\/.+\/)([^\/]+\.js)):/)[1]
            }
          }
          return ''
        }
      }
    })()
  }

}
