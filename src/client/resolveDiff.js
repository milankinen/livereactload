
const {pairs, values} = require("../common")

export default function resolveDiff(scope$$, hashes) {
  const prevHashes =
    values(scope$$.modules).reduce((h, {file, hash}) => ({...h, [file]: hash}), {})

  const diff =
    pairs(hashes)
      .filter(([file, hash]) => prevHashes[file] !== hash)
      .map(([file]) => file)

  return diff.length ? diff : null
}
