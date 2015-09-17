
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
  const parents = {}
  values(newModules).forEach(({id, deps}) => {
    keys(deps).forEach(dep => {
      parents[dep] = [id, ...(parents[dep] || [])]
    })
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


  function addWeightsStartingFrom(file, weights, parents) {
    const visited = {}
    weightRecur(file, 1)
    function weightRecur(file, w) {
      if (visited[file]) {
        // prevent circular dependency stack overflow
        return
      }
      const dependants = parents[file] || []
      visited[file] = true
      weights[file] = (weights[file] || 0) + w
      dependants.forEach(d => weightRecur(d, weights[file] + 1))
    }
  }

  function hasChanged({file, hash}) {
    return !modules[file] || modules[file].hash !== hash
  }
}
