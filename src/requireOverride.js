(function() {
  require.__byId = __byId
  return require

  function require(name) {
    const scope$$ = window.__livereactload$$
    const myId = arguments.length > 1 ? arguments[arguments.length - 1] : null
    return __byId(moduleKey(scope$$, myId, name))
  }

  function __byId(id) {
    const oldRequire = typeof window.require === "function" ? window.require : null
    const scope$$ = window.__livereactload$$
    const _module = scope$$.modules[id]

    if (_module) {
      const exports = {}
      const mod = {exports}
      // TODO: there should be still one argument to pass.. figure out which is it
      _module[0].apply(this, [require, mod, exports, _module[0], scope$$.modules, scope$$.exports])
      if (scope$$.exports[_module.id]) {
        scope$$.exports[_module.id].exports = mod.exports
      } else {
        scope$$.exports[_module.id] = mod
      }
      return mod.exports
    } else if (oldRequire) {
      return oldRequire(...arguments)
    } else {
      const e = new Error("Module not found: " + name)
      e.code = "MODULE_NOT_FOUND"
      throw e
    }
  }

  function moduleKey({modules}, callerId, name) {
    const {deps = {}} = modules[callerId] || {}
    return deps[name]
  }
})()
