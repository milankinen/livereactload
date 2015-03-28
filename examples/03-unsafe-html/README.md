# Unsafe HTML reloading

React has an option to mix "unsafe HTML" (not in VirtualDOM) to the vdom.
However, here is a very high probability to hide the state to the DOM and
break livereloading entirely.

This example demonstrates that unsafe HTML can be used with LiveReactload
if the unsafe components can manage their state properly.

In the example, you can add markers to the UI. If you remove the `Map` 
component from `application.js` and add it again, you can see that markers
are re-added correctly but their popup-window status is lost.

But if the components are well designed, then using those with LiveReactload
does not differ from the VDOM managed components.
