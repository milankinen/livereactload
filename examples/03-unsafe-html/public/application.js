
var React = require('react'),
    Map   = require('./map'),
    Input = require('./input')


module.exports = React.createClass({

  getInitialState: function() {
    return {items: []}
  },

  addItem: function(itemName) {
    this.setState({items: this.state.items.concat([ { 
      name: itemName,
      offsetLat: Math.random() * 0.05,
      offsetLng: Math.random() * 0.05
    }])})
    return true
  },

  render: function() {
    return (
      <div>
        <h1>Marker manager</h1>
        <Input onAdd={this.addItem} />
        <Map items={this.state.items} />
      </div>
    )
  }

})
