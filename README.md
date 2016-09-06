
# [ViaWebGL + seadragonGL][1]

## Shaders on Image element with [viaWebGL][5]

* [Sobel filter on Vector image][8]

```
image = new Image();
viaGL = new ViaWebGL();

image.onload = function() {
    viaGL.vShader = '../fileV.glsl';
    viaGL.fShader = '../fileF.glsl';
    viaGL.init(image);
}
image.src = '../file.type';
```

## Shaders in [OpenSeadragon][7] with [viaWebGL][5] + [seadragonGL][6]

* [Sobel filter on Tiled image][4]

[![Image][9]][4]

```
openSD = OpenSeadragon({
        tileSources: '../tiles.dzi',
        prefixUrl: '../your/icons/',
        id: 'viaWebGL'
});
seaGL = new SeadragonGL(openSD);
seaGL.addHandler('tile-drawing');
seaGL.vShader = '../fileV.glsl';
seaGL.fShader = '../fileF.glsl';
seaGL.init();

```

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
[9]: ../master/images/toggle.png?raw=true