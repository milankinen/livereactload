
var http     = require('http'),
    ws       = require('ws'),
    color    = require('cli-color'),
    defaults = require('../defaults.json');


module.exports = function(options) {
  var opts = options || {}

  if (this.listening) {
    return;
  }

  var reloadServer = new ws.Server({ port: Number(opts.port || defaults.reloadPort) });
  log('server listening in port ' + (opts.port || defaults.reloadPort));

  reloadServer.on('connection', function() {
    log('new client connected');
  })

  var notifyServer = http.createServer(function(req, res) {
    var body = 'ok';
    res.writeHead(200, {"Content-Lenght": body.length, "Content-Type": "text/plain"});
    res.end(body);

    log('sending reload request to ' + reloadServer.clients.length + ' clients');
    reloadServer.clients.forEach(function(client) {
      client.send('plz reload');
    });
  });
  notifyServer.listen(Number(opts.notifyPort || defaults.notifyPort));

  this.listening = true;

  function log(msg) {
    if (opts.logging !== false) {
      console.log(color.green('LiveReactload:'), color.cyan(msg));
    }
  }
};
