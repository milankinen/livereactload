const express = require("express"),
      app     = express()

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
  <html>
    <head></head>
    <body>
      <div id="app"></div>
      <script type="text/javascript" src="/static/bundle.js"></script>
    </body>
  </html>`)
})

app.get("/static/bundle.js", function(req, res) {
  res.sendFile("bundle.js", {root: __dirname})
})

app.listen(3077, () => {
  console.log("Server started")
})
