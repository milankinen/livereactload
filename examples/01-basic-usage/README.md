# Basic LiveReactload 2.x usage

This example demonstrates the minimal live reloading configuration.

* `package.json` contains `watchify` script
* `.babelrc` contains Babel transformation setup 
* Application code is in `src` folder

You can run this example by typing

    npm i && npm run watch
    open http://localhost:3000   # OS X only
    
After the server is started, you can edit source files from `src` and 
changes should be reloaded as they occur. 
