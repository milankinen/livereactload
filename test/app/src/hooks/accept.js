
export const MSG = "foo"

window._acceptReloaded = window._acceptReloaded || false

if (module && module.hot) {
  module.hot.onUpdate(() => {
    window._acceptReloaded = true
    return true
  })
}
