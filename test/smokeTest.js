import test from "tape"
import Browser from "zombie"
import {startServer, wait, updateSources} from "./utils"

const server = startServer()
const browser = new Browser()

test("smoke tests", assert => {
  wait(10000)
    .then(() => (
      browser.visit("http://localhost:3077/")
        .then(() => wait(500))
        .then(() => browser.pressButton("button.inc"))
    ))
    .then(testInitialConditions)
    .then(testSingleFileUpdatingTriggersReload)
    .then(testReloadPropagationToParentModule)
    .then(testMultipleUpdatesAreAggregatedIntoOneReload)
    .then(testOnReloadHook)
    .then(() => assert.end() || process.exit(0))
    .finally(() => server.kill())
    .timeout(40000)
    .catch(e => console.error(e) || process.exit(1))
    .done()


  function testInitialConditions() {
    assert.comment("test that initial page contents are satified")
    browser.assert.success()
    browser.assert.text(".header", "Hello world")
    browser.assert.text(".counter-title", "Counter 'foo' value is 11")
  }


  function testSingleFileUpdatingTriggersReload() {
    assert.comment("test that single file updating triggers the reloading")
    const updateSrcP =
      updateSources(browser, [
        {
          file: "app.js",
          find: "Hello world",
          replace: "Tsers!"
        }
      ])
    return updateSrcP
      .then(() => {
        browser.assert.text(".header", "Tsers!")
      })
  }


  function testReloadPropagationToParentModule() {
    assert.comment("test that reloading propagates to parent modules if exports is not a React component")
    const updateSrcP =
      updateSources(browser, [
        {
          file: "constants.js",
          find: "10",
          replace: "1337"
        }
      ])
    return updateSrcP
      .then(() => {
        browser.assert.text(".magic", "Magic number is 1337")
      })
  }


  function testMultipleUpdatesAreAggregatedIntoOneReload() {
    assert.comment("test that multiple file updates are aggregated to single reload event")
    const updateSrcP =
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
    return updateSrcP
      .then(() => browser.pressButton("button.inc"))
      .then(() => {
        // result: 11 - 3 = 8, see counter.js
        browser.assert.text(".counter-title", "Counter 'bar' value is 8")
      })
  }

  function testOnReloadHook() {
    assert.comment("test onReload hook initial conditions")
    assert.equals(browser.window._hooksReloadCount, 0)
    assert.equals(browser.window._acceptReloaded, false)
    assert.equals(browser.window._noAcceptReloaded, false)

    return testNoAcceptPropagatesReloadToParent().then(testAcceptDoesntPropagateReloadToParent)

    function testNoAcceptPropagatesReloadToParent() {
      assert.comment("test that if onReload hook does't return true, then reloading is propagated to the parent module")
      const updateSrcP =
        updateSources(browser, [
          {
            file: "hooks/noAccept.js",
            find: "foo",
            replace: "bar"
          }
        ])
      return updateSrcP
        .then(() => {
          assert.equals(browser.window._noAcceptReloaded, true)
          assert.equals(browser.window._hooksReloadCount, 1)
        })
    }

    function testAcceptDoesntPropagateReloadToParent() {
      assert.comment("test that if onReload hook returns true, then reloading doesn't propagate to the parent module")
      const updateSrcP =
        updateSources(browser, [
          {
            file: "hooks/accept.js",
            find: "foo",
            replace: "bar"
          }
        ])
      return updateSrcP
        .then(() => {
          assert.equals(browser.window._acceptReloaded, true)
          assert.equals(browser.window._hooksReloadCount, 1)
        })
    }
  }

})

