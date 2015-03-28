# Private React components with LiveReactload

This example demonstrates how to deal with anonymous React components (components
that are not assigned to `module.exports`) so that you can use live code editing
with them.

## Problem

By default, LiveReactload scans the `module.exports` at the end of the each module
and tries to search React components from that. You can either assign you component
directly 

    module.exports = <your-component>
    
or you can assign multiple components with object

    module.exports = {
      FirstComponent: <your-1st-component>,
      SecondComponent: <your-2nd-component>,
      ...
    }
    
Both approaches are fine and they are managed automatically by LiveReactload.
However, there may be cases where you want to create a private Component that
is not exposed with `module.exports`. 

In this case, LiveReactload has no way to detect that component. This means that
when the next reload event occurs, React does not recognize the new class, thus
removing the previous one and replacing it with the new one => your state is lost.

## Solution

**[LiveReactload API](https://www.npmjs.com/package/livereactload-api)** has a helper
function `.expose` that provides a way to expose private classes to LiveReactload. 
After using that method, React can manage also private class state propagations 
correctly.
    
First you must install API package with
    
    npm install --save livereactload-api
    
### .expose(cls, id)
    
    var List = lrApi.expose(React.createClass({...}), 'PrivateList')
    
    module.exports = React.createClass({
      render: function() {
        return (
          <div>
            <List items={this.props.items} />
          </div>
        )
      }
    })

Note that id is mandatory and it **must be unique**. You can for example use 
`__dirname` to ensure uniqueness.

If LiveReactload transformer is not set, then this method does nothing.


## In action

To see custom exposing (or lacking of it) in action, open `public/application.js`
and add comments to expose lines - you'll see what happens to the input fields.
