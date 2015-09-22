# LiveReactload

Live code editing with Browserify and React. **VERSION 2.0.0 ALPHA RELEASED**

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/milankinen/livereactload)
[![npm version](https://badge.fury.io/js/livereactload.svg)](http://badge.fury.io/js/livereactload)
[![Build Status](https://travis-ci.org/milankinen/livereactload.svg)](https://travis-ci.org/milankinen/livereactload)

## Motivation

There are many live reloading components for CSS (and its variants) but unfortunately
JavaScript didn't have such tools yet. After I played a little bit with React, I realised
that its architecture and programming principles are a perfect match that could solve
the puzzle.


## What is LiveReactload

LiveReactload is a Browserify implementation similar to [LiveReload](http://livereload.com/) but
for JavaScript instead. Ok, LiveReload actually supports JavaScript reloading **but** it
reloads the **whole page** when the changes occur. If you have done something with the page,
then **the state is lost** and you have to do the same operations again.

LiveReactload solves the **state propagation problem** over JavaScript reloads. It
provides the following features:

  * Automatic state propagation management for React components as a Browserify plugin
  * Notification infrastructure for change event delegation
  * Automatic change event listening and bundle reloading (when the Browserify plugin is enabled)
  * Integration interfaces for build systems  
  
And because one photo tells more than a thousand words, see the following video to see 
LiveReactload in action:

[![Video](https://dl.dropbox.com/s/gcnhv4rzvhq5kaw/livereactload-preview.png)](https://vimeo.com/123513496)
    
### Other implementations

TODO: links to Webpack HRM etc etc

## Requirements

LiveReactload requires `watchify`, `babelify` and `react >= 0.13.x`

## Usage

Install React proxying components and LiveReactload

```bash
npm i --save-dev watchify babelify livereactload@2.0.0-alpha2 react-proxy babel-plugin-react-transform
```

Add LiveReactload as a Browserify plugin to `watchify`. For example:

```bash
node_modules/.bin/watchify site.js -t babelify -p livereactload -o static/bundle.js
```

Create `.babelrc` file into project's root directory (or add `react-transform` extra
if the file already exists:

```javascript 
{
  "stage": 0,
  "plugins": [
    "react-transform"
  ],
  "extra": {
    "react-transform": [{
      "target": "livereactload/babel-transform",
      "imports": ["react"]
    }]
  }
}
```

**That's it!** Now just start (live) coding.

### How about build systems?

TODO: build system integrations

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

## License

MIT


## Contributing

Please create a [Github issue](issues) if problems occur. Pull request are also welcome
and they can be created to the `development` branch. 


## Thanks

  * **[Dan Abramov](https://github.com/gaearon)** 
  * **[Hannu](https://github.com/heintsi)**
