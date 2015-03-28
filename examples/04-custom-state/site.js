
var React       = require('react'),
    Bacon       = require('baconjs'),
    lrapi       = require('livereactload-api'),

    Application = require('./public/application'),
    items       = require('./public/items')


lrapi.onLoad(function(state) {
  var initial = state || window.INITIAL_MODEL
  var modelStream = Bacon.combineTemplate({
    items: items._items(initial.items || []),
    editedItem: items._editedItem()
  })

  modelStream.onValue(function(model) {
    lrapi.setState(model)
    React.render(<Application {...model} />, document.getElementById('app'))
  })
})

