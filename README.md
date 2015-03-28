# LiveReactload

Browserify plugin for liverealoadable React development. **Under development...**

## Usage

Install LiveReactload as development dependency

    npm install --save-dev livereactload
    

Modify you watch file to use livereactload transform (for example `scripts/watch.sh`)

    #!/bin/bash
    
    node_modules/.bin/nodemon --ignore public/bundle.js --watch &
    
    { { node_modules/.bin/watchify site.js -v -t babelify -t livereactload -o static/bundle.js 1>&2; } 2>&1 \
      | while read result; do
        echo "$result"
        [[ "$result" =~ ^[0-9]+[[:space:]]bytes[[:space:]]written  ]] && node_modules/.bin/livereactload notify
      done
    } &
    
    node_modules/.bin/livereactload listen
    wait


And finally just start watcher and begin coding:

    ./scripts/watch.sh 
    
    
