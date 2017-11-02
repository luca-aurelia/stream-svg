# Improving Perceptual Speed By Streaming SVG

Here's a [working demo](http://svg-streaming.firebaseapp.com).

![Streaming svg into a data URI](demo.gif "Streaming svg into a data URI")

This is a simple static site that demonstrates how to stream svg paths into a data URI from a JSON file. The data URI is then rendered as the src attribute of an image element.

Most of the interesting stuff is in [load-svg-to-img-src.js](src/load-svg-to-img-src.js). A significant part of the perceptual speed gains come from optimizing the load order of your svg elements. For this project's approach, take a look at [sort-svg-paths.js](sort-svg-paths.js). Since this is a static site, the svg processing happens at build time.

## Created By

[C. Thomas Bailey](https://noisemachines.io)

## License

MIT © [C. Thomas Bailey](https://noisemachines.io)
