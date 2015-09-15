
const {sortBy, pairs} = require("../common")

export default function makePatch(client, {diff = []}) {
  const {__modules: modules} = client
  const scores = {}

  if (modules && diff.length > 0) {
    diff.forEach(scoreDependencyTree)
    const patch =
      sortBy(pairs(scores), ([_, score]) => score)
        .map(([file]) => modules[file])
        .filter(mod => !!mod)
        .map(({file, src, deps, hash}) => ({file, src, deps, hash}))
    return patch
  }

  function scoreDependencyTree(file) {
    const visited = {}
    scoreRecursive(file, 1)
    function scoreRecursive(file, score) {
      if (visited[file]) {
        return
      }
      visited[file] = true
      scores[file] = (scores[file] || 0) + score

      const dependants = modules[file].dependants || []
      dependants.forEach(function (d) {
        scoreRecursive(d, scores[file] + 1)
      })
    }
  }
}
