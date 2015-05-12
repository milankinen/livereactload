
var cloneObject = require('./clone-object')

module.exports = {
  init: function(lrload) {
    var reactHotApi    = require('react-hot-api'),
        makeExportsHot = require('./make-exports-hot'),
        makeHot        = reactHotApi(function() { return [] })

    lrload.hotClassesById  = {}
    lrload._makeExportsHot = lrload._makeExportsHot || function(id, mod, ignored) {
      return makeExportsHot(mod, lrload.React, id, makeHot, ignored || [])
    }

    lrload.exposeClass = function(lrload, clz, id) {
      var mod = {exports: clz}
      lrload._makeExportsHot(id, mod)
      lrload.hotClassesById[id] = mod.exports
      return mod.exports
    }

    lrload.reactWithHotClasses = function(lrload, file) {
      var React = cloneObject(lrload.React)

      React.createClass = function(classDef) {
        var id  = getId(file, classDef),
            clz = lrload.React.createClass(classDef)

        if (id) {
          var mod = {exports: clz}
          lrload._makeExportsHot(id, mod)
          lrload.hotClassesById[id] = mod.exports
          return mod.exports
        } else {
          return clz
        }
      }

      return React
    }


    lrload.makeExportsHot = function(lrload, mod, file) {
      var fileClasses = []
      for(var id in lrload.hotClassesById) {
        if (id && id.indexOf(file + ':') === 0) {
          fileClasses.push(lrload.hotClassesById[id])
        }
      }

      var ignored = []
      if (mod.exports) {
        if (contains(fileClasses, mod.exports)) ignored.push(mod.exports)
        for (var key in mod.exports) {
          if (mod.exports.hasOwnProperty(key) && contains(fileClasses, mod.exports[key])) ignored.push(mod.exports[key])
        }
      }
      lrload._makeExportsHot(file + '__module_exports', mod, ignored)
    }

  }
}

function contains(col, val) {
  for (var i = 0 ; i < col.length ; i++) {
    if (col[i] === val) return true
  }
  return false
}

function getId(file, classDef) {
  var classId = classDef ? classDef.displayName : null
  if (classId) {
    return file + ':' + classId
  } else {
    return null
  }
}
