const {Server}  = require("ws"),
      {log}     = require("./console"),
      makePatch = require("./makePatch")

const {pairs} = require("../common")

export function startServer({port}, cache) {
  let modules = {}
  const wss = new Server({port})

  log("reload server started")

  const server = {
    notifyReload() {
      modules = cache.modules
      const hashes = pairs(modules).reduce((acc, [file, {hash}]) => ({...acc, [file]: hash}), {})

      if (wss.clients.length) {
        log("notify clients about bundle change")
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
    log("new client connected")

    client.on("message", data => {
      const msg = JSON.parse(data)
      if (msg.type === "diff") {
        const patch = makePatch(modules, msg.data)
        if (patch) {
          log("found changed to reload", ...msg.data)
          client.send(JSON.stringify({type: "patch", data: patch}))
        }
      }
    })
  })

  return server
}
