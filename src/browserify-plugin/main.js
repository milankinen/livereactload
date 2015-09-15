const through       = require("through2"),
      {Server}      = require("ws"),
      {resolve}     = require("path"),
      notifyClients = require("./notifyClients"),
      injectClient  = require("./injectClient"),
      makePatch     = require("./makePatch")

const {values} = require("../common")


export default function LiveReactloadPlugin(b, opts) {
  // this websocket server is alive as long as watchify is running
  const wss = new Server({port: 4455})
  wss.on("connection", client => {
    client.on("message", data => {
      const msg = JSON.parse(data)
      if (msg.type === "diff-resolved") {
        const patch = makePatch(client, msg.data)
        if (patch) {
          client.send(JSON.stringify({type: "patch", data: patch}))
        }
      }
    })
  })

  b.transform(injectClient)
  b.on("reset", addHooks)
  addHooks()

  function addHooks() {
    // this cache object is preserved over single bundling
    // pipeline so when next bundling occurs, this cache
    // object is thrown away
    const moduleCache = {}

    b.pipeline.get("syntax").push(through.obj(
      function transform(module, enc, next) {
        cacheModule(module)
        next(null, module)
      },
      function flush(next) {
        triggerReload()
        next()
      }
    ))

    function cacheModule(module) {
      // update reverse dependencies
      if (!isGlobalModule(module.file)) {
        values(module.deps)
          .forEach(dependency => {
            if (!isGlobalModule(dependency)) {
              const dep = getModule(dependency)
              dep.dependants.push(module.file)
            }
          })

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
    }

    function triggerReload() {
      notifyClients(wss.clients, moduleCache)
    }

    function getModule(file) {
      return (moduleCache[file] = moduleCache[file] || { file, dependants: [], src: "", hash: null, deps: [] })
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
