const {info, warn} = require("./console")

const {isPlainObj, values} = require("../common")

export default function applyPatch(scope$$, patch) {
  const React = require("react")

  // by default, we must reload all files from batch
  patch.forEach(p => p.active = numChildren(p) || 1)

  info("Apply patch")
  try {
    patch.forEach(({src, file, parents, active}) => {
      if (active) {
        // TODO how to handle new modules?
        const {require, module, exports, hash} = scope$$.modules[file]
        console.log(" > Patch module    ::", file)
        try {
          const __reload = new Function("require", "module", "exports", src)
          __reload(require, module, exports)
        } catch (e) {
          console.error(e)
          warn("Abort patching")
          // we must recover hash to previous because module wasn't loaded completely
          // => there is old implementation still running (at least partially)
          scope$$.modules[file].hash = hash
          throw {aborted: true}
        }

        if (isStoppable(module, React)) {
          preventPropagation(parents)
        }
      } else {
        // this will prevent propagation to ancestor files
        preventPropagation(parents)
      }
    })
    info("Patching complete")
  } catch (e) {
    if (!e.aborted) {
      console.error(e)
    }
  }

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
