var express = require("express"),
    app     = express()

app.get("/", function (req, res) {
  res.send("<!DOCTYPE html>" +
  "<html>" +
    "<head>" +
      "<title>2.x build systems</title>" +
    "</head>" +
    "<body>" +
      "<div id='app'></div>" +
      "<script type='text/javascript' src='/static/bundle.js'></script>" +
    "</body>" +
  "</html>")
})

app.get("/static/bundle.js", function (req, res) {
  res.sendFile("bundle.js", {root: __dirname})
})

app.listen(3000)
