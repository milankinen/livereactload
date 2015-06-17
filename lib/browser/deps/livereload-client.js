
var WebSocket   = require('ws'),
    forceUpdate = require('./force-update-app')

module.exports = {
  init: function(lrload, config) {
    var hostname = getWebServiceHost(config)
    var ws = lrload.client = new WebSocket('ws://' + hostname + ':' + config.reloadPort)
    ws.onmessage = function() {
      var src = getScriptURL(config)
      loadScript(src, lrload)
    }
  }
}

function getWebServiceHost(config) {
  if (config && config.hostname) {
    return config.hostname
  } else {
    var scriptUrl = getScriptURL(config)
    if (scriptUrl.indexOf('file:') === 0) {
      return 'localhost'
    } else if (scriptUrl.indexOf('http') === 0) {
      var parser = document.createElement('a')
      parser.href = scriptUrl
      return parser.hostname
    } else {
      return 'localhost'
    }
  }
}

function getScriptURL(config) {
  return (function() {
    try {
      throw new Error()
    }
    catch(e) {
      var stackLines = e.stack.split('\n')
      // chrome
      for (var i = 0; i < stackLines.length; i++) {
        if (stackLines[i].match(/\(\s*http[s]?:\/\//)) {
          var mc = stackLines[i].match(/\(\s*((http[s]?:\/\/.+\/)([^\/]+\.js.*)):\d+\s*\)/)
          return cacheBust(mc[1].replace(/:\d+$/, ''))
        }
      }
      // firefox
      for (var j = 0; j < stackLines.length; j++) {
        if (stackLines[j].match(/@http[s]?:\/\//)) {
          var mf = stackLines[j].match(/@(http[s]?:\/\/.+)/)
          // drop line and column
          var mfParts = mf[1].split(':')
          return cacheBust(mfParts.slice(0, mfParts.length - 2).join(':'))
        }
      }
      // local files
      for (var k = 0; k < stackLines.length; k++) {
        if (stackLines[k].match(/file:\/\/\//)) {
          var fc = stackLines[k].match(/\s*(file:\/\/\/.+\.js)(:\d+)/)
          return fc[1]  // no cache busting for local files
        }
      }
      return ''
    }
  })();

  function cacheBust(src) {
    if ((typeof config.preventCache === 'undefined' ? true : config.preventCache).toString() === 'false') {
      return src
    } else {
      var uri = src.replace(/[\?&]__livereactloadPreventCache=\d+/, '')
      var idx = uri.indexOf('?')
      if (idx === -1)
        uri += '?'
      else if (idx !== uri.length - 1)
        uri += '&'
      return uri + '__livereactloadPreventCache=' + Date.now()
    }
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
      forceUpdate(lrload)
    })
    document.getElementsByTagName('head')[0].appendChild(script)
  }
}
