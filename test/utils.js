const Promise  = require("bluebird"),
      chokidar = require("chokidar"),
      fs       = require("fs")

const {resolve} = require("path")
const {exec} = require("shelljs")

console.log(resolve(__dirname, "app/src/*"))
export function startServer() {
  execInApp("mkdir -p .src && rm -rf .src/* && cp src/* .src")
  execInApp("mkdir -p node_modules && rm -rf node_modules/livereactload")
  execInApp("npm i")
  return execInApp("npm start", {async: true})
}


export function execInApp(cmd, opts) {
  return exec(`cd ${resolve(__dirname, "app")} && ${cmd}`, opts)
}

export function await(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

export function updateSources(browser, files) {
  const p = new Promise((res, rej) => {
    const watcher = chokidar.watch(resolve(__dirname, "app/bundle.js"), {
      persistent: false,
      usePolling: true,
      interval: 100
    })

    watcher.on("change", () => {
      watcher.close()
      res()
    })
    watcher.on("error", e => {
      watcher.close()
      rej(e)
    })
    watcher.on("ready", () => {
      files.forEach(({file, find, replace}) => {
        console.log("Update source file", file)
        const filename = resolve(__dirname, "app/.src", file)
        const content = fs.readFileSync(filename).toString()
        const newContent = content.replace(find, replace)
        fs.writeFileSync(filename, newContent)
      })
    })
  })

  return p.then(() => await(1000)).then(() => browser.wait(100))
}
