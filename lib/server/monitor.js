
var chokidar = require('chokidar'),
    fs       = require('fs'),
    notifier = require('node-notifier'),
    check    = require('syntax-error'),
    listen   = require('./listen'),
    notify   = require('./notify')

module.exports = function(path, opts) {
  var options = opts || {}
  var displayNotification = options.displayNotification === true


  listen()
  chokidar.watch(path, {persistent: true})
    .on('change', function() {
      if (!isBundleValid(path)) {
        // bundle's syntax is not correct => bundle is not ready yet
        return
      }
      notify()
      if (displayNotification) {
        notifier.notify({
          title: 'Bundle changed',
          message: 'Sending reload event to LiveReactload clients'
        })
      }
    })

  function isBundleValid(bundlePath) {
    try {
      var bundle = fs.readFileSync(bundlePath).toString()
      return !check(bundle)
    } catch (ignore) {
      return false
    }
  }
}
