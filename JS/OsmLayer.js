import { viewer } from './javaScript.js';

export default class OsmLayer {

    handlingOSMmap(osmLayer) {

    let layerOSMImg = document.getElementById("layer_img_1");
    let layerESRIImg = document.getElementById("layer_img_2");

    layerOSMImg.addEventListener("click", (event) => {
        console.log(event.target.classList);

        if (!event.target.classList.contains('active')) {
            // Add active state to clicked element
            event.target.classList.add("active");
            event.target.parentElement.children[1].classList.add("active");

            // Remove existing layers and add OSM layer at position 0
            viewer.imageryLayers.remove(viewer.imageryLayers.get(0), false);
            viewer.imageryLayers.add(osmLayer, 0);

            // Remove active state from ESRI layer
            layerESRIImg.classList.remove("active");
            layerESRIImg.parentElement.children[1].classList.remove("active");
        }
    });
    }
}