import { viewer } from './javaScript.js';

export default class ImageryLayers {
    constructor() {
        this.layerESRIImg = document.getElementById("layer_img_2");
        this.layerOSMImg = document.getElementById("layer_img_1");
    }

    handlingEsriLayer(esriLayer) {

        // remove the eventlistener for toggle the active Layers state

        this.layerESRIImg.addEventListener("click", (event) => {
            if (!event.target.classList.contains('active')) {
                event.target.classList.add("active");
                event.target.parentElement.children[1].classList.add("active");

                // Remove existing layers and add ESRI layer at position 0
                viewer.imageryLayers.remove(viewer.imageryLayers.get(0), false);
                viewer.imageryLayers.add(esriLayer, 0);

                // Remove active state from OSM layer
                this.layerOSMImg.classList.remove("active");
                this.layerOSMImg.parentElement.children[1].classList.remove("active");
            }
        });

    }

    handlingOSMmap(osmLayer) {

        this.layerOSMImg.addEventListener("click", (event) => {
            console.log(event.target.classList);

            if (!event.target.classList.contains('active')) {
                // Add active state to clicked element
                event.target.classList.add("active");
                event.target.parentElement.children[1].classList.add("active");

                // Remove existing layers and add OSM layer at position 0
                viewer.imageryLayers.remove(viewer.imageryLayers.get(0), false);
                viewer.imageryLayers.add(osmLayer, 0);

                // Remove active state from ESRI layer
                this.layerESRIImg.classList.remove("active");
                this.layerESRIImg.parentElement.children[1].classList.remove("active");
            }
        });
    }

    
}
