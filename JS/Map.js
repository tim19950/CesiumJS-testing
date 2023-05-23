import { toggleActiveImgItem } from './javaScript.js';
import EsriLayer from './EsriLayer.js';
import OsmLayer from './OsmLayer.js';

let esriLayer = new EsriLayer();
let osmLayer = new OsmLayer();

// Define the Layer class
export default class Map {

    handlingImagery(osmlayer, esrilayer) {
        let layerESRIImg = document.getElementById("layer_img_2");
        // remove the eventlistener for toggle the active Layers state
        layerESRIImg.removeEventListener("click", toggleActiveImgItem);
        esriLayer.handlingEsriLayer(esrilayer);

        let layerOSMImg = document.getElementById("layer_img_1");
        // remove the eventlistener for toggle the active Layers state
        layerOSMImg.removeEventListener("click", toggleActiveImgItem);
        osmLayer.handlingOSMmap(osmlayer);
    }

}