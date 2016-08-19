import React from "react"
import Header from "./.src/extra/header"
import Body from "./.src/extra/body"

class Box extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <Body />
      </div>
    )
  }
}

module.exports = {
  Box
}
