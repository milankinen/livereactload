
let webdriver = require('webdriverio'),
    testCase  = require('./util/livereactload-test-case')

let {expectHtmlFrom, toContainText} = require('./util/expect')


testCase('ES6 classes', '07-es6-classes', (helpers, done) => {
  function rebundle() {
    helpers.rebundle({preProcess: '-t babelify'})
  }

  rebundle()
  var options = { desiredCapabilities: { browserName: 'firefox' } }
  webdriver
    .remote(options)
    .init()
    .url('http://localhost:3000')
    .setValue('input', 'lolbal')
    .click('button')
    .pause(100)
    .execute(expectHtmlFrom, 'ul', toContainText('item : lolbal'))
    .call(() => helpers.replaceTextFromFile('list.js', 'item :', 'item -'))
    .call(rebundle)
    .call(helpers.notify)
    .pause(2000)
    .execute(expectHtmlFrom, 'ul', toContainText('item - lolbal'))
    .end(done)
}, [ '0.13.2' ])
