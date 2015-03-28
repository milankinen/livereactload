
var React  = require('react'),
    GMap   = require('./unsafe/gmap'),
    Marker = require('./unsafe/marker')


module.exports = React.createClass({

  render: function() {
    return (
      <div style={{position: 'absolute', top: 150, width: 600, height: 500}}>
        <GMap>
          {this.props.items.map(toMarker)}
        </GMap>
      </div>
    )

    function toMarker(item) {
      var pos = {lat: 60.2058215 + item.offsetLat, lng: 24.8819948 + item.offsetLng}
      return <Marker lat={pos.lat} lng={pos.lng}>{item.name}</Marker>
    }
  }
})
