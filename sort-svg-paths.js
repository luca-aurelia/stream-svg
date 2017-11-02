const window = require('svgdom')
const svg = require('svg.js')(window)

// create svg.js instance
const document = window.document
const draw = svg(document.documentElement)
const pathStrings = require('./paths').split('\n')

const parseAttributes = path => {
  const dataRegex = /d="[^"]*"/g // matches d="anything"
  const pathData = path.match(dataRegex)[0]
    .replace(/d=/g, '') // remove d=
    .replace(/"/g, '') // remove double quotes
  const fillRegex = /fill="[^"]*"/g
  const fill = path.match(fillRegex)[0]
    .replace(/fill=/g, '') // remove fill=
    .replace(/"/g, '') // remove double quotes
  return { pathData, fill }
}

const compare = (a, b) => {
  if (a > b) return 1
  if (a < b) return -1
  return 0
}

const comparePathLengths = (a, b) => compare(a.length(), b.length())
const pathToString = path => {
  const xmlnsRegex = /xmlns="[^"]*" /g
  const idRegex = /id="[^"]*" /g
  return path.svg()
    .replace(xmlnsRegex, '') // remove xmlns="http://www.w3.org/2000/svg"
    .replace(idRegex, '') // remove id="SvgjsPath1013"
}

const paths = pathStrings
  .map(parseAttributes)
  // instantiate path objects
  .map(({ pathData, fill }) => draw.path(pathData).fill(fill))
  // Sort so longest paths are at the top. This puts high level features
  // at the beginning of the array and fine details at the end of the array.
  .sort(comparePathLengths)
  .reverse()
  // convert back to strings for serialization
  .map(pathToString)

console.log(paths)

// save as json so we can use Oboe to stream the file into the browser later
require('fs').writeFileSync('./public/sorted-paths.json', JSON.stringify(paths))
