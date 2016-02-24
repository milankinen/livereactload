import express from "express"
import React from "react"
import {renderToString} from "react-dom/server"
import Application from "./src/app"

const app = express()

app.get("/", (req, res) => {
  const model = {
    counter1: 10000,
    counter2: -100000
  }
  res.send(`<!DOCTYPE html>
  <html>
    <head>
      <title>2.x basic usage</title>
    </head>
    <body>
      <div id="app">${renderToString(<Application {...model} />)}</div>
      <script type="text/javascript">
        window.INITIAL_MODEL = ${JSON.stringify(model)};
      </script>
      <script type="text/javascript" src="/static/bundle.js"></script>
    </body>
  </html>`)
})

app.get("/static/bundle.js", function(req, res) {
  res.sendFile("bundle.js", {root: __dirname})
})

app.listen(3000)
