const React = require("react"),
      App   = require("./.src/app")

// we are requiring redux here even though it's not used because
// redux 3.0.0 contains some dependencies that are de-duplicated
// by Browserify, thus breaking all the time -- we can get most
// of these bugs caught by adding this require (the tests get broken
// when dedupe handling gets broken)
require("redux")

const {render} = require("react-dom")

console.log("Increment site.js reload counter...")
window._siteReloadCounter = "_siteReloadCounter" in window ? window._siteReloadCounter + 1 : 0


const MyApp = React.createClass({
  render() {
    return window._siteReloadCounter === 0 ? <App /> : (
      <div>
        This text should never occur because propagation guards should
        stop reloading to app.js
      </div>
    )
  }
})

render(<MyApp />, document.getElementById("app"))
