# LiveReactload

Live code editing with Browserify and React.

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/milankinen/livereactload)
[![npm version](https://badge.fury.io/js/livereactload.svg)](http://badge.fury.io/js/livereactload)


## Motivation

There are many live reloading components for CSS (and its variants) but unfortunately
JavaScript didn't have such tools yet. After I played a little bit with React, I realised
that its architecture and programming principles are a perfect match that could solve
the puzzle.

I did some Googling and managed to find [one similar implementation](https://github.com/gaearon/react-hot-loader) 
for the Webpack. However, I'm a very satisfied Browserify user so I wanted one for it
too. The results of this work can be found in this repository and npm.

## What is LiveReactload

LiveReactload is a Browserify implementation similar to [LiveReload](http://livereload.com/) but
for JavaScript instead. Ok, LiveReload actually supports JavaScript reloading **but** it
reloads the **whole page** when the changes occur. If you have done something with the page,
then **the state is lost** and you have to do the same operations again.

LiveReactload solves the **state propagation problem** over JavaScript reloads. It
provides the following features:

  * Automatic state propagation management for React components as a Browserify transform
  * Notification infrastructure for change event delegation
  * Automatic change event listening and bundle reloading (when the Browserify transform is enabled)
  * Custom state propagation by using **[LiveReactload API](https://github.com/milankinen/livereactload-api)**
  * Integration interfaces for build systems  
  
And because one photo tells more than a thousand words, see the following video to see 
LiveReactload in action:

[![Video](https://dl.dropbox.com/s/gcnhv4rzvhq5kaw/livereactload-preview.png)](https://vimeo.com/123513496)
    

## Usage

Install LiveReactload as development dependency

```bash
npm install --save-dev livereactload
```

LiveReactload package is a standard Browserify transform so it can be used like any other
transformation (e.g. `reactify`, `uglifyify`, ...). 

**ATTENTION**: if you are using `react-bootstrap` or any other module that uses React as a
peer dependency, then you must define LiveReactload as a global transform (use `-g` instead 
of `-t`).

However, just adding the transformation is not enough. It will give your codebase a capability
to reload itself but the codebase itself does not know about code changes. That's why LiveReactload
must be integrated to your watch system (e.g. watchify). LiveReactload provides the following
commands to do it:

```bash
# starts a server tht listens for change events and delegates them to the browser
node_modules/.bin/livereactload listen

# sends a change event notification to the listening server
node_modules/.bin/livereactload notify
```    

Here is an example `bin/watch` script that you can use (presuming that `browserify` and 
`watchify` have been installed locally) to watch your bundle changes:

```bash
#!/bin/bash

{ { node_modules/.bin/watchify site.js -v -t babelify -g livereactload -o static/bundle.js 1>&2; } 2>&1 \
  | while read result; do
    echo "$result"
    [[ "$result" =~ ^[0-9]+[[:space:]]bytes[[:space:]]written  ]] && node_modules/.bin/livereactload notify
  done
} &

node_modules/.bin/livereactload listen
wait
```

And finally just start `watch` and begin coding:

```bash
./bin/watch
```

For build system integrations, please see [this example](examples/05-build-systems)


## How it works

The React programming model suits perfectly live code editing: components are just
stupid ones that render the data they are told to render and the DOM changes are handled
with VirtualDOM diff. This (hopefully) prevents developers from **hiding the state** inside
the application. 

If the state is managed by React components and those components are exported
via `module.exports`, it is possible to weave those components with a logic that
enables state propagation: when the bundle is reloaded, the new implementation 
replaces the old prototypes but not the actual state.

More detailed explanation about the idea coming later...

So basically if you code your React application using its best practices, then
**you can use this reloading component without any modifications to your code!**.


## When does it not work?

Well... if you hide your state inside the modules then the reloading will lose
the state. For example the following code will **not** work:

```javascript
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
```

A second problem arises when you have "private" components inside your modules
that are not exported with `module.exports`. 

**However**, both of those challenges can be solved by using 
[LiveReactload API](https://github.com/milankinen/livereactload-api). Please see
the **[examples](examples)** to see how to use the API in different situations.


## License

MIT


## Problems?

Please create a [Github issue](issues) if something occurs.


## Thanks

  * **[Dan Abramov](https://github.com/gaearon)** - an amazing [React Hot API](https://github.com/gaearon/react-hot-api)
    that was used for the basis of the state propagation mechanism 
  * **[Hannu](https://github.com/heintsi)** - inspiring and sparring with this project 
