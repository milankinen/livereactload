
export const MSG = "foo"

window._acceptReloaded = false

if (module.hot.accept) {
  module.hot.accept(() => {
    window._acceptReloaded = true
    return true
  })
}
