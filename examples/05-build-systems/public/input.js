
var React = require('react')

module.exports = React.createClass({

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
