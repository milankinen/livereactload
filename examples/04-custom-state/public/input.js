
var React           = require('react'),
    PureRenderMixin = require('react/addons').addons.PureRenderMixin,
    items           = require('./items')

module.exports = React.createClass({
  mixins: [PureRenderMixin],

  handleSubmit: function(e) {
    e.preventDefault()
    items.addItem(this.props.value)
    items.updateEditedItem('')
  },

  onChange: function(e) {
    items.updateEditedItem(e.target.value)
  },


  render: function() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input onChange={this.onChange} value={this.props.value} />
        <button disabled={!this.props.value}>Add item</button>
      </form>
    )
  }
})
