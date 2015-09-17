(function() {
  return require

  function require(name) {
    const oldRequire = typeof window.require === "function" ? window.require : null
    const scope$$ = window.__livereactload$$
    const {modules, exports} = scope$$

    const myId = arguments.length > 1 ? arguments[arguments.length - 1] : null
    const key = moduleKey(scope$$, myId, name)

    const _module = modules[key],
          _export = exports[key]

    if (_export) {
      // already cached
      return _export
    } else if (_module) {
      // not yet cached, must evaluate first
      const ___init = new Function("require", "module", "exports", _module.source)
      const _newExports = {},
            _newModule  = {exports: _newExports},
            _require    = (function(...args) { return require(...[...args, _module.id])})
      // evaluate module and cache exports
      ___init(_require, _newModule, _newExports)
      exports[key] = _newModule.exports
      return _newModule.exports
    } else if (oldRequire) {
      return oldRequire(...arguments)
    } else {
      const e = new Error("Module not found: " + name)
      e.code = "MODULE_NOT_FOUND"
      throw e
    }
  }
  function moduleKey({modules, fileMap}, callerId, name) {
    if (callerId === null) {
      // ___livereactload_entry.js requiring the "real" entry file
      const {deps} = modules["$entry$"]
      return fileMap[deps[name]]
    } else {
      // normal requires
      const {deps = {}} = modules[fileMap[callerId]] || {}
      return fileMap[deps[name]]
    }
  }
})()
