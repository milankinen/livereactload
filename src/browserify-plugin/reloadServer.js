const {Server}  = require("ws"),
      {log}     = require("./console"),
      makePatch = require("./makePatch")

const {pairs} = require("../common")

export function startServer({port}, cache) {
  let modules = {}
  const wss = new Server({port})

  log("Reload server up and listening...")

  const server = {
    notifyReload() {
      modules = cache.modules
      const hashes = pairs(modules).reduce((acc, [file, {hash}]) => ({...acc, [file]: hash}), {})

      if (wss.clients.length) {
        log("Notify clients about bundle change...")
      }
      wss.clients.forEach(client => {
        client.send(JSON.stringify({
          type: "change",
          data: hashes
        }))
      })
    }
  }

  wss.on("connection", client => {
    log("New client connected")

    client.on("message", data => {
      const msg = JSON.parse(data)
      if (msg.type === "diff") {
        const patch = makePatch(modules, msg.data)
        if (patch) {
          log("Found changes to reload", ...msg.data)
          client.send(JSON.stringify({type: "patch", data: patch}))
        }
      }
    })
  })

  return server
}
