import React from "react"

export default React.createClass({
  getInitialState() {
    return {value: 10}
  },

  increment() {
    this.setState({value: this.state.value + 1})
  },

  render() {
    return (
      <div>
        <h2 className="counter-title">
          Counter '{this.props.name}' value is {this.state.value}
        </h2>
        <button className="inc" onClick={this.increment}>+</button>
      </div>
    )
  }
})
