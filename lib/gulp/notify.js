'use strict';

var through = require('through2'),
    notify  = require('../server/notify');

module.exports = function(hostname, port) {
  var lastFile = null;

  return through.obj(
    function(file, enc, cb) {
      lastFile = file;
      this.push(file);
      cb();
    },
    function(cb) {
      if (lastFile !== null) {
        notify(hostname, port);
      }
      cb();
    }
  );
};
