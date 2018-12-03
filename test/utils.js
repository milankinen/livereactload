import Promise from "bluebird";
import chokidar from "chokidar";
import fs from "fs";
import { resolve } from "path";
import * as sh from "shelljs";

export function startServer() {
  execInApp("mkdir -p .src && rm -rf .src/* && cp -R src/* .src");
  //execInApp("mkdir -p node_modules && rm -rf node_modules/livereactload")
  //execInApp("npm i")
  execInApp("npm run bundle:vendor");
  return execInApp("npm start", { async: true });
}

export function execInApp(cmd, opts) {
  return sh.exec(`cd ${resolve(__dirname, "app")} && ${cmd}`, opts);
}

export function wait(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export function updateSources(browser, files) {
  const promises = files.map(
    ({ file, find, replace }) =>
      new Promise((res, rej) => {
        const filename = resolve(__dirname, "app/.src", file);
        const watcher = chokidar.watch(filename, {
          persistent: false,
          usePolling: true,
          interval: 100
        });

        watcher.on("change", () => {
          watcher.close();
          res();
        });
        watcher.on("error", e => {
          watcher.close();
          rej(e);
        });
        watcher.on("ready", () => {
          console.log("Update source file", file);
          const content = fs.readFileSync(filename).toString();
          const newContent = content.replace(find, replace);
          fs.writeFileSync(filename, newContent);
        });
      })
  );

  return Promise.all(promises)
    .timeout(1000)
    .then(() => wait(1000))
    .then(() => browser.wait(100));
}
