var yargs = require('yargs')

var rootYargs = yargs
  .usage('Usage: $0 <command> [options]')
  .command('listen', 'Starts LiveReactload server that listen for notifications and sends reload events to the clients')
  .command('notify', 'Sends a notification to the LiveReactload server that bundle has changed and livereloading should occur')
  .command('monitor', 'Starts monitoring the given bundle file changes and sends a reloading event every time when change occurs')
  .demand(1)


var root = rootYargs.argv,
    cmd  = root._[0]

if (cmd === 'listen') {

  var listenYargs = yargs
    .usage('Usage: $0 listen [--help|-h] [reload-port] [notify-port]')
    .alias('h', 'help')
    .describe('h', 'Display help')
    .epilogue('reload-port = Reloading port that listens new WebSocket clients (browsers)\n' +
              'notify-port = HTTP port that can be used to send notifications')

  var listen = listenYargs.argv
  if (listen.h) {
    listenYargs.showHelp()
  } else {
    require('../lib/server/listen')({port: listen._[1], notifyPort: listen._[2]})
  }

} else if (cmd === 'notify') {

  var notifyYargs = yargs
    .usage('Usage: $0 notify [--help|-h] [notify-port] [host]')
    .alias('h', 'help')
    .describe('h', 'Display help')
    .epilogue('notify-port = Notification HTTP port (see "listen" command) that triggers reloading event\n' +
              'host        = Host that listens for notifications. Defaults to localhost')

  var notify = notifyYargs.argv
  if (notify.h) {
    notifyYargs.showHelp()
  } else {
    require('../lib/server/notify')(notify._[2], notify._[1], function() {
      process.exit(0)
    })
  }

} else if (cmd === 'monitor') {

  var monitorYargs = yargs
    .usage('Usage: $0 monitor [--help|-h] [--show-notification|-n] <bundle-path>')
    .example('$0 monitor public/bundle.js')
    .boolean(['n', 'h'])
    .alias('h', 'help')
    .describe('h', 'Display help')
    .alias('n', 'show-notification')
    .describe('n', 'Display a desktop notification every time when bundle changes')
    .epilogue('Starts monitoring the given bundle file changes and sends a reloading event every time when change occurs')

  var monitor = monitorYargs.argv
  if (monitor.h || monitor._.length < 2) {
    monitorYargs.showHelp()
  } else {
    require('../lib/server/monitor')(monitor._[1], {displayNotification: !!monitor.n})
  }

} else {
  rootYargs.showHelp()
}
