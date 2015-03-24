'use strict';

var R  = require('ramda'),
    ws = require('ws')

var server = new Server()

module.exports = function() {
  if (!server.isListening()) {
    server.listen()
  }
}
module.exports.server = server


function Server() {
  var server = null

  this.isListening = function() {
    return !!server
  }

  this.listen = function() {
    server = new ws.Server({ port: 4455 })
    console.log('listening on port 4455')

    server.on('connection', function(conn) {
      console.log('new connection', conn.id)
    })
  }

  this.send = function(msg) {
    server.clients.forEach(function(client) {
      console.log('Send to connections', msg)
      client.send(msg)
    })
  }
}
