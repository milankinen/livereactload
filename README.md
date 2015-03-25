# reactloadify

Browserify transform for liverealoadable React development. Under 
development...

## Usage

### Gulp configurations

    var rload = require('reactloadify')
    
    var bundler = browserify({
      transform:    [ rload ],
      ...
    })
    
    gulp.task('jswatch', function() {
      rload.listen()
      var watcher  = watchify(bundler)
      return watcher
        .on('error', gutil.log)
        .on('update', function() {
            watcher
              .bundle()
              .on('error', notify.onError({ message: 'Error: <%= error.message %>', sound: false }))
              .pipe(source(jsBundleFile))
              ...
              .pipe(gulp.dest(staticDirectory))
              .pipe(rload.notify())
          })
          .bundle()
          .pipe(source(jsBundleFile))
          .pipe(gulp.dest(staticDirectory))
    })


### Site JS

    
    var React       = require('react'),
        Bacon       = require('baconjs'),
        Application = React.createFactory(require('./application'))
    
    var rload = require('reactloadify/api')
    
    
    rload.windowLoaded(function(state) {
      var model = state || window.INITIAL_MODEL
      var stream = Bacon.combineTemplate({
        .. create state object using model ..
      })
    
      stream.onValue(function(newModel) {
        rload.setState(newModel)
        render(newModel)
      })
    })
    
    function render(model) {
      React.render(Application({model: model}), document.getElementById('app'))
    }
