
module.exports = {

  windowLoaded: function(cb) {
    if (typeof window !== 'undefined') {
      var reactloadify = window.__reactloadify
      if (!window.onload) {
        window.onload = function() {
          console.log('*** Initial load ***')
          cb(reactloadify.state)
        }
      } else {
        console.log('*** Reload ***')
        cb(reactloadify.state)
      }
    }
  },

  setState: function(state) {
    if (typeof window !== 'undefined') {
      var reactloadify = window.__reactloadify
      if (reactloadify) {
        reactloadify.state = state
      }
    }
  },

  expose: function(cls, id) {
    if (typeof window !== 'undefined') {
      var reactloadify = window.__reactloadify
      if (reactloadify) {
        require('./client/suffix')({exports: cls}, 'custom_' + id + '_')
      }
    }
  }

}

