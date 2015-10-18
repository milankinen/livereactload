
export const MSG = "foo"

window._acceptReloaded = false

if (module.onReload) {
  module.onReload(() => {
    window._acceptReloaded = true
    return true
  })
}
