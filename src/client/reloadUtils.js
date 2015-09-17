
const {keys, values, extend, sortBy, pairs} = require("../common")

export function patchMetaData(scope$$, newModules, newFileMap) {
  const {modules, fileMap, exports} = scope$$

  keys(newModules).forEach(file => {
    if (modules[file]) {
      extend(modules[file], newModules[file])
    } else {
      modules[file] = newModules[file]
    }
  })
  keys(modules).forEach(file => {
    if (!newModules[file]) {
      delete exports[file]
      delete modules[file]
    }
  })
  extend(fileMap, newFileMap)
  keys(fileMap).forEach(file => {
    if (!newFileMap[file]) {
      delete fileMap[file]
    }
  })
}


export function diff(modules, newModules, newFileMap) {
  const changedModules =
    values(newModules).filter(hasModuleChanged)

  // resolve reverse dependencies so that we can calculate
  // weights for correct reloading order
  const dependencies = {}
  function resolveDeps(mod) {
    const deps = values(mod.deps)
    dependencies[mod.id] = deps
    deps.forEach(d => {
      if (!dependencies[d]) resolveDeps(newModules[newFileMap[d]])
    })
  }
  resolveDeps(newModules["$entry$"])

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
      .map(([id]) => newModules[newFileMap[id]])
      .filter(module => !!module)
      .map(module => ({
        ...module,
        changed: !!hasChanged[module.id],
        parents: parents[module.id] || [],
        isNew: !modules[newFileMap[module.id]]
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

  function hasModuleChanged({file, hash}) {
    return !modules[file] || modules[file].hash !== hash
  }
}
