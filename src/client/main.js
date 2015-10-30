const startClient  = require("./startClient"),
      handleChange = require("./handleChange"),
      {info}       = require("./console")

export default function client(opts, start = startClient) {
  const scope$$ = window.__livereactload$$
  scope$$.options = opts
  start(scope$$, {
    change(msg) {
      info("Bundle changed")
      handleChange(scope$$, msg.data)
    },
    patch(msg) {
    }
  })
}
