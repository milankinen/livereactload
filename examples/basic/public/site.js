
var React       = require('react'),
    reactload   = require('livereactload-api'),
    Application = require('./application')

// when livereactload plugin is enabled, this function handles the reloading logic
// otherwise this is same as window.onload
reactload.onLoad(function() {
  React.render(<Application />, document.getElementById('app'))
})

