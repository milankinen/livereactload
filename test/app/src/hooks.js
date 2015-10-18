
require("./hooks/accept")
require("./hooks/noAccept")

if ("_hooksReloadCount" in window) {
  window._hooksReloadCount = window._hooksReloadCount + 1
} else {
  window._hooksReloadCount = 0
}

