
var React         = require('react'),
    Modal         = require('react-bootstrap').Modal,
    ModalTrigger  = require('react-bootstrap').ModalTrigger

module.exports = React.createClass({

  getInitialState: function() {
    return { text: '', modalOpen: false }
  },

  handleSubmit: function(e) {
    e.preventDefault()
    if (this.props.onAdd(this.state.text)) {
      this.setState({text: '', modalOpen: false})
    }
  },

  onChange: function(e) {
    this.setState({text: e.target.value, modalOpen: this.state.modalOpen})
  },

  showModal: function() {
    this.setState({text: this.state.text, modalOpen: true})
  },

  hideModal: function() {
    this.setState({text: this.state.text, modalOpen: false})
  },

  render: function() {
    return (
      <div>
        <button disabled={this.state.modalOpen} onClick={this.showModal}>New item</button>
        {this.state.modalOpen ?
          <Modal title='Add new item'
                 bsStyle='primary'
                 backdrop={false}
                 animation={false}
                 show={this.state.modalOpen}
                 onRequestHide={this.hideModal}>
            <div className='modal-body'>
              <form onSubmit={this.handleSubmit}>
                <input onChange={this.onChange} value={this.state.text} />
                <button>Add</button>
              </form>
            </div>
          </Modal>
          : ''
        }
      </div>
    )
  }
})
