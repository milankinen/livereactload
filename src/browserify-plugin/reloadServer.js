const {Server}  = require("ws"),
      {log}     = require("./console"),
      makePatch = require("./makePatch")

const {pairs} = require("../common")

export function startServer({port}) {
  const wss = new Server({port})

  log("Reload server up and listening...")

  const server = {
    notifyReload({modules, fileMap}) {
      if (wss.clients.length) {
        log("Notify clients about bundle change...")
      }
      wss.clients.forEach(client => {
        client.send(JSON.stringify({
          type: "change",
          data: {modules, fileMap}
        }))
      })
    }
  }

  wss.on("connection", client => {
    log("New client connected")
  })

  return server
}
