import React from "react"
import App from "./app"

const MyApp = React.createClass({
    render() {
        return window._siteReloadCounter === 0 ? <App /> : (
                <div>
                    This text should never occur because LiveReactLoad should stop reload
                    propagation if module returns only React components (like src/app.js does).
                </div>
            )
    }
})

export default MyApp