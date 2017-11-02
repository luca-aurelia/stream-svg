import oboe from 'oboe'
import queryString from 'query-string'

// Holds a group of svg path objects. We keep them together because they'll all
// be rendered at the same time.
class Batch {
  static size () {
    if (Batch._size) {
      return Batch._size
    }
    Batch._size = Number(queryString.parse(window.location.search).batchSize) || 100
    console.log(`Rendering SVG paths in batches of size ${Batch._size}`)
    return Batch._size
  }
  get complete () {
    return this.paths.length >= Batch.size()
  }
  constructor () {
    this.paths = []
  }
  push (path) {
    this.paths.push(path)
  }
  join () {
    return this.paths.join()
  }
}

// Tracks what batches of svg paths have been rendered to an img tag. Also
// renders new batches to the img.
class Renderer {
  static toDataUri (svgString) {
    // Encode svg into a data URI in an IE-friendly way.
    // More details: https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
    var uriPayload = encodeURIComponent(svgString) // encode URL-unsafe characters
      .replace(/%0A/g, '') // remove newlines
      .replace(/%20/g, ' ') // put spaces back in
      .replace(/%3D/g, '=') // ditto equals signs
      .replace(/%3A/g, ':') // ditto colons
      .replace(/%2F/g, '/') // ditto slashes
      .replace(/%22/g, "'"); // replace quotes with apostrophes (may break certain SVGs)

    return 'data:image/svg+xml,' + uriPayload;
  }
  constructor (img) {
    this.svgStart = `
    <svg viewBox="0 0 984 1065" height="1065.0pt" width="984.0pt" xmlns="http://www.w3.org/2000/svg" version="1.1">
      <style type="text/css">
        <![CDATA[
          path:hover {
            transform: rotate(45deg);
          }
        ]]>
      </style>`
    this.paths = ''
    this.svgEnd = `</svg>`
    this.img = img
    this.render([]) // set img src to blank
  }
  render (batch) {
    this.paths += batch.join('') // concatenate batch with existing paths
    this.img.src = Renderer.toDataUri(this.svgStart + this.paths + this.svgEnd)
  }
}

// Takes svg paths as they are available from the network and adds them to the
// current batch of paths. Once the current batch is complete, it's added to the
// render queue. Ten times a second, the RenderManager pulls the oldest batch
// from the render queue and asks the Renderer to render it.
class RenderManager {
  constructor (img) {
    this.currentBatch = new Batch()
    this.renderQueue = []
    this.renderer = new Renderer(img)
  }
  addToBatch (path) {
    this.currentBatch.push(path)
    if (this.currentBatch.complete) {
      this.renderQueue.push(this.currentBatch)
      this.currentBatch = new Batch()
    }
  }
  startRenderLoop () {
    const renderNextBatch = () => this.renderNextBatch()
    setInterval(renderNextBatch, 100)
  }
  renderNextBatch () {
    const nextBatch = this.renderQueue.shift()
    if (nextBatch) {
      this.renderer.render(nextBatch)
    }
  }
}

function loadSvgToImgSrc (img, url) {
  const manager = new RenderManager(img)
  manager.startRenderLoop()
  const gotNode = node => {
    // Pass this to setTimeout so it gets called in the next tick of the event
    // loop instead of blocking.
    setTimeout(() => manager.addToBatch(node))

    // We've already stored the path to be rendered later,
    // so tell oboe not to keep this node in memory
    return oboe.drop
  }

  // Oboe is a streaming JSON parser. It allows you to process parts of a large
  // JSON file before it's finished downloading from the network.
  // Load the svg paths for the image. They're sorted so that high level
  // features load earlier and fine details load later.
  // sorted-paths.json just contains an array of strings.
  oboe(url)
    // This event listener (gotNode) gets called whenever Oboe gets a complete
    // element of the array from the network.
    .on('node', '*', gotNode)
    .done(() => console.log('Finished streaming paths from sorted-paths.json.'))
}

export default loadSvgToImgSrc
