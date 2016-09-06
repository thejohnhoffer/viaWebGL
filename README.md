
[__Get ViaWebGL 1.0 + openSeadragonGL 1.0 stable release!__][13]

## [OpenSeadragon][7] shaders by [openSeadragonGL][6]

* [Sobel filter on tiled image][4]

[![Sobel filter on tiled image][9]][4]

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

seaGL.addHandler(__eventName__, __handler__ \<optional\>)
    
* __eventName__ 'tile-drawing' or 'tile-loaded'
* __handler__ \<optional\> function(callback,e)
    * __handler__ \<optional\> formal parameters:
        * __callback()__ starts shading
        * __e__ given by on __eventName__:
            * ['tile-drawing'][11]
            * ['tile-loaded'][12]
            

## Image shaders by [viaWebGL][5]

* [Sobel filter on vector image][8]

[![Sobel filter on vector image][10]][8] 

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


[1]: https://github.com/thejohnhoffer/viaWebGL
[4]: https://thejohnhoffer.github.io/viaWebGL/demo/dzi/
[8]: https://thejohnhoffer.github.io/viaWebGL/demo/svg/
[5]: tools/viaWebGL.js
[6]: tools/openSeadragonGL.js
[7]: https://openseadragon.github.io
[9]: ../master/images/toggle.png?raw=true
[10]: ../master/images/toggle0.png?raw=true
[11]: https://openseadragon.github.io/docs/OpenSeadragon.Viewer.html#.event:tile-drawing
[12]: https://openseadragon.github.io/docs/OpenSeadragon.Viewer.html#.event:tile-loaded
[13]: https://github.com/thejohnhoffer/viaWebGL/releases/tag/v1.0
