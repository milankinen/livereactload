const {getForceUpdate, createProxy} = require("react-proxy")

export default function babelPluginLiveReactload({filename, components, imports, locals}) {
  const [React] = imports
  const forceUpdate = getForceUpdate(React)

  return function applyProxy(Component, uniqueId) {
    const {displayName, isInFunction = false} = components[uniqueId]
    const proxies = getProxies()

    if (!proxies || isInFunction) {
      return Component
    }

    const id = filename + "$$" + uniqueId
    if (!proxies[id]) {
      const proxy = createProxy(Component)
      proxies[id] = proxy
      return proxy.get()
    } else {
      console.log(" > Patch component :: ", displayName || uniqueId)
      const proxy = proxies[id]
      const instances = proxy.update(Component)
      setTimeout(() => instances.forEach(forceUpdate), 0)
      return proxy.get()
    }
  }
}

function getProxies() {
  try {
    if (typeof window !== "undefined") {
      return window.__lrproxies$$ = window.__lrproxies$$ || {}
    } else {
    }
  } catch (ignore) {
  }
}
