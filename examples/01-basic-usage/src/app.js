const React   = require("react"),
      Counter = require("./counter")

export default React.createClass({
  render() {
    return (
      <div>
        <Counter key="1" step={100} interval={150} />
        <Counter key="2" step={1000} interval={1000} />
      </div>
    )
  }
})

