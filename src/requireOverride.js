(function() {
  require.__byId = __byId
  return require

  function require(name) {
    const scope$$ = window.__livereactload$$
    const myId = arguments.length > 1 ? arguments[arguments.length - 1] : null
    return __byId(moduleKey(scope$$, myId, name), false)
  }

  function __byId(id, isReload) {
    const oldRequire = typeof window.require === "function" ? window.require : null
    const scope$$ = window.__livereactload$$
    const _module = findModule(scope$$, id)

    if (_module) {
      scope$$.exports[_module.id] = !isReload ? scope$$.exports[_module.id] || {} : {}
      const exports = scope$$.exports[_module.id]
      const mod = {
        exports,
        onReload(fn) {
          scope$$.reloaders[_module.file] = fn
        }
      }
      // TODO: there should be still one argument to pass.. figure out which is it
      const oldReloader = scope$$.reloaders[_module.file]
      _module[0].apply(this, [require, mod, exports, _module[0], scope$$.modules, scope$$.exports])
      scope$$.exports[_module.id] = mod.exports

      if (isReload && typeof oldReloader === "function") {
        const accept = oldReloader.call()
        if (accept === true) {
          throw {accepted: true}
        }
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

  // resolve module so that de-duplicated modules are skipped and the
  // original module is returned
  function findModule({modules}, id) {
    const mod = modules[id]
    if (mod) {
      if (mod.dedupeIndex) {
        let orig = null
        Object.keys(modules).forEach(id => {
          if (modules[id].index === mod.dedupeIndex) {
            orig = findModule({modules}, id)
          }
        })
        return orig
      } else {
        return mod
      }
    }
  }
})()
