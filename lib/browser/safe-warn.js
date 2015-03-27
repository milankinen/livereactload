'use strict';

module.exports = function warn(msg) {
  try {
    (function() { console.log(msg); })();
  } catch (ignore) { }
}
