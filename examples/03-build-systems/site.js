import React from "react"
import App from "./src/app"

const initialModel = window.INITIAL_MODEL

React.render(<App {...initialModel} />, document.getElementById("app"))
