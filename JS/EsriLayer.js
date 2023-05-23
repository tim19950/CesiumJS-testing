import { toggleActiveImgItem, viewer } from './javaScript.js';

// Implement the interface in specific layer classes
export default class EsriLayer {

    handlingEsriLayer(esriLayer) {

        let layerESRIImg = document.getElementById("layer_img_2");
        let layerOSMImg = document.getElementById("layer_img_1");

        // remove the eventlistener for toggle the active Layers state
        // layerESRIImg.removeEventListener("click", toggleActiveImgItem);
        // handlingESRIMap(esriLayer);

        layerESRIImg.addEventListener("click", (event) => {
            this.hello();
            if (!event.target.classList.contains('active')) {
                event.target.classList.add("active");
                event.target.parentElement.children[1].classList.add("active");

                // Remove existing layers and add ESRI layer at position 0
                viewer.imageryLayers.remove(viewer.imageryLayers.get(0), false);
                viewer.imageryLayers.add(esriLayer, 0);

                // Remove active state from OSM layer
                layerOSMImg.classList.remove("active");
                layerOSMImg.parentElement.children[1].classList.remove("active");
            }
        });

    }

    hello(){
        console.log("hallloo");
    }

}