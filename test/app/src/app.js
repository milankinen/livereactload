import React from "react"
import Counter from "./counter"
import {MAGIC} from "./constants"

require("./hooks")

export default React.createClass({
  render() {
    return (
      <div>
        <h1 className="header">Hello world</h1>
        <p className="magic">Magic number is {MAGIC}</p>
        <Counter name="foo" />
      </div>
    )
  }
})
