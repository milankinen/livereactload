import {Server} from "ws"
import {log} from "./console"
import {pairs} from "../common"

export function startServer({port}) {
  const wss = new Server({port})

  log("Reload server up and listening in port " + port + "...")

  const server = {
    notifyReload(metadata) {
      if (wss.clients.length) {
        log("Notify clients about bundle change...")
      }
      wss.clients.forEach(client => {
        client.send(JSON.stringify({
          type: "change",
          data: metadata
        }))
      })
    }
  }

  wss.on("connection", client => {
    log("New client connected")
  })

  return server
}
