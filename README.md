# LiveReactload 4.x BETA

Live code editing with Browserify and React.

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/milankinen/livereactload)
[![npm version](https://badge.fury.io/js/livereactload.svg)](http://badge.fury.io/js/livereactload)
[![Build Status](https://travis-ci.org/milankinen/livereactload.svg)](https://travis-ci.org/milankinen/livereactload)

## Motivation

Hot reloading is de facto in today's front-end scene but unfortunately
there isn't any decent implementation for Browserify yet. This is a shame because
(in my opinion) Browserify is the best bundling tool at the moment.

Hence the goal of this project is to bring hot reloading functionality
to Browserify by honoring its principles: simplicity and modularity.


## How does it work?

LiveReactload can be used as a normal Browserify plugin. When applied to the bundle,
it modifies the Browserify bundling pipeline so that the created bundle becomes
"hot-reloadable".

  * LiveReactload starts the reloading server which watches the bundle changes
  and sends the changed contents to the browser via WebSocket.
  * When the changes arrive to the browser, LiveReactload client (included automatically
  in the bundle) analyzes the changes and reloads the changed modules

However, LiveReactload shines when combined with [Dan Abramov](https://github.com/gaearon/)'s
[`react-hot-loader`](https://github.com/gaearon/react-hot-loader). Their docs assume you are using Webpack,
so here's a breakdown of how it looks with Browserify:
 
 * Wrap your outermost component in an `<AppContainer>` element from `react-hot-loader`. Same as Webpack.
 * Include the `react-hot-loader/babel` plugin in your babel config. Same as webpack.
 * The patch file (`react-hot-loader/patch`) is included in the bundle automatically when using LiveReactload.
 * The react tree must be re-rendered when a module is changed. LiveReactload automates this. In many cases,
  the default will work fine. However, if your application cannot be run over and over automatically without
  issues, that means it is not idempotent and you need to handle the re-render manually. To do this you react
  to HMR events via the `module.hot` interface. It's very similar to Webpack's. See examples below.
 

And because one photo tells more than a thousand words, see the following video to see
LiveReactload in action:

[![Demo](https://dl.dropbox.com/s/gcnhv4rzvhq5kaw/livereactload-preview.png)](https://vimeo.com/123513496)

### Other implementations

If you are a Webpack user, you probably want to check
**[react-transform-boilerplate](https://github.com/gaearon/react-transform-boilerplate)**.

If you want to stick with browserify, but use the Hot Module Reloading API (like webpack), you could use: **[browserify-hmr](https://github.com/AgentME/browserify-hmr)**, **[babel-plugin-react-transform](https://github.com/gaearon/babel-plugin-react-transform)** and
**[react-transform-hmr](https://github.com/gaearon/react-transform-hmr)**


## Usage

### Pre-requirements

LiveReactload requires `watchify` and `react >= 15.x` in order to
work.

### Example Installation (with `react-hot-loader` and Babel 6.x)

Install npm modules:

```sh
npm i --save react react-dom react-hot-loader@next babelify babel-preset-es2015 babel-preset-react
npm i --save-dev watchify livereactload@next
```

Create a `.babelrc` file in the project's root directory (or add `react-hot-loader/babel` to the plugins section
if the file already exists).

```javascript
{
  "presets": ["es2015", "react"],
  "plugins": ["react-hot-loader/babel"]
}
```

Use LiveReactload as a Browserify plugin with `watchify`. For example:

```bash
node_modules/.bin/watchify site.js -t babelify -p livereactload -o static/bundle.js
```

Finally, when you create your application, the file where you render the top of the tree
should look something like this:

```javascript
import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import Component from './components/Component'

render(
  <AppContainer>
    <Component />
  </AppContainer>,
  document.getElementById('app')
)
```

**That's it!** Now just start (live) coding! For more detailed example, please see
**[the basic usage example](examples/01-basic-usage)**.

**NOTE:** The above snippet is idempotent, which means it can be run over and over without issue. Sometimes
you may place code here (like `redux` or `react-tap-event-plugin`) which are stateful and cannot be run over
and over. In this case, you must use `module.hot.onUpdate` to indicate to LiveReactload what to do when a change
is detected. For example:

```javascript
// index.js
import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import MyComponent from './components/MyComponent'
import getStore from './getStore'
  
ReactDOM.render(
  <AppContainer>
    <MyComponent />
  </AppContainer>,
  document.getElementById('app')
)
```

```javascript
// getStore.js
import { createStore } from 'redux'
import reducers from './reducers'
  
let store;
  
export default function getStore() {
  if (!store) {
    store = createReduxStore(reducers);
  }
}
  
if (module && module.hot) {
  module.hot.onUpdate(()=>{
    store.replaceReducer(require('./reducers').default);
  })
}
```

### Reacting to reload events

Ideally your client code should be completely unaware of the reloading. If your
application is idempotent, then you don't need to use `module.hot` at all. Creating an
idempotent application means if all the files (especially your entry point) can be run
over and over without throwing exceptions, keeping state, or breaking. However,
some libraries like `redux` cannot be idempotent because their purpose is to keep track
of staate. That's why LiveReactload provides the `module.hot.onUpdate(...)` hook.

By using this hook, you can add your own custom functionality that is
executed in the browser only when the module reload occurs:

```javascript
if (module && module.hot) {
  module.hot.onUpdate(() => {
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

Generally, when we're talking about hot reloading not working, what we mean is that *we fail to keep state*.
In all the cases described below, state is lost between changes, but LiveReactload's client/server will still
cause your application to be re-rendered, so your new changes will be visible anyway.

### Module state
If you hide your state inside the modules then the reloading will lose
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

This is considered a bad pattern anyway and you shouldn't use it.

### Non-proxied component

The magic behind hot reloading comes from `react-hot-loader`, which uses `react-proxy` to achieve a "saved state"
between re-renders. In order to accomplish this, when a React Component is updated, it and *all other components*
above it in the render tree must be proxied! This is what `react-hot-loader/babel` is doing in your babel config.
This has [some limitations](https://github.com/gaearon/react-hot-loader/issues), but the most obvious one is that
your ES6 classes must be exposed at the top level of the module (they don't need to be exported). For example, this
will not work:

```javascript
import React, { Component } from 'react'
import { connect } from 'react-redux'

@connect(state => state)
export default class MyComponent extends Component {
    render() {
        return <div>This component breaks keeping state for hot reloading!</div>
    }
}
```
Due to the way decorators work, the export actually ends up like this:

```javascript
export default connect(state => state)(class My Component extends Component { ... })
```

Since the class is not available at the top level, `react-proxy` proxies the HoC generated by `connect` but fails
to proxy your class. This is not an issue with decorators like `autobind-decorator` because they transform
your class directly and return it, whereas `connect` returns a new class which renders your class.

### React Router 3.x

Due to the way 3.x works, you must use 4.x instead.

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

#### `--no-dedupe` 

Disables Browserify module de-duplication. By default, de-duplication is enabled.
However, sometimes this de-duplication with may cause an invalid bundle with LiveReactload.
You can disable this de-duplication by using this flag.

#### `--no-client`

Omits the reload client from the generated bundle.

#### `--ssl-cert <certFilename>` and `--ssl-key <privateKeyFilename>`

Adds your custom SSL certificate and key to the reload web-server. This is needed if you
want to use LiveReactLoad in HTTPS site. Parameters are paths to the actual files.

#### `--no-babel`

If you use a tool other than Babel to transform React syntax, this disables the in-browser warning that would otherwise appear.

## Migration from LiveReactload 3.x

Migration is easy:

1. Remove `react-proxy` and `babel-plugin-react-transform` dependencies from `package.json` using
`npm uninstall` or `yarn remove`
2. Use `npm install` or `yarn add` to get the latest `livereactload` and `react-hot-loader` packages.
3. Replace the `react-transform` section of your Babel config with `react-hot-loader/babel`. See installation
instructions for how the config should look now. (It's must simpler.) 
4. Add `import { AppContainer} from 'react-hot-loader'` to the file where you render your root component, and
then wrap your root component in this container. `ReactDOM.render(<App/>, ...)` becomes
`ReactDOM.render(<AppContainer><App></AppContainer>, ...)`.
5. If you were using `module.onReload` it must be replaced with `module.hot.onUpdate`. This isn't simply a rename,
this hook works differently now. Despite this, if you were following the commonly used patterns for this hook in
the LiveReactload examples, simply renaming it should work just fine.

**You're all set!** Despite the easy migration, this is a rather large change under the hood so while reloading
is improved in general, you may run into other issues. The biggest change to LiveReactload is that in the past,
if only React components were updated, your application would not be re-run, and `react-proxy` would silently
replace components. This was a bad approach as it circumvents the standard React approach of re-rendering to get
changes. So now whenever you change a React component (or any file) your whole app will be re-run by default. If
you have functionality that cannot be run multiple times on the same page load, you may need to use a
`module.hot.onUpdate` hook to have more control over this. See examples above!

## License

MIT


## Contributing

Please create a [Github issue](/../../issues) if problems occur. Pull request are also welcome
and they can be created to the `development` branch.
