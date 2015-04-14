
var React = require('react'),
    lrapi = require('livereactload-api')


var List = React.createClass({
  render: function() {
    return (
      <ul>
        {this.props.items.map(function(it) { return <li>item : {it}</li> })}
      </ul>
    )
  }
})

var Input = React.createClass({

  getInitialState: function() {
    return { text: '', ok: false }
  },

  handleSubmit: function(e) {
    e.preventDefault()
    if (this.props.onAdd(this.state.text)) {
      this.setState({text: '', ok: false})
    }
  },

  onChange: function(e) {
    this.setState({text: e.target.value, ok: !!e.target.value})
  },


  render: function() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input onChange={this.onChange} value={this.state.text} />
        <button disabled={!this.state.ok}>Add item</button>
      </form>
    )
  }
})

module.exports = React.createClass({

  getInitialState: function() {
    return {items: []}
  },

  addItem: function(itemName) {
    this.setState({items: this.state.items.concat([itemName])})
    return true
  },

  render: function() {
    return (
      <div>
        <h1>To-do manager</h1>
        <Input onAdd={this.addItem} />
        <List items={this.state.items} />
      </div>
    )
  }

})
