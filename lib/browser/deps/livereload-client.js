
var WebSocket   = require('ws'),
    forceUpdate = require('./force-update-app')

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

function cacheBust(uri) {
  var idx = uri.indexOf('?')
  if (idx === -1)
    uri += '?'
  else if (idx !== uri.length-1)
    uri += '&'
  return uri + '__livereactloadPreventCache=' + Date.now()
}

function loadScript(src, lrload) {
  var numTries = 0
  tryLoad()

  function tryLoad() {
    var script = document.createElement('script')
    script.setAttribute('src', cacheBust(src));
    script.addEventListener('error', function() {
      if (numTries < 30) {
        numTries++
        setTimeout(tryLoad, 300)
      }
    }, true)
    script.addEventListener('load', function() {
      forceUpdate(lrload)
    })
    document.getElementsByTagName('head')[0].appendChild(script)
  }
}
