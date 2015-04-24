# Custom state propagation across reload events

If you want to use different state handling pattern (e.g. Flux stores)
than React component state then you also must handle the state propagation 
manually. [LiveReactload API](https://www.npmjs.com/package/livereactload-api)
provides means to it. 

The basic idea is to store the most recent state with `setState` so 
that `onReload` can use it during the next reload event.

```javascript
window.onload = function() {
  initApp(window.INITIAL_MODEL)
}

function initApp(model) {
  var modelStream = Bacon.combineTemplate({
    items: items._items(model.items || []),
    editedItem: items._editedItem()
  })

  modelStream.onValue(function(model) {
    lrapi.setState(model)
    React.render(<Application {...model} />, document.getElementById('app'))
  })
}


// live reloading
lrapi.onReload(function() {
  initApp(lrapi.getState() || window.INITIAL_MODEL)
})
```

In this example, React component don't have any own state - they are just 
dummy components rendering whatever they are told to render. When events 
occur, they modify the global state by using `items.js` global API.
 
The `Items` object handles all the business logic with BaconJS streams and
that stream will produce new values when the state changes. To store that
state, we use `.setState` just before re-render (in `site.js`). 

`lrApi.onReload` method is used with `lrApi.getState` so that reloading event 
can construct the proper stream from the latest state.

Note that this loop enables the isomorphic application development. In 
this example the initial user interface is actually pre-rendered by the
server (confirm it by yourself by disabling JavaScript from you browser)!

## API

### .onReload(callback)

This is invoked each when next bundle is reloaded. You can register multiple
callbacks in you bundle. Callback takes no arguments 

```javascript
window.onload = function() {
  initApp()
}

lrAPI.onReload(function() {
  initApp()
})

function initApp() {
  // do something
  React.render(...)
}
```

### .setState([name], state)

This sets the state that can be used when next bundle is reloaded. You can set
multiple state by using name as a first argument. Name is not mandatory.

```javascript
lrAPI.setState(myGlobalState)
lrAPI.setState('socket', socket)
```

### .getState([name])

Restores the state. You can also retrieve named state objects by giving an 
optional name argument.

```javascript
var global = lrAPI.getState()
var socket = lrAPI.getState('socket')
```
