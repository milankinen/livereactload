'use strict';

module.exports = function warn() {
  var args = Array.prototype.slice.call(arguments)
  try {
    (function() {
      var fn = console.warn || console.warning || console.log
      fn.apply(console, args)
    })();
  } catch (ignore) { }
}
