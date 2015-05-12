
var React           = require('react'),
    PureRenderMixin = require('react/addons').addons.PureRenderMixin

module.exports = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    return (
      <ul>
        {this.props.items.map(function(it) { return <li>item : {it}</li> })}
        <li>item : {this.props.edited}</li>
      </ul>
    )
  }
})
