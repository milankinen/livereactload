const through       = require("through2"),
      {startServer} = require("./reloadServer"),
      makeHash      = require("./makeHash")

const {readFileSync} = require("fs")
const {resolve, dirname, basename} = require("path")
const {values} = require("../common")


export default function LiveReactloadPlugin(b, opts = {}) {
  const {
    port = 4474,
    host = "localhost",
    client = true
    } = opts

  // server is alive as long as watchify is running
  const server = opts.server !== false ? startServer({port: Number(port)}) : null
  const requireOverride = readFileSync(resolve(__dirname, "../requireOverride.js")).toString()

  const clientOpts = {
    port: Number(port),
    host: host.toString()
  }

  b.on("reset", addHooks)
  addHooks()

  function addHooks() {
    // this cache object is preserved over single bundling
    // pipeline so when next bundling occurs, this cache
    // object is thrown away
    const modules = {}

    const bundleInitJs =
      `var require = ${requireOverride};

       window.__livereactload$$ = {
         require: require,
         modules: modules,
         exports: {},
         reloaders: {},
         initModules: initModules
       };

       initModules();

       function initModules() {
         var allExports = window.__livereactload$$.exports;
         var modules    = window.__livereactload$$.modules;
         // initialize Browserify compatibility
         Object.keys(modules).forEach(function(id) {
           modules[id][0] = (function(require, module, exports) {
             if (!modules[id].__inited) {
               modules[id].__inited = true
               var __init = new Function("require", "module", "exports", modules[id].source);
               var _require = (function() { return require.apply(require, Array.prototype.slice.call(arguments).concat(id)); });
               __init(_require, module, exports, arguments[3], arguments[4], arguments[5], arguments[6]);
             }
           })
           modules[id][1] = modules[id].deps;
         })
       }`

    let originalEntry = ""
    let entryId = -1

    // task of this hook is to override the default entry so that
    // the new entry
    b.pipeline.get("record").push(through.obj(
      function transform(row, enc, next) {
        const {entry, file} = row
        if (entry) {
          originalEntry = file
          next(null)
        } else {
          next(null, row)
        }
      },
      function flush(next) {
        const origFilename = basename(originalEntry),
              origDirname  = dirname(originalEntry)

        const newEntryPath = resolve(origDirname, "___livereactload_entry.js")
        const newEntrySource = []

        if (client !== false) {
          const args = [`null`, JSON.stringify(clientOpts)]
          if (client !== true) {
            const customClient = `require(${JSON.stringify(client)}, entryId$$)`
            args.push(customClient)
          }
          newEntrySource.push(`require("livereactload/client", entryId$$).call(${args.join()});`)
        }

        newEntrySource.push(`require(${JSON.stringify("./" + origFilename)}, entryId$$);`)

        this.push({
          entry: true,
          expose: false,
          file: newEntryPath,
          id: newEntryPath,
          source: newEntrySource.join("\n"),
          nomap: true,
          order: 0
        })
        next()
      }
    ))

    b.pipeline.get("label").push(through.obj(
      function transform(row, enc, next) {
        const {id, index, dedupeIndex, file, source, deps, entry} = row
        if (entry) {
          entryId = id
        }
        modules[id] = {
          id,
          index,
          dedupeIndex,
          file,
          source,
          deps,
          entry,
          hash: makeHash(source)
        }
        next(null, row)
      },
      function flush(next) {
        next()
      }
    ))

    b.pipeline.get("wrap").push(through.obj(
      function transform(row, enc, next) {
        next(null)
      },
      function flush(next) {
        const bundleSrc =
          `(function(modules, entryId$$) {
             ${bundleInitJs}
             (function() {
               ${modules[entryId].source}
             })();
           })(${JSON.stringify(modules, null, 2)}, ${JSON.stringify(entryId)});`
        this.push(new Buffer(bundleSrc, "utf8"))
        if (server) {
          server.notifyReload({modules, entryId})
        }
        next()
      }
    ))
  }
}

function isGlobalModule(moduleFilename) {
  // assuming that livereload package is in global mdule directory (node_modules)
  // and this file is in ./lib/babel-plugin folder
  return moduleFilename.indexOf(resolve(__dirname, '../../..')) !== -1
}
