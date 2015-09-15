const {getForceUpdate, createProxy} = require("react-proxy")

export default function babelPluginLiveReactload({filename, components, imports, locals}) {
  console.log(filename, components, imports, locals)
  const [React] = imports
  const forceUpdate = getForceUpdate(React)

  return function applyProxy(Component, uniqueId) {
    const id = filename + "$$" + uniqueId
    console.log("apply", filename, id)

    const proxies = window.__reactProxies = window.__reactProxies || {}
    if (!proxies[id]) {
      const proxy = createProxy(Component)
      proxies[id] = proxy
      return proxy.get()
    } else {
      const proxy = proxies[id]
      const instances = proxy.update(Component)
      setTimeout(() => instances.forEach(forceUpdate), 0)
      return proxy.get()
    }
  }
}
