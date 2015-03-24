'use strict';

var through = require('through2'),
    listen  = require('./listen')

module.exports = function() {
  var lastFile = null

  return through.obj(
    function(file, enc, cb) {
      lastFile = file
      this.push(file)
      cb()
    },
    function(cb) {
      if (lastFile !== null) {
        listen.server.send('updated')
        lastFile = null
      }
      cb()
    }
  )
}
