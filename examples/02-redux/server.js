const express = require("express"),
      React   = require("react"),
      app     = express()

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
  <html>
    <head>
      <title>2.x Flux with redux</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="text/javascript" src="/static/bundle.js"></script>
    </body>
  </html>`)
})

app.get("/static/bundle.js", function(req, res) {
  res.sendFile("bundle.js", {root: __dirname})
})

app.listen(3000)
