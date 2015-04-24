var express = require('express'),
    fs      = require('fs')


var app = express()

app.get('/', function(req, res) {
  res.send('<!DOCTYPE html>'
  + '<html>'
  + '<head><title>LiveReactload ES6 class example</title></head>'
  + '<body><div id="app"></div><script type="text/javascript" src="/static/bundle.js"></script></body>'
  + '</html>')
})

app.get('/static/bundle.js', function(req, res) {
  res.send(fs.readFileSync('static/bundle.js'))
})

app.listen(3000)
