const React = require("react"),
      App   = require("./src/app")

const initialModel = window.INITIAL_MODEL

React.render(<App {...initialModel} />, document.getElementById("app"))
