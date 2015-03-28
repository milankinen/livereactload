require('babel/register')

var express = require('express'),
    fs      = require('fs'),
    React   = require('react'),

    Application = require('./public/application')


// this could be fetched e.g. from the database
var initialModel = {
  items: ['tsers'],
  editedItem: ''
}

var app = express()

app.get('/', function(req, res) {
  res.send('<!DOCTYPE html>'
  + '<html>'
  + '<head><title>LiveReactload basic example</title></head>'
  + '<body>'
  + '  <script>window.INITIAL_MODEL = ' + JSON.stringify(initialModel) + ';</script>'
  + '  <div id="app">' + render(initialModel) + '</div>'
  + '  <script type="text/javascript" src="/static/bundle.js"></script>'
  + '</body>'
  + '</html>')
})

app.get('/static/bundle.js', function(req, res) {
  res.send(fs.readFileSync('static/bundle.js'))
})

app.listen(3000)

function render(model) {
  return React.renderToString(React.createElement(Application, model))
}
