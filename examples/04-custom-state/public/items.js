
var Bacon = require('baconjs')


module.exports = new Items()

function Items() {
  var itemAdditions = new Bacon.Bus(),
      editedItem    = new Bacon.Bus()


  this._items = function(initialItems) {
    return itemAdditions.scan(initialItems, function(items, added) {
      return items.concat([added])
    })
  }

  this._editedItem = function() {
    return editedItem.toProperty('')
  }


  this.updateEditedItem = function(itemText) {
    editedItem.push(itemText)
  }

  this.addItem = function(itemText) {
    itemAdditions.push(itemText)
  }
}
