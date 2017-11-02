import React, { Component } from 'react';
import loadSvg from './load-svg'

class App extends Component {
  constructor () {
    super()
  }
  componentDidMount () {
    loadSvg(this.img, '/sorted-paths.json')
  }
  render() {
    return <div>
      <img
        alt="vector star"
        ref={ref => this.img = ref}
        src=""
        style={{width: '100vw', height: '100vh'}}
        />
    </div>
  }
}

export default App;
