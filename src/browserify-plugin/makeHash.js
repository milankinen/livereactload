const crypto = require("crypto")

export default function calculateHash(sources) {
  const md5sum = crypto.createHash('md5')
  md5sum.update(sources)
  return md5sum.digest('hex')
}
