const startClient  = require("./startClient"),
      handleChange = require("./handleChange"),
      {info}       = require("./console")

export default function client() {
  const scope$$ = window.__livereactload$$
  startClient(scope$$, {
    change(msg) {
      info("Bundle changed")
      handleChange(scope$$, msg.data)
    },
    patch(msg) {
    }
  })
}
