const React   = require("react"),
      Counter = require("./counter"),
      {MAGIC} = require("./constants")

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
