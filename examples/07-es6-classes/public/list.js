
var React = require('react')

export default class List extends React.Component {
  render() {
    return (
      <ul>
        {this.props.items.map(function(it) { return <li>item : {it}</li> })}
      </ul>
    )
  }
}
