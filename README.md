# LiveReactload 2.x

Live code editing with Browserify and React.

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/milankinen/livereactload)
[![npm version](https://badge.fury.io/js/livereactload.svg)](http://badge.fury.io/js/livereactload)
[![Build Status](https://travis-ci.org/milankinen/livereactload.svg)](https://travis-ci.org/milankinen/livereactload)

## Motivation

Hot reloading is de facto in today's front-end scene but unfortunately
there isn't any decent implementation for Browserify yet. This is shame because
(in my opinion) Browserify is the best bundling tool at the moment.

Hence the goal of this project is to bring the hot reloading functionality
to Browserify by honoring its principles: simplicity and modularity.


## How it works?

LiveReactload can be used as a normal Browserify plugin. When applied to the bundle,
it modifies the Browserify bundling pipeline so that the created bundle becomes
"hot-reloadable".

  * LiveReactload starts the reloading server which watches the bundle changes
  and sends the changed contents to the browser via WebSocket.
  * When the changes arrive to the browser, LiveReactload client (included automatically
  in the bundle) analyzes the changes and reloads the changed modules

Starting from version `2.0.0` LiveReactload utilizes [Dan Abramov](https://github.com/gaearon)'s
[babel-plugin-react-transform](https://github.com/gaearon/babel-plugin-react-transform) and
[react-proxy](https://github.com/gaearon/react-proxy), which means that hot-reloading
capabilities are same as in Webpack.

And because one photo tells more than a thousand words, see the following video to see
LiveReactload in action:

[![Demo](https://dl.dropbox.com/s/gcnhv4rzvhq5kaw/livereactload-preview.png)](https://vimeo.com/123513496)

### Other implementations

If you are a Webpack user, you probably want to check
**[react-transform-boilerplate](https://github.com/gaearon/react-transform-boilerplate)**.


## Usage

### Pre-requirements

LiveReactload requires `watchify`, `babelify` and `react >= 0.13.x` in order to
work.

### Installation

Install pre-requirements (if not already exist)

```sh
npm i --save react
npm i --save-dev watchify babelify
```

Install React proxying components and LiveReactload

```sh
npm i --save-dev livereactload react-proxy@1.x babel-plugin-react-transform
```

Create `.babelrc` file into project's root directory (or add `react-transform` extra
if the file already exists). More information about `.babelrc` format and options
can be found from [babel-plugin-react-transform](https://github.com/gaearon/babel-plugin-react-transform).

```javascript
{
  "env": {
    "development": {
      "plugins": [
        "react-transform"
      ],
      "extra": {
        "react-transform": {
          "transforms": [{
            "transform": "livereactload/babel-transform",
            "imports": ["react"]
          }]
        }
      }
    }
  }
}
```

And finally use LiveReactload as a Browserify plugin with `watchify`. For example:

```bash
node_modules/.bin/watchify site.js -t babelify -p livereactload -o static/bundle.js
```

**That's it!** Now just start (live) coding! For more detailed example, please see
**[the basic usage example](examples/01-basic-usage)**.

### Reacting to reload events

Ideally your client code should be completely unaware of the reloading. However,
some libraries like `redux` require a little hack for hot-reloading. That's why
LiveReactload provides `module.onReload(..)` hook.

By using this hook, you can add your own custom functionality that is
executed in the browser only when the module reload occurs:

```javascript
if (module.onReload) {
  module.onReload(() => {
    ... do something ...
    // returning true indicates that this module was updated correctly and
    // reloading should not propagate to the parent components (if non-true
    // value is returned, then parent module gets reloaded too)
    return true
  });
}
```

For more details, please see **[the redux example](examples/02-redux)**.

### How about build systems?

LiveReactload is build system agnostic. It means that you can use LiveReactload with
all build systems having Browserify and Watchify support. Please see
**[build systems example](examples/03-build-systems)** for more information.


## When does it not work?

Well... if you hide your state inside the modules then the reloading will lose
the state. For example the following code will **not** work:

```javascript
// counter.js
const React = require('react')

let totalClicks = 0

export default React.createClass({

  getInitialState() {
    return {clickCount: totalClicks}
  },

  handleClick() {
    totalClicks += 1
    this.setState({clickCount: totalClicks})
  },


  render() {
    return (
      <div>
        <button onClick={this.handleClick}>Increment</button>
        <div>{this.state.clickCount}</div>
      </div>
    )
  }
})
```

## Configuration options

You can configure the LiveReactload Browserify plugin by passing some options
to it (`-p [ livereactload <options...> ]`, see Browserify docs for more information
about config format).

### Available options

LiveReactload supports the following configuration options

#### `--no-server` 

Prevents reload server startup. If you are using LiveReactload plugin with Browserify 
(instead of watchify), you may want to enable this so that the process won't hang after
bundling. This is not set by default.

#### `--port <number>` 

Starts reload server to the given port and configures the bundle's client to 
connect to the server using this port. Default value is `4474`

#### `--host <hostname>`

Configures the reload client to use the given hostname when connecting to the
reload server. You may need this if you are running the bundle in an another device. 
Default value is `localhost`

#### `--no-client`

Omits the reload client from the generated bundle.

#### `--client <custom-client>`

Overrides the default reload client implementation with your custom one. This can be
either a global module or local module path *relative to the bundle's entry file*.

Example usage:

    -p [ livereactload --client './customClient' ]
     
And the custom client code:
```javascript
// customClient.js
export default function client(scope, callbacks) {
  const {change} = callbacks
  const ws = new WebSocket("ws://my.custom.livereactload.server.path:port")
  ws.onmessage = m => {
    const msg = JSON.parse(m.data)
    if (msg.type === "change") {
      change(msg)
    }
  }
}
```

## License

MIT


## Contributing

Please create a [Github issue](issues) if problems occur. Pull request are also welcome
and they can be created to the `development` branch.
