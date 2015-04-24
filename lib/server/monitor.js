
var chokidar = require('chokidar'),
    notifier = require('node-notifier'),
    listen   = require('./listen'),
    notify   = require('./notify')

module.exports = function(path, opts) {
  var options = opts || {}
  var displayNotification = options.displayNotification === true


  listen()
  chokidar.watch(path, {persistent: true})
    .on('change', function() {
      notify()
      if (displayNotification) {
        notifier.notify({
          title: 'Bundle changed',
          message: 'Sending reload event to LiveReactload clients'
        })
      }
    })
}
