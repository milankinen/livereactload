
const {pairs} = require("../common")

export default function notifyClients(clients, newModules) {
  const hashes =
    pairs(newModules)
      .reduce((acc, [file, {hash}]) => ({...acc, [file]: hash}), {})

  const diffQuery = {type: "diff", data: {hashes}}
  clients.forEach(client => {
    client.__modules = newModules
    client.send(JSON.stringify(diffQuery))
  })
}
