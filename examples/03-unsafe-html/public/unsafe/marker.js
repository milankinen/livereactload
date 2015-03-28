var React = require('react')

module.exports = React.createClass({

  componentDidMount: function() {
    var gmaps = google.maps

    var marker = new gmaps.Marker({ position: new gmaps.LatLng(this.props.lat, this.props.lng)})
    var info = new gmaps.InfoWindow({ content: '' })

    google.maps.event.addListener(marker, 'click', function() {
      if (this.props.map) info.open(this.props.map, marker)
    }.bind(this));

    this.setState({marker: marker, info: info, map: this.state ? this.state.map : null})
  },

  componentWillUnmount: function() {
    if (this.state) {
      if (this.state.marker) {
        google.maps.event.clearListeners(this.state.marker, 'click')
        this.state.marker.setMap(null)
        this.state.marker = null
      }
      if (this.state.info) {
        this.state.info.close()
        this.state.info = null
      }
    }
  },

  componentDidUpdate: function() {
    var gmaps = google.maps
    var state = this.state || {}
    if (state.info) {
      // a little bit hackish way to transform vdom content to the
      // unsafe html but works amazingly well
      state.info.setContent(React.findDOMNode(this).innerHTML)
    }
    if (state.marker) {
      state.marker.setPosition(new gmaps.LatLng(this.props.lat, this.props.lng))
    }

    // map instance is not always present so this is necessary
    if (!state.map && this.props.map && state.marker) {
      state.marker.setMap(this.props.map)
      state.map = this.props.map   // do not trigger events
    }
  },

  render: function() {
    return <div style={{display: 'none'}}>{this.props.children}</div>
  }

})
