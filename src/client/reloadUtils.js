
const {keys, values, extend, sortBy, pairs} = require("../common")

export function patchMetaData(scope$$, newModules) {
  const {modules, exports} = scope$$

  const oldModulesByFile = {}
  values(modules).forEach(mod => oldModulesByFile[mod.file] = mod)

  const rearrangedExports = {}
  keys(newModules).forEach(id => {
    const oldModule = oldModulesByFile[newModules[id].file]
    if (oldModule) {
      rearrangedExports[id] = exports[oldModule.id]
      newModules[id].__inited = true
    }
  })

  scope$$.exports = rearrangedExports
  scope$$.modules = newModules
  scope$$.initModules()
}


export function diff(modules, newModules, newEntryId) {
  const oldModulesByFile = {}
  values(modules).forEach(mod => oldModulesByFile[mod.file] = mod)

  const changedModules =
    values(newModules).filter(({entry, file, hash}) => {
      return !oldModulesByFile[file] || oldModulesByFile[file].hash !== hash
    })


  // resolve reverse dependencies so that we can calculate
  // weights for correct reloading order
  const dependencies = {}
  function resolveDeps(mod) {
    const deps = values(mod.deps)
    dependencies[mod.id] = deps
    deps.forEach(d => {
      if (!dependencies[d] && newModules[d]) resolveDeps(newModules[d])
    })
  }
  resolveDeps(newModules[newEntryId])

  const parents = {}
  pairs(dependencies).forEach(([id, deps]) => {
    deps.forEach(d => parents[d] = [id, ...(parents[d] || [])])
  })

  // idea behind weighting: each file has initial weight = 1
  // each file gets also the sum of its dependency weights
  // finally files are sorted by weight => smaller ones must
  // be reloaded before their dependants (bigger weights)
  const weights = {}
  const hasChanged = {}
  changedModules.forEach(({id}) => {
    hasChanged[id] = true
    addWeightsStartingFrom(id, weights, parents)
  })

  const modulesToReload =
    sortBy(pairs(weights), ([_, weight]) => weight)
      .map(([id]) => newModules[id])
      .filter(module => !!module && !module.entry)
      .map(module => ({
        ...module,
        changed: !!hasChanged[module.id],
        parents: parents[module.id] || [],
        isNew: !oldModulesByFile[module.file]
      }))

  return modulesToReload


  function addWeightsStartingFrom(id, weights, parents) {
    const visited = {}
    weightRecur(id, 1)
    function weightRecur(id, w) {
      if (visited[id]) {
        // prevent circular dependency stack overflow
        return
      }
      const dependants = parents[id] || []
      visited[id] = true
      weights[id] = (weights[id] || 0) + w
      dependants.forEach(d => weightRecur(d, weights[id] + 1))
    }
  }
}
