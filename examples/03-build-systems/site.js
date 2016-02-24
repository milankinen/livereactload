import React from "react"
import { render } from "react-dom"
import App from "./src/app"

const initialModel = window.INITIAL_MODEL

render(<App {...initialModel} />, document.getElementById("app"))
