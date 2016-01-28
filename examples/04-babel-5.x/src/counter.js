import React from "react"
import {blueish} from "./styles"


export default class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {value: props.initialValue || 0}
  }


  componentDidMount() {
    const self = this
    tick()

    function tick() {
      const {step, interval} = self.props
      self.setState({
        value: self.state.value + step,
        interval: setTimeout(tick, interval)
      })
    }
  }

  componentWillUnmount() {
    clearTimeout(this.state.interval)
  }

  render() {
    return (
      <h1 style={blueish}>{this.state.value}</h1>
    )
  }
}
