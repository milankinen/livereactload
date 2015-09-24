const clc = require("cli-color")

export function log(msg, ...data) {
  const t = /T([0-9:.]+)Z/g.exec(new Date().toISOString())[1]
  console.log(
    clc.green(`[${t}] LiveReactload`),
    "::",
    clc.cyan(msg)
  )
  data.forEach(d => console.log(clc.yellow("  >"), clc.yellow(d)))
}
