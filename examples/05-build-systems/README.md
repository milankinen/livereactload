# Build system integrations

If you have an existing build system (e.g. Gulp or Grunt), you can use
LiveReactload with those easily. This example demonstrates how to use
LiveReactload with Gulp. See `gulpfile.js` and `package.json` for
more details.


## API

`require('livereactload`) returns a Browserify transform function.

In addition, `var lrload = require('livereactload')` has the following methods:

### .listen([reload-event-port = 4474], [notify-event-port = 4475])

Starts a WebSocket server that sends reload events to the clients. If 
LiveReactoad transformation is enabled, then the JavaScript bundle opens
a client connection automatically to this server.

    lrload.listen()  // listens in default ports
    
    
### .notify([host = 'localhost'], [notify-port = 4474])

Sends an notification that bundle has changed and reloading should occur.
`.listen` starts also a HTTP server that listens these notify events so
notifications are basically plain HTTP requests.

    lrload.notify()  // equals to bash command "curl http://localhost:4475"


### .gulpnotify([host = 'localhost'], [notify-port = 4474])

Returns a `through2` stream that sends events from change events.

    watcher
      .bundle()
      ...
      .pipe(lrload.gulpnotify())
