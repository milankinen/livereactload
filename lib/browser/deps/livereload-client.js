
var WebSocket = require('ws')

module.exports = {
  init: function(lrload, port) {
    var ws = lrload.client = new WebSocket('ws://127.0.0.1:' + port)
    ws.onmessage = function() {
      var src = getScriptURL()
      loadScript(src, lrload)
    }
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


function loadScript(src, lrload) {
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
    script.addEventListener('load', function() {
      forceRenderReactApp(lrload)
    })
    document.getElementsByTagName('head')[0].appendChild(script)
  }
}


function forceRenderReactApp(lrload) {
  if (!(typeof window.onload === 'function' && window.onload.__is_livereactload)) {
    var rootInstances = lrload.ReactMount._instancesByReactRootID || lrload.ReactMount._instancesByContainerID || {}
    var rootIds = Object.keys(rootInstances)

    for (var i = 0; i < rootIds.length; i++) {
      var instance = rootInstances[rootIds[i]]
      lrload.React.Component.prototype.forceUpdate.call(instance._instance)
    }
  }
}
