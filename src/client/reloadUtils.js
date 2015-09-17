
const {keys, values, extend, sortBy, pairs} = require("../common")

export function patchMetaData(scope$$, newModules, newFileMap) {
  const {modules, fileMap} = scope$$

  keys(newModules).forEach(file => {
    if (modules[file]) {
      extend(modules[file], newModules[file])
    } else {
      modules[file] = newModules[file]
    }
  })
  extend(fileMap, newFileMap)
}


export function diff(modules, newModules, newFileMap) {
  const changedModules =
    values(newModules).filter(hasChanged)

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
  changedModules.forEach(({id}) => addWeightsStartingFrom(id, weights, parents))

  const modulesToReload =
    sortBy(pairs(weights), ([_, weight]) => weight)
      .map(([id]) => newModules[newFileMap[id]])
      .filter(module => !!module)
      .map(module => ({...module, parents: parents[module.id] || []}))

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

  function hasChanged({file, hash}) {
    return !modules[file] || modules[file].hash !== hash
  }
}
