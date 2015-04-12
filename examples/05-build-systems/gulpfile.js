'use strict';

var gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    nodemon    = require('gulp-nodemon'),
    source     = require('vinyl-source-stream'),
    buffer     = require('vinyl-buffer'),
    browserify = require('browserify'),
    watchify   = require('watchify'),
    babelify   = require('babelify'),
    lrload     = require('livereactload')


var isProd = process.env.NODE_ENV === 'production'

var bundler = browserify({
  entries:      [ './site.js' ],
  transform:    isProd ? [ babelify ] : [ babelify, lrload ],
  debug:        !isProd,
  cache:        {},
  packageCache: {},
  fullPaths:    true // for watchify
})


gulp.task('jswatch', function() {
  // start listening reload notifications
  lrload.listen()

  // start JS file watching and rebundling with watchify
  var watcher = watchify(bundler)
  rebundle()
  return watcher
    .on('error', gutil.log)
    .on('update', rebundle)

  function rebundle() {
    gutil.log('Update JavaScript bundle')
    watcher
      .bundle()
      .on('error', gutil.log)
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(gulp.dest('static'))
      .pipe(lrload.gulpnotify())
  }
})

gulp.task('serverwatch', function() {
  nodemon({ script: 'server.js', ext: 'js', ignore: ['gulpfile.js', 'static/bundle.js', 'node_modules/*'] })
    .on('change', [])
    .on('restart', function () {
      console.log('Server restarted')
    })
})

gulp.task('watch', ['serverwatch', 'jswatch'])
