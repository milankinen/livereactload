import {getForceUpdate, createProxy} from "react-proxy"

module.exports = function babelPluginLiveReactload({filename, components, imports, locals}) {
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
      return mark(proxy.get())
    } else {
      console.log(" > Patch component :: ", displayName || uniqueId)
      const proxy = proxies[id]
      const instances = proxy.update(Component)
      setTimeout(() => instances.forEach(forceUpdate), 0)
      return mark(proxy.get())
    }
  }
}

function mark(Component) {
  if (!Component.__$$LiveReactLoadable) {
    Object.defineProperty(Component, '__$$LiveReactLoadable', {
      configurable: false,
      writable: false,
      enumerable: false,
      value: true
    })
  }
  return Component
}

function getProxies() {
  try {
    if (typeof window !== "undefined") {
      return (window.$$LiveReactLoadProxies = window.$$LiveReactLoadProxies || {})
    }
  } catch (ignore) {
  }
}
