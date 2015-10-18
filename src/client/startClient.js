const WebSocket = require("ws"),
      {info}    = require("./console")


const noop = () => {}

export default function startClient(scope$$, onMsg) {
  if (!scope$$.ws) {
    const url = makeHostUrl(scope$$)
    info("Connect reload client to " + url)

    const ws = new WebSocket(url)
    ws.onopen = () => info("WebSocket client listening for changes...")

    ws.onmessage = m => {
      const msg = JSON.parse(m.data)
      const res = (onMsg[msg.type] || noop)(msg)
      if (res) {
        ws.send(JSON.stringify(res))
      }
    }

    scope$$.ws = ws
  }
}

function makeHostUrl({options: {host, port}}) {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws"
  return `${protocol}://${host}:${port}`
}
