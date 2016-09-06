
[__Get viaWebGL 1.1 + openSeadragonGL 1.1 stable release!__][13] — [See how to use][16]
## [OpenSeadragon][7] shaders by [openSeadragonGL][6]

* [Sobel filter on tiled image][4]

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

###seaGL.addHandler(_eventName_, _tile-handler_ \<optional\>)

| Parameter        | Type     | About                                    | 
|------------------|----------|------------------------------------------| 
| _eventName_      | String   | "tile-drawing" or "tile-loaded"          | 
| _tile-handler_   | Function | If none— sends each tile to shaders once | 

###tile-handler(_callback_, _event_)

| Parameter  | Type     | About                                                                | 
|------------|----------|----------------------------------------------------------------------| 
| _callback_ | Function | Write _callback_(_event_) to use _seaGL_ shaders on the current tile | 
| _event_    | Object   | openSeadragon event for ['tile-drawing'][11] or ['tile-loaded'][12]  | 
            

## Image shaders by [viaWebGL][5]

* [Sobel filter on vector image][8]

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
* __Coded in affiliation with the [Harvard VCG][14]__
* __With support from the one and only [Daniel Haehn][15]__

[1]: https://github.com/thejohnhoffer/viaWebGL
[4]: https://thejohnhoffer.github.io/viaWebGL/demo/dzi/index.html
[8]: https://thejohnhoffer.github.io/viaWebGL/demo/svg/index.html
[5]: tools/viaWebGL.js
[6]: tools/openSeadragonGL.js
[7]: https://openseadragon.github.io
[9]: ../master/images/toggle.png?raw=true
[10]: ../master/images/toggle0.png?raw=true
[11]: https://openseadragon.github.io/docs/OpenSeadragon.Viewer.html#.event:tile-drawing
[12]: https://openseadragon.github.io/docs/OpenSeadragon.Viewer.html#.event:tile-loaded
[16]: https://github.com/thejohnhoffer/viaWebGL/wiki
[13]: https://github.com/thejohnhoffer/viaWebGL/releases/tag/v1.0
[15]: http://vcg.seas.harvard.edu/people/daniel
[14]: http://vcg.seas.harvard.edu

