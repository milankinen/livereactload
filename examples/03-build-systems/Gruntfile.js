module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-nodemon')
  grunt.loadNpmTasks('grunt-concurrent')

  grunt.registerTask('default', ['concurrent'])

  grunt.initConfig({

    concurrent: {
      dev: {
        tasks: [
          'nodemon',                  // start server
          'browserify:development'    // start watchify with livereactload
        ],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    nodemon: {
      dev: {
        script: 'server.js',
        ignore: ['./bundle.js']
      }
    },

    browserify: {
      development: {
        src: './site.js',
        dest: './bundle.js',
        options: {
          // use watchify instead of browserify
          watch: true,
          keepAlive: true,
          transform: [[{}, 'babelify'], [{global: true}, 'envify']],
          // enable livereactload for dev builds
          plugin: ['livereactload']
        }
      },
      // this is meant for "production" bundle creation
      // use "grunt browserify:production" to create it
      production: {
        src: './site.js',
        dest: './bundle.js',
        options: {
          watch: false,
          transform: [[{}, 'babelify'], [{global: true}, 'envify']]
        }
      }
    }

  })
}
