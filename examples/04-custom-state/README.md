# Custom state propagation across reload events

If you want to use different state handling pattern (e.g. Flux stores)
than React component state then you also must handle the state propagation 
manually. [LiveReactload API](https://www.npmjs.com/package/livereactload-api)
provides means to it: `.onLoad` and `.setState`.

The basic idea is to store the most recent state with `setState` so 
that `onLoad` can use it during the next reload event.
    
    lrApi.onLoad(function(state) {
      var initialModel = state || window.INITIAL_STATE_FROM_SERVER
      // modelStream handles the state when user interacts with the application
      var modelStream = Bacon.combineTemplate({
        ...construct stream with initialModel...
      })
      modelStream.onValue(function(model) {
        // next time when reloading occurs, the .onLoad state will receive this model
        // -> state is propagated 
        lrApi.setState(model)
        React.render(...model...)
      })
    })
    
In this example, React component don't have any own state - they are just 
dummy components rendering whatever they are told to render. When events 
occur, they modify the global state by using `items.js` global API.
 
The `Items` object handles all the business logic with BaconJS streams and
that stream will produce new values when the state changes. To store that
state, we use `.setState` just before re-render (in `site.js`). 

`window.onload` handler has been replaced with `lrApi.onLoad` method so
that reloading event can construct the proper stream from the latest state.

Note that this loop enables the isomorphic application development. In 
this example the initial user interface is actually pre-rendered by the
server (confirm it by yourself by disabling JavaScript from you browser)!
