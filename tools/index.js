'use strict';

window.OpenSeadragon = require('openseadragon');
window.UPNG = require('upng-js');
const openSeadragonGL = require('./openSeadragonGL');
const ViaWebGL = require('./viaWebGL');

module.exports = {
  "ViaWebGL": ViaWebGL,
  "openSeadragonGL": openSeadragonGL,
  "OpenSeadragon": window.OpenSeadragon
}

