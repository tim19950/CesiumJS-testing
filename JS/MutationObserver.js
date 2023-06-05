import { viewer } from './javaScript.js';
import { translateModal } from './translate.js';

export default class MutationObserverDom {
    constructor(externalGeoJson, externalService) {
        this.externalGeoJson = externalGeoJson;
        this.externalService = externalService;
        this.isEventListenerAdded = false;
        // Flag variable to track modal display
    }

    MutationObserverDOM() {

        // Select the element you want to watch for changes
        const targetNode = document.getElementById('section_4');

        // Create a new observer object
        const observer = new MutationObserver((mutationsList) => {
            for (let mutation of mutationsList) {
                // check for type of childlist mutation
                // only when nodes are added functions should be executed mutation.addedNodes.length > 0!
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // A new child element has been added to the targetNode
                    console.log('New element created!');
                    // console.log(mutation.target.lastChild);
                    // Create the layerdelete button
                    this.createLayerdeleteExternalData();
                    // if dataset attribute layerswmslegend then add layer WMS
                    // console.log(mutation.target.lastChild.dataset.layerswmslegend);
                    if (mutation.target.lastChild.dataset.layerswmslegend) {

                        let layerWMS = mutation.target.lastChild.previousElementSibling.dataset.layerswms
                        let URLWMS = mutation.target.lastChild.previousElementSibling.dataset.urlwms
                        // console.log(mutation.target.lastChild.previousElementSibling);
                        this.externalService.handleExternalServices(mutation.target.lastChild.previousElementSibling, layerWMS, URLWMS);

                        // only execute once when wms and legend added to the menu
                        break;
                    } else {

                        this.externalGeoJson.handleExternalGeoJson(mutation.target.lastChild);
                    }

                }
            }
        });

        // Start observing the targetNode for new changes
        observer.observe(targetNode, { childList: true });

    }

    /*
    Function: createLayerdeleteExternalData
    Description: Creates a button to delete external data layers
    Input Parameters: None
    Returns: None
*/
    createLayerdeleteExternalData() {
        let LayerMenuToolbar = document.getElementById("layermenue_button_toolbar");

        if (!document.getElementById("layer_delete_button")) {
            var layer_delete_button = document.createElement("button");
            layer_delete_button.setAttribute("class", "btn btn-outline-secondary cesium-toolbar-button cesium-button");
            layer_delete_button.setAttribute("id", "layer_delete_button");
            layer_delete_button.setAttribute("type", "button");
            layer_delete_button.setAttribute("title", "Alle externen Layer löschen");
            layer_delete_button.innerHTML = '<div style="text-align:center;" style="width: 20px; height: 20px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-70 -50 600 600"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg></div>';
            LayerMenuToolbar.before(layer_delete_button);
        }

        this.removeExternalLayers();
    }

    /*
    Function: remove_external_layers
    Description: Handles the removal of external layers, including imagery layers and GeoJSON data sources.
    Input Parameters: None
    Returns: None
*/
    removeExternalLayers() {

        const deleteButton = document.getElementById("layer_delete_button");

        // Create the event listener function
        const deleteButtonClickListener = () => {
            let my_modal = new bootstrap.Modal(document.getElementById("modal_delete_all_data"));
            let modalbody = document.getElementById("modal_body_delete_all_data");
            translateModal(undefined, modalbody, undefined, undefined);
            my_modal.show();
            
        };

        // Check if the event listener has been added
        if (!this.isEventListenerAdded) {
            // Add the event listener
            deleteButton.addEventListener('click', deleteButtonClickListener);
            // Set the flag to true to indicate that the event listener has been added
            this.isEventListenerAdded = true;
        }

        document.getElementById("ok_button_delete_all_data").addEventListener('click', () => {
            const section4 = document.getElementById("section_4");

            // This function removes an imagery layer from the Cesium viewer given a layer name
            function deleteImageryLayer(layer) {
                for (let i = 0; i < viewer.imageryLayers.length; i++) {
                    if (viewer.imageryLayers.get(i).imageryProvider._layers === layer) {
                        viewer.imageryLayers.remove(viewer.imageryLayers.get(i));
                        console.log("Deleted imagery layer:", layer);
                    }
                }
            }

            // This function removes a GeoJSON data source from the Cesium viewer given a data source name
            const deleteGeoJSONdataSource = (name) => {
                for (let i = 0; i < viewer.dataSources.length; i++) {
                    if (viewer.dataSources.get(i).name === name) {
                        viewer.dataSources.remove(viewer.dataSources.get(i), false);
                        console.log("Deleted GeoJSON dataSource:", name);
                        // Delete global list for GeoJSON
                        this.externalGeoJson.clearGlobalList();
                        // Create an instance of ExternalGeoJson
                        // const externalGeoJson = new ExternalGeoJson();
                        // Call the clearGlobalList method
                        // externalGeoJson.clearGlobalList();
                    }
                }
            };

            while (section4.firstChild) {
                const child = section4.firstChild;
                if (child.dataset) {
                    if (child.dataset.layerswms) {
                        deleteImageryLayer(child.dataset.layerswms);
                    } else if (child.dataset.filelayergeojson) {
                        deleteGeoJSONdataSource(child.dataset.filelayergeojson);
                    }
                }
                section4.removeChild(child);
                viewer.scene.requestRender();
            }

            if (document.getElementById("layer_delete_button")) {
                let layer_del = document.getElementById("layer_delete_button");
                layer_del.remove();
                // Remove the event listener
                deleteButton.removeEventListener('click', deleteButtonClickListener);
                // set flag to false
                this.isEventListenerAdded = false;
            }

            section4.style.display = "none";
            let section4Text = document.getElementById("section_4_text");
            section4Text.style.display = "none";
        });
    }

}