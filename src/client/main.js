const WebSocket   = require("ws"),
      resolveDiff = require("./resolveDiff"),
      applyPatch  = require("./applyPatch")

export default function client(callback, require, module, exports, initialHash, filename) {
  const $scope = window.__lrload$$ = window.__lrload$$ || {hashes: {}, moduleInfo: {}}
  storeHash($scope, filename, initialHash)
  storeModuleInfo($scope, filename, {require, module, exports})
  startWebSocketClient($scope)
  callback(require, module, exports)
}

function storeHash($scope, filename, hash) {
  $scope.hashes[filename] = hash.replace("__lrhash$$:", "")
}

function storeModuleInfo($scope, filename, info) {
  $scope.moduleInfo[filename] = info
}

function startWebSocketClient($scope) {
  if (!$scope.ws) {
    const ws = new WebSocket("ws://localhost:4455")
    ws.onopen = () => {
      console.log("LiveReactload :: WebSocket client listening for changes...")
    }
    ws.onmessage = msg => {
      const event = JSON.parse(msg.data)
      console.log(
        "LiveReactload :: New Event\n",
        "  -- ", event
      )

      if (event.type === "diff") {
        const diff = resolveDiff($scope, event.data)
        ws.send(JSON.stringify({type: "diff-resolved", data: {diff}}))
      } else if (event.type === "patch") {
        applyPatch($scope, event.data)
      }
    }

    $scope.ws = ws
  }
}
