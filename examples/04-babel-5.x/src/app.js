import React from "react"
import Counter from "./counter"
import {reddish} from "./styles"

const {Component} = React

export default class App extends Component {
  render() {
    const {counter1, counter2} = this.props   // see site.js and server.js
    return (
      <div>
        <Header />
        <Counter
          initialValue={counter1}
          step={100}
          interval={150} />
        <Counter
          initialValue={counter2}
          step={10}
          interval={100} />
        <Footer />
      </div>
    )
  }
}

// LiveReactload supports also non-exported "inner" classes!
class Header extends Component {
  render() {
    return (
      <h1 style={reddish}>Tsers!!!</h1>
    )
  }
}

// as well as old React.createClass({...}) syntax!
const Footer = React.createClass({
  render() {
    return (
      <footer>
        <p>---</p>
        <p>Try to change the code on-the-fly!</p>
      </footer>
    )
  }
})
