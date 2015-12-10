import React from "react"

const systems = [
  'Gulp',
  'Grunt'
]

export default class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Hello!</h1>
        <ul>{systems.map(s => <li>{s}</li>)}</ul>
      </div>
    )
  }
}

