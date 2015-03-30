'use strict';

var http     = require('http'),
    color    = require('cli-color'),
    defaults = require('../defaults.json');

module.exports = function(hostname, port, done) {
  var data = 'reload'
  var options = {
    hostname: hostname || '127.0.0.1',
    port: port || defaults.notifyPort,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': data.length
    }
  };

  var req = http.request(options, function(res) {
    res.on('data', function() { 
        /* consume data */
    });
    if (typeof done === 'function') {
      done();
    }
  });
  req.on('error', function() {
    console.error(color.red('LiveReactload: could not send reload notification. Are you sure that reload server is listening?'));
  })
  req.write(data);
  req.end();
}
