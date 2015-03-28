
var React       = require('react'),
    Application = require('./public/application')

window.onload = function() {
  React.render(<Application />, document.getElementById('app'))
}
