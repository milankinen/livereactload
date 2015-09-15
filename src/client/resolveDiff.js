
const {pairs} = require("../common")

export default function resolveDiff($scope, {hashes}) {
  const {hashes: prevHashes} = $scope
  const diff =
    pairs(hashes)
      .filter(([file, hash]) => prevHashes[file] !== hash)
      .map(([file]) => file)

  return diff
}
