
var React = require('react')

module.exports = React.createClass({
  render: function() {
    return (
      <ul>
        {this.props.items.map(function(it) { return <li>item : {it}</li> })}
      </ul>
    )
  }
})
