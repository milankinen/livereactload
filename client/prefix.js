var loaded = false
module.exports = function(file) {
  if (typeof window !== 'undefined') {
    (function() {
      'use strict';

      var reactloadify = window.__reactloadify = (window.__reactloadify || {})
      if (reactloadify.makeHot) {
        // prefix must be added only once
        return
      }


      var WebSocket = require('ws')
      var ws = new WebSocket('ws://127.0.0.1:4455/changes')
      ws.onmessage = function() {
        var src = getScriptURL()
        console.log('update requested', src)
        loadScript(src)
      }

      reactloadify.makeHot = require('react-hot-api')(function() { return  [] })

      function loadScript(src) {
        var numTries = 0
        tryLoad()

        function tryLoad() {
          var script = document.createElement('script')
          script.setAttribute('src', src);
          script.addEventListener('error', function() {
            console.log('error')
            if (numTries < 10) {
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

