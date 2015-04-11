
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
    // chrome
    for (var i = 0; i < stackLines.length; i++){
      if (stackLines[i].match(/\(\s*http[s]?:\/\//)) {
        var mc = stackLines[i].match(/\(\s*((http[s]?:\/\/.+\/)([^\/]+\.js.*)):\d+\s*\)/)
        return mc[1].replace(/:\d+$/, '')
      }
    }
    // firefox
    for (var j = 0; j < stackLines.length; j++) {
      if (stackLines[j].match(/@http[s]?:\/\//)) {
        var mf = stackLines[j].match(/@(http[s]?:\/\/.+)/)
        // drop line and column
        var mfParts = mf[1].split(':')
        return mfParts.slice(0, mfParts.length - 2).join(':')
      }
    }
    return ''
  }
}

function cacheBust(src) {
  var uri = src.replace(/[\?&]__livereactloadPreventCache=\d+/, '')
  var idx = uri.indexOf('?')
  if (idx === -1)
    uri += '?'
  else if (idx !== uri.length - 1)
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
