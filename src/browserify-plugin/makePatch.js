
const {sortBy, pairs, values} = require("../common")

export default function makePatch(modules, diff = []) {
  if (diff.length) {

    // resolve reverse dependencies so that we can calculate
    // weights for correct reloading order
    const reverseDependencies = {}
    values(modules).forEach(({file, deps}) => {
      deps.forEach(dep => {
        reverseDependencies[dep] = [file, ...(reverseDependencies[dep] || [])]
      })
    })

    // idea behind weighting: each file has initial weight = 1
    // each file gets also the sum of its dependency weights
    // finally files are sorted by weight => smaller ones must
    // be reloaded before their dependants (bigger weights)
    const weights = {}
    diff.forEach(d => addWeightsStartingFrom(d, weights, reverseDependencies))

    const patch =
      sortBy(pairs(weights), ([_, weight]) => weight)
        .map(([file]) => modules[file])
        .filter(module => !!module)

    return patch
  }

  function addWeightsStartingFrom(file, weights, reverseDependencies) {
    const visited = {}
    weightRecur(file, 1)
    function weightRecur(file, w) {
      if (visited[file]) {
        // prevent circular dependency stack overflow
        return
      }
      const dependants = reverseDependencies[file] || []
      visited[file] = true
      weights[file] = (weights[file] || 0) + w
      dependants.forEach(d => weightRecur(d, weights[file] + 1))
    }
  }
}
