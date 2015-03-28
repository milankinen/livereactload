
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

/*
 * Try to comment out these lines, type some value to the input field (don't press the
 * "Add item" button). Then make some modifications. Your value disappears!
 *
 * This happens because LiveReactload does not know about these classes (they are
 * not exposed by global module.exports), thus they are entirely re-created during
 * the reload event.
 *
 * With API method .expose(cls, uniqueId) you can expose these anonymous classes
 * so that LiveReact will be aware of them and can save the previous state during
 * reload events.
 *
 * If LiveReactload transformation is disabled, then this method does nothing. So
 * it can be left to the production code safely. Recommended usage is (since state
 * and immutability is desired):
 *
 *    var List = lrapi.expose(React.createClass({...}))
 */
List = lrapi.expose(List, 'some_unique_id_for_example_List')
Input = lrapi.expose(Input, 'some_unique_id_for_example_Input')


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
