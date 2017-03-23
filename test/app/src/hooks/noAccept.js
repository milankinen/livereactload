
export const MSG = "foo"

if (window._noAcceptReloaded === false) {
    window._noAcceptReloaded = true
} else {
    window._noAcceptReloaded = false
}

if (module && module.hot) {
  module.hot.onUpdate(() => {
    return false
  })
}
