
var React = require('react')

export default class Input extends React.Component {

  constructor(props) {
    super(props)
    this.state = { text: '', ok: false }
  }

  handleSubmit(e) {
    e.preventDefault()
    if (this.props.onAdd(this.state.text)) {
      this.setState({text: '', ok: false})
    }
  }

  onChange(e) {
    this.setState({text: e.target.value, ok: !!e.target.value})
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <input onChange={this.onChange.bind(this)} value={this.state.text} />
        <button disabled={!this.state.ok}>Add item</button>
      </form>
    )
  }
}
