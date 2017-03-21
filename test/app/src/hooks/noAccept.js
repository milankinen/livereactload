
export const MSG = "foo"

window._noAcceptReloaded = false

if (module && module.hot) {
  module.hot.onUpdate(() => {
    window._noAcceptReloaded = true
    return false
  })
}
