const WebSocket = require("ws"),
      {info}    = require("./console")


export default function startClient(scope$$, onMsg) {
  if (!scope$$.ws) {
    const ws = new WebSocket("ws://localhost:4455")
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

function noop() {
}
