# Build system integrations

If you have an existing build system (e.g. Gulp or Grunt), you can
easily use LiveReactload with them. This example demonstrates how to use
LiveReactload with Gulp. See `gulpfile.js` and `package.json` for
more details.


## API

`require('livereactload`) returns a Browserify transform function.

In addition, `var lrload = require('livereactload')` has the following methods:


### .monitor(bundleFilePath, [{displayNotification: <boolean>}])

Starts monitoring the given bundle file changes and sends a reloading 
event every time when change occurs. **This is the preferred method
to use!** If (optional) `displayNotification` is set to `true`, then
a desktop notification is sent every time when bundle file changes.
`node-notifier` module is used for notifications.

    lrload.monitor('static/bundle.js', {displayNotification: true})


### .listen([reload-event-port = 4474], [notify-event-port = 4475])

Starts a WebSocket server that sends reload events to the clients. If 
LiveReactoad transformation is enabled, then the JavaScript bundle opens
a client connection automatically to this server.

    lrload.listen()  // listens in default ports
    
    
### .notify([host = 'localhost'], [notify-port = 4475])

Sends a notification that the bundle has changed and reloading should occur.
Internally `.listen` starts a HTTP server that listens these notify events so
notifications are basically just plain HTTP requests.

    lrload.notify()  // equals to bash command "curl http://localhost:4475"


### .gulpnotify([host = 'localhost'], [notify-port = 4475])

Returns a `through2` stream that sends notifications from change events.

    watcher
      .bundle()
      ...
      .pipe(lrload.gulpnotify())
