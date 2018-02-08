
[__Get viaWebGL + openSeadragonGL stable release!__][13] — [See how it works][16]

## [OpenSeadragon][7] shaders by [openSeadragonGL][6]

Featured as an [OpenSeadragon Plugin](http://openseadragon.github.io/#plugins)!

* Live demo: [Sobel filter on tiled image][4]

[![Sobel filter on tiled image][9]][4]

```js
openSD = OpenSeadragon({
        tileSources: '../tiles.dzi',
        prefixUrl: '../your/icons/',
        id: 'viaWebGL'
});
seaGL = new openSeadragonGL(openSD);
seaGL.addHandler('tile-drawing');
seaGL.vShader = '../fileV.glsl';
seaGL.fShader = '../fileF.glsl';
seaGL.init();
```

##[`seaGL.addHandler(eventName, gl-handler)`][11]

| Parameter        | Type     | About                                    | 
|------------------|----------|------------------------------------------| 
| `eventName`      | String   | "gl-drawing" or "gl-loaded"              | 
| `gl-handler`     | Function | Needed for custom access to the webGL API| 

## Image shaders by [viaWebGL][5]

* Live demo: [Sobel filter on vector image][8]

[![Sobel filter on vector image][10]][8] 

```js
image = new Image();
viaGL = new ViaWebGL();

image.onload = function() {
    viaGL.vShader = '../fileV.glsl';
    viaGL.fShader = '../fileF.glsl';
    viaGL.init(image);
}
image.src = '../file.type';
```

## About this project
[![Harvard VCG][15]][14]

[1]: https://github.com/thejohnhoffer/viaWebGL
[4]: https://thejohnhoffer.github.io/viaWebGL/demo/dzi/index.html
[8]: https://thejohnhoffer.github.io/viaWebGL/demo/svg/index.html
[5]: tools/viaWebGL.js
[6]: tools/openSeadragonGL.js
[7]: https://openseadragon.github.io
[9]: ../master/demo/images/toggle.png?raw=true
[10]: ../master/demo/images/toggle0.png?raw=true
[11]: https://github.com/thejohnhoffer/viaWebGL/wiki/Guide-to-openSeadragonGL#seagladdhandlereventname-tile-handler
[16]: https://github.com/thejohnhoffer/viaWebGL/wiki
[13]: https://github.com/thejohnhoffer/viaWebGL/releases
[15]: ../master/demo/images/VCG.png?raw=true
[14]: http://vcg.seas.harvard.edu

