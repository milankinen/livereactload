
const {sortBy, pairs, values} = require("../common")

export default function makePatch(modules, diff = []) {
  if (diff.length) {

    // resolve reverse dependencies so that we can calculate
    // weights for correct reloading order
    const parents = {}
    values(modules).forEach(({file, deps}) => {
      deps.forEach(dep => {
        parents[dep] = [file, ...(parents[dep] || [])]
      })
    })

    // idea behind weighting: each file has initial weight = 1
    // each file gets also the sum of its dependency weights
    // finally files are sorted by weight => smaller ones must
    // be reloaded before their dependants (bigger weights)
    const weights = {}
    diff.forEach(d => addWeightsStartingFrom(d, weights, parents))

    const patch =
      sortBy(pairs(weights), ([_, weight]) => weight)
        .map(([file]) => modules[file])
        .filter(module => !!module)
        .map(module => ({...module, parents: parents[module.file] || []}))

    return patch
  }

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
}
