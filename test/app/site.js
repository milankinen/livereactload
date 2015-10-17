const React = require("react"),
      App   = require("./.src/app")

// we are requiring redux here even though it's not used because
// redux 3.0.0 contains some dependencies that are de-duplicated
// by Browserify, thus breaking all the time -- we can get most
// of these bugs caught by adding this require (the tests get broken
// when dedupe handling gets broken)
require("redux")

const {render} = require("react-dom")

render(<App />, document.getElementById("app"))
