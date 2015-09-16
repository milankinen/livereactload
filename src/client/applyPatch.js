const {info} = require("./console")

export default function applyPatch(scope$$, patch) {
  info("Apply patch")
  patch.forEach(({src, file, hash}) => {
    // TODO how to handle new modules?
    const {require, module, exports} = scope$$.modules[file]
    const __reload = new Function("require", "module", "exports", src)
    __reload(require, module, exports)
    console.log(" > Patched ::", file)
  })
}
