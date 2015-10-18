
export const MSG = "foo"

window._noAcceptReloaded = false

if (module.onReload) {
  module.onReload(() => {
    window._noAcceptReloaded = true
    return false
  })
}
