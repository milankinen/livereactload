const through       = require("through2"),
      {resolve}     = require("path"),
      {startServer} = require("./reloadServer"),
      injectClient  = require("./injectClient")

const {values} = require("../common")


export default function LiveReactloadPlugin(b, opts) {
  // server and cache are alive as long as watchify is running
  const cache  = {},
        server = startServer({port: 4455}, cache)

  b.transform(injectClient)
  b.on("reset", addHooks)
  addHooks()

  function addHooks() {
    // this cache object is preserved over single bundling
    // pipeline so when next bundling occurs, this cache
    // object is thrown away
    cache.modules = {}

    b.pipeline.get("syntax").push(through.obj(
      function transform(module, enc, next) {
        if (!isGlobalModule(module.file)) {
          // if hash is not found, then this is probably browserify's shim module
          // => no point to cache it
          const hash = extractHash(module.source)
          if (hash) {
            // update module meta data in cache
            const m = getModule(module.file)
            m.src = module.source
            m.hash = hash
            m.deps = values(module.deps).filter(d => !isGlobalModule(d))
          }
        }
        next(null, module)
      },
      function flush(next) {
        server.notifyReload()
        next()
      }
    ))

    function getModule(file) {
      return (cache.modules[file] = cache.modules[file] || { file, src: "", hash: null, deps: [] })
    }
  }
}

function isGlobalModule(moduleFilename) {
  // assuming that livereload package is in global mdule directory (node_modules)
  // and this file is in ./lib/babel-plugin folder
  return moduleFilename.indexOf(resolve(__dirname, '../../..')) !== -1
}

function extractHash(src) {
  const match = /"__lrhash\$\$:([0-9a-z]+)"/g.exec(src)
  return match && match[1]
}
