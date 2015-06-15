module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-nodemon')
  grunt.loadNpmTasks('grunt-shell-spawn')
  grunt.loadNpmTasks('grunt-concurrent')

  grunt.registerTask('default', ['concurrent'])

  grunt.initConfig({

    concurrent: {
      dev: {
        tasks: [
          'nodemon',                  // start server
          'shell:bundleMonitoring',   // start monitoring bundle changes
          'browserify:dev'            // start watchify
        ],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    browserify: {
      dev: {
        src: './site.js',
        dest: './static/bundle.js',
        options: {
          // use watchify instead of browserify
          watch: true,
          keepAlive: true,
          // we can pass options
          transform: [[{}, 'babelify'], [{global: true, preventCache: false}, 'livereactload']]
        }
      }
    },

    // easiest way to monitor bundle changes is to use grunt-shell-spawn
    shell: {
      bundleMonitoring: {
        command: 'node_modules/.bin/livereactload monitor static/bundle.js'
      }
    }

  })
}
