var React = require('react'),
    rlapi = require('livereactload-api')


var Map = rlapi.expose(React.createClass({
  componentDidMount: function() {
    var mapOptions = {
      center: {lat: 60.2058215, lng: 24.8819948},
      zoom: 12,
      draggable: false,
      zoomControl: false,
      scrollwheel: false,
      disableDoubleClickZoom: true
    }
    this.props.onMap(new google.maps.Map(React.findDOMNode(this), mapOptions))
  },

  render: function() {
    return <div className="map" style={{position: 'absolute', height: '100%', width: '100%'}} />
  }
}), 'Map')


module.exports = React.createClass({

  getInitialState: function() {
    return {map: null}
  },

  onMapMounted: function(map) {
    this.setState({map: map})
  },

  render: function() {
    var markers = this.state.map ? withMap(this.props.children, this.state.map) : this.props.children
    return (
      <div>
        <Map onMap={this.onMapMounted} />
        <div style={{position: 'absolute'}}>{markers}</div>
      </div>
    )

    function withMap(children, map) {
      return React.Children.map(children, function(child) {
        return React.cloneElement(child, {map: map, key: child.key})
      })
    }
  }

})

