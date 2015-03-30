var express = require('express'),
    fs      = require('fs')


var app = express()

app.get('/', function(req, res) {
  res.send('<!DOCTYPE html>'
  + '<html>'
  + '<head><title>LiveReactload basic example</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.4/css/bootstrap.css"></head>'
  + '<body><div id="app"></div><script type="text/javascript" src="/static/bundle.js"></script></body>'
  + '</html>')
})

app.get('/static/bundle.js', function(req, res) {
  res.send(fs.readFileSync('static/bundle.js'))
})

app.listen(3000)
