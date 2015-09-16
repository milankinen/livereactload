const through  = require("through2"),
      makeHash = require("./makeHash")

export default function injectClientTransform(file) {
  return through.obj(
    function transform(src, enc, next) {
      const source = src.toString(),
            hash   = "{{__lrhash$$:" + makeHash(source) + "}}"

      next(null, makeInjectedSource(source, file, hash))
    },
    function finish(next) {
      next()
    }
  )
}

function makeInjectedSource(src, file, hash) {
  const injected =
    "require = require(\"livereactload/client\")" +
    `(require, module, exports, ${JSON.stringify(hash)}, ${JSON.stringify(file)});` +
    src
  return injected
}
