
export const MSG = "foo"

window._noAcceptReloaded = false

if (module.hot) {
  module.hot.accept(() => {
    window._noAcceptReloaded = true
    return false
  })
}
