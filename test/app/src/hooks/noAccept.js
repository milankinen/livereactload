export const MSG = "foo"

window._noAcceptReloaded = window._noAcceptReloaded || false

if (module && module.hot) {
  module.hot.onUpdate(() => {
    window._noAcceptReloaded = true
    return false
  })
}
