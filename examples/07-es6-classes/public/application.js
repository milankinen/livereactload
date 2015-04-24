
var React = require('react'),
    List  = require('./list'),
    Input = require('./input')

export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {items: []}
  }

  addItem(itemName) {
    this.setState({items: this.state.items.concat([itemName])})
    return true
  }

  render() {
    return (
      <div>
        <h1>To-do manager</h1>
        <Input onAdd={this.addItem.bind(this)} />
        <List items={this.state.items} />
      </div>
    )
  }

}
