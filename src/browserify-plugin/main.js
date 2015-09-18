const through       = require("through2"),
      {startServer} = require("./reloadServer"),
      makeHash      = require("./makeHash")

const {readFileSync} = require("fs")
const {resolve, dirname, basename} = require("path")
const {values} = require("../common")


export default function LiveReactloadPlugin(b, opts = {}) {
  // server is alive as long as watchify is running
  const server = startServer({port: 4455})
  const requireOverride = readFileSync(resolve(__dirname, "../requireOverride.js")).toString()

  b.on("reset", addHooks)
  addHooks()

  function addHooks() {
    // these cache object are preserved over single bundling
    // pipeline so when next bundling occurs, these cache
    // objects are thrown away
    const modules = {},
          fileMap = {}

    let originalEntry = ""

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
        const newEntrySource =
          `var require =
            ${requireOverride};

           window.__livereactload$$ = {
             require: require,
             modules: modules,
             exports: {},
             fileMap: fileMap
           };
           require("livereactload/client").call();
           require(${JSON.stringify("./" + origFilename)});`

        this.push({
          entry: true,
          expose: false,
          file: newEntryPath,
          id: newEntryPath,
          source: newEntrySource,
          order: 0
        })
        next()
      }
    ))

    b.pipeline.get("label").push(through.obj(
      function transform(row, enc, next) {
        const {id, file, source, deps, entry} = row
        fileMap[id] = file
        modules[entry ? "$entry$" : file] = {
          id,
          file,
          source,
          deps,
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
          `(function() {
             var modules = ${JSON.stringify(modules, null, 2)};
             var fileMap = ${JSON.stringify(fileMap, null, 2)};
             ${modules["$entry$"].source};
           })();`
        this.push(new Buffer(bundleSrc, "utf8"))
        server.notifyReload({modules, fileMap})
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
