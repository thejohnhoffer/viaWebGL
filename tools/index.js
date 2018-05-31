'use strict';

window.OpenSeadragon = require('openseadragon');
require('./openSeadragonGL');
require('./viaWebGL');

module.exports = {
  "ViaWebGL": ViaWebGL,
  "openSeadragonGL": openSeadragonGL
}

