const React = require("react")

const {diff, patchMetaData} = require("./reloadUtils")
const {info, warn} = require("./console")
const {isPlainObj, values} = require("../common")

export default function handleChanges(scope$$, {modules: newModules, fileMap: newFileMap}) {
  const {modules, exports, require: __require} = scope$$

  const modulesToReload = diff(modules, newModules, newFileMap)
  patchMetaData(scope$$, newModules, newFileMap)

  if (modulesToReload.length === 0) {
    info("Nothing to patch")
    return
  }

  const patch = modulesToReload.map(mod => ({
    id: mod.id,
    file: mod.file,
    source: mod.source,
    reloadReqs: modulesToReload.filter(({parents}) => parents.find(p => p === mod.id)).length || 1,
    parents: mod.parents,
    isNew: typeof exports[mod.file] === "undefined"
  }))

  info("Apply patch")
  try {
    patch.forEach(({id, source, file, parents, reloadReqs, isNew}) => {
      if (reloadReqs) {
        if (isNew) {
          console.log(" > Add new module  ::", file)
        } else {
          console.log(" > Patch module    ::", file)
        }

        const _export  = !isNew ? exports[file] : {}
        const _module  = {exports: _export}
        const _require = (...args) => __require(...args, id)
        try {
          const __reload = new Function("require", "module", "exports", source)
          __reload(_require, _module, _export)
          exports[file] = _module.exports
        } catch (e) {
          console.error(e)
          warn("Abort patching")
          throw {aborted: true}
        }

        if (isStoppable(_module, React)) {
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
      const parent = patch.find(({id}) => id === p)
      if (parent) {
        parent.reloadReqs--
      }
    })
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
