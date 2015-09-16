const startClient = require("./startClient"),
      resolveDiff = require("./resolveDiff"),
      applyPatch  = require("./applyPatch"),
      {info}      = require("./console"),
      extractHash = require("../extractHash"),
      getScope    = require("../getScope")


export default function client(initFn, require, module, exports, hash, file) {
  const scope$$ = getScope()
  scope$$.modules[file] = {file, require, module, exports, hash: extractHash(hash)}
  startClient(scope$$, {
    change(msg) {
      info("Bundle changed")
      const diff = resolveDiff(scope$$, msg.data)
      if (diff) {
        return {type: "diff", data: diff}
      }
    },
    patch(msg) {
      applyPatch(scope$$, msg.data)
    }
  })

  // this actually evaluates the module
  initFn(require, module, exports)
}
