# LiveReactload

[![Join the chat at https://gitter.im/milankinen/livereactload](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/milankinen/livereactload?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Live code editing with Browserify and React.

## Motivation

There are many live reloading components for CSS (and its variants) but unfortunately
JavaScript didn't have such tools yet. After I played a little bit with React, I realised
that its architecture and programming principles are a perfect match that could solve
the puzzle.

I did some Googling and managed to find [one similar implementation](https://github.com/gaearon/react-hot-loader) 
for the Webpack. However, I'm a very satisfied Browserify user so I wanted one for it
too. The results of this work can be found from this repository and npm.

## What is LiveReactload

LiveReactload is a Browserify implementation similar to [LiveReload](http://livereload.com/) but
for JavaScript instead. Ok, LiveReload actually supports the JavaScript loading **but** it
reloads the **whole page** when the changes occur. If you have done something with the page,
then **that state is lost** and you have to do the same operations again.

LiveReactload solves the **state propagation problem** between JavaScript reloads. It
provides the following features:

  * Automatic state propagation management for the React components as a Browserify transform
  * Notification infrastructure for change events delegation
  * Automatic change event listening and bundle reloading (when the Browserify transform is enabled)
  * Custom state propagation by using **[LiveReactload API](https://github.com/milankinen/livereactload-api)**
  * Integration interfaces for build systems  
  
And because photo tells more than a thousand words, see the following video to see 
LiveReactload in action:

    TODO: video

    

## Usage

Install LiveReactload as development dependency

    npm install --save-dev livereactload
    
LiveReactload package is a standard Browserify transform so it can be used like any other
transformation (e.g. `reactify`, `uglifyify`, ...).

However, just adding the transformation is not enough. It will give your codebase a capability
to reload itself but the codebase itself does not know about code changes. That's why LiveReactload
must be integrated to your watch system (e.g. watchify). LiveReactload provides the following
commands to do it:

    # starts a server tht listens for change events and delegates them to the browser
    node_modules/.bin/livereactload listen
    
    # sends a change event notification to the listening server
    node_modules/.bin/livereactload notify
    

Here is an example `bin/watch` script that you can use (presuming that `browserify` and 
`watchify` has been installed locally) to watch your bundle changes:

    #!/bin/bash
    
    { { node_modules/.bin/watchify site.js -v -t babelify -t livereactload -o static/bundle.js 1>&2; } 2>&1 \
      | while read result; do
        echo "$result"
        [[ "$result" =~ ^[0-9]+[[:space:]]bytes[[:space:]]written  ]] && node_modules/.bin/livereactload notify
      done
    } &
    
    node_modules/.bin/livereactload listen
    wait


And finally just start watcher and begin coding:

    ./bin/watch
   
For build system integrations, please see [this example](examples/05-build-systems)

## How it works

React programming model suits perfectly for live code editing: components are just
stupid ones that render what they are told to render and the DOM changes are handled
with VirtualDOM diff. This (hopefully) prevents developers to **hide the state** inside
the application. 

Because the state is managed by react components and those components are exported
via `module.exports`, it is possible to weave those components with a logic that
enables state propagation: when the bundle is reloaded, the new implementation 
replaces the old prototypes but not the actual state.

More detailed explanation about the idea coming later...

So basically if you code your React applications using its best practices, then
**you can use this reloading component without any modifications to your code!**.


## When it doesn't work?

Well... if you hide your state inside the modules then the reloading will loses
the state. For example the following code will **not** work:

    // counter.js
    var React = require('react')
    
    var totalClicks = 0
    
    module.exports = React.createClass({
    
      getInitialState: function() {
        return {clickCount: totalClicks}
      },
    
      handleClick: function() {
        totalClicks += 1
        this.setState({clickCount: totalClicks})
      },
    
    
      render: function() {
        return (
          <div>
            <button onClick={this.handleClick}>Increment</button>
            <div>{this.state.clickCount}</div>
          </div>
        )
      }
    })

The second problem arises when you have "private" components inside your modules
that are not exported with `module.exports`. 

**However**, both of those challenges can be solved by using 
[LiveReactload API](https://github.com/milankinen/livereactload-api). Please see
the **[examples](examples)** to see how to use the API in different situations.

