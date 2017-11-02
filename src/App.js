import React, { Component } from 'react';
import loadSvgToImgSrc from './load-svg-to-img-src'

class App extends Component {
  constructor () {
    super()
  }
  componentDidMount () {
    loadSvgToImgSrc(this.img, '/sorted-paths.json')
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
