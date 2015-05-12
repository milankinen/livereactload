'use strict';


module.exports = function cloneObject(obj) {
  var clone = {}
  for(var i in obj) {
    clone[i] = obj[i]
  }
  return clone
}
