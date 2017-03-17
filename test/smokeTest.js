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
    .then(testStandaloneBundleReload)
    .then(testCircularDepsGetReloaded)
    .then(testReloadPropagationToParentModule)
    .then(testMultipleUpdatesAreAggregatedIntoOneReload)
    .then(testOnReloadHook)
    .then(() => assert.end() || process.exit(0))
    .finally(() => server.kill())
    .timeout(40000)
    .catch(e => console.error(e) || process.exit(1))
    .done()


  function testInitialConditions() {
    assert.comment("test that initial page contents are satisfied")
    browser.assert.success()
    browser.assert.text(".header", "Hello world")
    browser.assert.text(".counter-title", "Counter 'foo' value is 11")
    browser.assert.text(".extra-body", "Extra body!!")
    browser.assert.text(".circular", "lolbal!!")
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


  function testStandaloneBundleReload() {
    assert.comment("test that changes from standalone bundle gets reloaded")
    const updateSrcP =
      updateSources(browser, [
        {
          file: "extra/body.js",
          find: "Extra body",
          replace: "Extra mod-body"
        }
      ])
    return updateSrcP
      .then(() => {
        browser.assert.text(".extra-body", "Extra mod-body!!")
      })
  }


  function testCircularDepsGetReloaded() {
    assert.comment("test that changes to circular dependencies get reloaded correctly")
    const updateSrcP =
      updateSources(browser, [
        {
          file: "circular/second.js",
          find: "!!",
          replace: "??"
        }
      ])
    return updateSrcP
      .then(() => {
        browser.assert.text(".circular", "lolbal??")
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
    assert.comment("test reload/accept hook initial conditions")
    assert.equals(browser.window._hooksReloadCount, 0)
    assert.equals(browser.window._acceptReloaded, false)
    assert.equals(browser.window._noAcceptReloaded, false)

    return testNoAcceptPropagatesReloadToParent().then(testAcceptDoesntPropagateReloadToParent)

    function testNoAcceptPropagatesReloadToParent() {
      assert.comment("test that if reload/accept hook does't return true, then reloading is propagated to the parent module")
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
      assert.comment("test that if reload/accept hook returns true, then reloading doesn't propagate to the parent module")
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

