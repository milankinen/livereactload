const {info} = require("./console")

const {isPlainObj, values} = require("../common")

export default function applyPatch(scope$$, patch) {
  const React = require("react")

  // by default, we must reload all files from batch
  patch.forEach(p => p.active = numChildren(p) || 1)

  info("Apply patch")
  patch.forEach(({src, file, parents, active}) => {
    if (active) {
      // TODO how to handle new modules?
      const {require, module, exports} = scope$$.modules[file]
      const __reload = new Function("require", "module", "exports", src)
      console.log(" > Patch ::", file)
      __reload(require, module, exports)

      if (isStoppable(module, React)) {
        preventPropagation(parents)
      }
    } else {
      // this will prevent propagation to ancestor files
      preventPropagation(parents)
    }
  })
  info("Patch complete")

  function preventPropagation(parents) {
    parents.forEach(p => {
      const parent = patch.find(({file}) => file === p)
      if (parent) {
        parent.active--
      }
    })
  }

  function numChildren({file}) {
    return patch.filter(({parents}) => parents.find(p => p === file)).length
  }
}

function isStoppable(module, React) {
  if (module instanceof React.Component) {
    return isProxied(module)
  } else if (isPlainObj(module)) {
    return !!values(module).find(isProxied)
  }
  return false
}

function isProxied(o) {
  return o && !!o.__reactPatchProxy
}
