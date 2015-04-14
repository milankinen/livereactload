
var React       = require('react'),
    Bacon       = require('baconjs'),
    lrapi       = require('livereactload-api'),

    Application = require('./public/application'),
    items       = require('./public/items')



window.onload = function() {
  initApp(window.INITIAL_MODEL)
}

function initApp(model) {
  var modelStream = Bacon.combineTemplate({
    items: items._items(model.items || []),
    editedItem: items._editedItem()
  })

  modelStream.onValue(function(model) {
    lrapi.setState(model)
    React.render(<Application {...model} />, document.getElementById('app'))
  })
}


// live reloading
lrapi.onReload(function() {
  initApp(lrapi.getState() || window.INITIAL_MODEL)
})
