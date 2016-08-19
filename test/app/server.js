const express = require("express"),
      app     = express()

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
  <html>
    <head></head>
    <body>
      <div id="app"></div>
      <script type="text/javascript" src="/static/bundle.vendor.js"></script>
      <script type="text/javascript" src="/static/bundle.extra.js"></script>
      <script type="text/javascript" src="/static/bundle.app.js"></script>
    </body>
  </html>`)
});

(["vendor", "app", "extra"]).forEach(name => {
  app.get(`/static/bundle.${name}.js`, function(req, res) {
    res.sendFile(`bundle.${name}.js`, {root: __dirname})
  })
})


app.listen(3077, () => {
  console.log("Server started")
})
