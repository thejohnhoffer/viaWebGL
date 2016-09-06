
# [ViaWebGL + seadragonGL][1]

## Shaders on Image element with [viaWebGL][5]

* [Sobel filter on Vector image][8]

```
image = new Image();
viaGL = new ViaWebGL();
image.onload = function() {
    viaGL.init(image).then(function(canvas){
        div.appendChild(canvas);
    }
}
```

## Shaders in [OpenSeadragon][7] with [viaWebGL][5] + [seadragonGL][6]

* [Sobel filter on Tiled image][4]

## Downloads

* [Download .tar.gz][2]
* [Download .zip][3]

[1]: https://github.com/thejohnhoffer/viaWebGL
[2]: https://github.com/thejohnhoffer/viaWebGL/tarball/master
[3]: https://github.com/thejohnhoffer/viaWebGL/zipball/master
[4]: https://thejohnhoffer.github.io/viaWebGL/sobel/dzi/
[8]: https://thejohnhoffer.github.io/viaWebGL/sobel/svg/
[5]: tools/viaWebGL.js
[6]: tools/seadragonGL.js
[7]: https://openseadragon.github.io