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
    },
    notifyBundleError(error) {
      if (wss.clients.length) {
        log("Notify clients about bundle error...")
      }
      wss.clients.forEach(client => {
        client.send(JSON.stringify({
          type: "bundle_error",
          data: { error: error.toString() }
        }))
      })
    }
  }

  wss.on("connection", client => {
    log("New client connected")
  })

  return server
}
