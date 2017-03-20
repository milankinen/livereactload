import React from "react"
import {render} from "react-dom"
import {AppContainer} from "babel-hot-loader"
import App from "./src/app"

const initialModel = window.INITIAL_MODEL

render(<AppContainer><App {...initialModel} /></AppContainer>, document.getElementById("app"))
