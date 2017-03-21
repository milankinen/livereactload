import patch from "react-hot-loader/patch"
import React from "react"
import { render } from "react-dom"
import Root from "./.src/root"

try {
  window._clockMaker = require('clockmaker');
} catch (err) {
  console.warn('Clockmaker not found!');
}

// we are requiring redux here even though it's not used because
// redux 3.0.0 contains some dependencies that are de-duplicated
// by Browserify, thus breaking all the time -- we can get most
// of these bugs caught by adding this require (the tests get broken
// when dedupe handling gets broken)
require("redux")


console.log("Increment site.js reload counter...")
window._siteReloadCounter = "_siteReloadCounter" in window ? window._siteReloadCounter + 1 : 0

render(<Root />, document.getElementById("app"))

module.hot.onUpdate(()=>{
  const Component = require("./.src/root").default;
  render( <Component />, document.getElementById("app"))
  return true;
})