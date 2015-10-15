# Build system integrations

LiveReactload is build system agnostic. It means that you can use LiveReactload with
all build systems having Browserify and Watchify support.

This example contains configurations for `grunt` and `gulp`. Note that since we are
using `babelify` transform for both examples, `.babelrc` includes the configurations
for `react-transform`.
    
## Grunt support

You can use LiveReactload with `grunt-browserify` module normally as a Browserify plugin.
Remember to add `watch: true` and `keepAlive: true` in your development config so that
you are using `watchify` instead of `browserify!

To run the grunt build, install `grunt-cli` and start grunt default task

    npm i -g grunt-cli
    grunt

Then open localhost:3000 in your browser.
    
In order to create a "production bundle", use `NODE_ENV=production grunt browserify:production`

For more information, see `Gruntfile.js`


## Gulp support

Use LiveReactload as a normal Browserify plugin when creating the bundler in `gulpfile.js`.
No additional options are needed (but they can be passed if wanted).

To run the gulp build, install `gulp-cli` and start gulp default task

    npm i -g gulp-cli 
    gulp

Then open localhost:3000 in your browser.

In order to create a "production bundle", use `NODE_ENV=production gulp bundle:js`

For more information, see `gulpfile.js`
