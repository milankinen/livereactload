import {Server} from "ws"
import {log} from "./console"
import https from 'https';
import {readFileSync} from 'fs';

function logError(error) {
  if (error) {
    log(error)
  }
}

export function startServer({port, sslKey, sslCert}) {
  if ((sslCert && !sslKey) || (!sslCert && sslKey)) {
    throw new Error('You need both a certificate AND key in order to use SSL');
  }

  let wss;
  if (sslCert && sslKey) {
    const key = readFileSync(sslKey, 'utf8');
    const cert = readFileSync(sslCert, 'utf8');
    const credentials = {key, cert};
    const server = https.createServer(credentials);
    server.listen(port);
    wss = new Server({server});
  } else {
    wss = new Server({port});
  }


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
        }), logError)
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
        }), logError)
      })
    }
  }

  wss.on("connection", client => {
    log("New client connected")
  })

  return server
}
