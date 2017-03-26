import React from "react"
import Header from "./header"
import Body from "./body"

class Root extends React.Component {
    render() {
        return (
            <div>
                <Header />
                <Body />
            </div>
        )
    }
}

export default Root
