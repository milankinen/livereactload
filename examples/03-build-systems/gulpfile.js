"use strict";

var gulp       = require("gulp"),
  gutil      = require("gulp-util"),
  nodemon    = require("gulp-nodemon"),
  source     = require("vinyl-source-stream"),
  buffer     = require("vinyl-buffer"),
  browserify = require("browserify"),
  watchify   = require("watchify"),
  babelify   = require("babelify"),
  envify     = require("envify"),
  lrload     = require("livereactload")


var isProd = process.env.NODE_ENV === "production"


function createBundler(useWatchify) {
  return browserify({
    entries:      [ "./site.js" ],
    transform:    [ [babelify, {}], [envify, {}] ],
    plugin:       isProd || !useWatchify ? [] : [ lrload ],    // no additional configuration is needed
    debug:        !isProd,
    cache:        {},
    packageCache: {},
    fullPaths:    !isProd                       // for watchify
  })
}

gulp.task("bundle:js", function() {
  var bundler = createBundler(false)
  bundler
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(gulp.dest("."))
})

gulp.task("watch:js", function() {
  // start JS file watching and rebundling with watchify
  var bundler = createBundler(true)
  var watcher = watchify(bundler)
  rebundle()
  return watcher
    .on("error", gutil.log)
    .on("update", rebundle)

  function rebundle() {
    gutil.log("Update JavaScript bundle")
    watcher
      .bundle()
      .on("error", gutil.log)
      .pipe(source("bundle.js"))
      .pipe(buffer())
      .pipe(gulp.dest("."))
  }
})

gulp.task("watch:server", function() {
  nodemon({ script: "server.js", ext: "js", ignore: ["gulpfile.js", "bundle.js", "node_modules/*"] })
    .on("change", function () {})
    .on("restart", function () {
      console.log("Server restarted")
    })
})

gulp.task("default", ["watch:server", "watch:js"])
