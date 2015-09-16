const React = require("react")


const myStyle = {
  "color": "blue"
}

export default React.createClass({
  getInitialState() {
    return {value: 0}
  },

  componentDidMount() {
    const self = this
    tick()

    function tick() {
      const {step, interval} = self.props
      self.setState({
        value: this.state.value + step,
        interval: setTimeout(tick, interval)
      })
    }
  },

  componentWillUnmount() {
    clearTimeout(this.state.interval)
  },

  render() {
    return (
      <h1 style={myStyle}>{this.state.value}</h1>
    )
  }
})
