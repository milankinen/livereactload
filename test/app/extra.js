import React from "react"

import Root from "./.src/extra/root"

class Box extends React.Component {
  constructor(props) {
    super(props);
    this.Root = Root;
    module.hot.onUpdate(()=>{
      if (this.Root) {
          this.Root = require('./.src/extra/root').default;
          this.forceUpdate();
          return true;
      } else {
        return false;
      }
    })
  }

  componentWillUnmount() {
    this.Root = false;
  }
  render() {
    return <this.Root/>
  }
}

module.exports = {
  Box
}
