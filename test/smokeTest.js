const test    = require("tape"),
      Browser = require("zombie")

const {startServer, await, updateSources} = require("./utils")

const server = startServer()
const browser = Browser.create()

test("tsers", assert => {
  await(5000)
    .then(() => (
      browser.visit("http://localhost:3077/")
        .then(() => await(500))
        .then(() => browser.pressButton("button.inc"))
    ))
    .then(() => {
      // test initial page contents
      browser.assert.success()
      browser.assert.text(".header", "Hello world")
      browser.assert.text(".counter-title", "Counter 'foo' value is 11")
    })
    .then(() => (
      // test that single file update triggers reloading
      updateSources(browser, [
        {
          file: "app.js",
          find: "Hello world",
          replace: "Tsers!"
        }
      ])
    ))
    .then(() => {
      browser.assert.text(".header", "Tsers!")
    })
    .then(() => (
      // test that change is propagated to the parent module if all exports
      // are not proxied React components
      updateSources(browser, [
        {
          file: "constants.js",
          find: "10",
          replace: "1337"
        }
      ])
    ))
    .then(() => {
      browser.assert.text(".magic", "Magic number is 1337")
    })
    .then(() => (
      // test that updating multiple files will reload modules correctly
      updateSources(browser, [
        {
          file: "counter.js",
          find: "+ 1",
          replace: "- 3"
        },
        {
          file: "app.js",
          find: "foo",
          replace: "bar"
        }
      ])
    ))
    .then(() => (
      // press increment button after increment function change => result = 11 - 3 = 8
      browser.pressButton("button.inc")
    ))
    .then(() => {
      browser.assert.text(".counter-title", "Counter 'bar' value is 8")
    })
    .then(() => assert.end() || process.exit(0))
    .finally(() => server.kill())
    .timeout(30000)
    .catch(e => console.error(e) || process.exit(1))
    .done()
})
