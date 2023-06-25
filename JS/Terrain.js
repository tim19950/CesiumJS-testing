import { toggleActiveImgItem, viewer } from './javaScript.js';
import { translateModal } from './translate.js';

// Define the Terrain class
export default class Terrain {
    constructor(OSMBuildings){
        this.OSMBuildings = OSMBuildings;
    }

    ChangeTerrainEllipsoidWGS84(event, EllipsoidTerrainProvider) {
    let layerVRWorldTerrainimg = document.getElementById("layer_img_5");
    let layerOSMBuildingsimg = document.getElementById("layer_img_3");

    if (!event.target.classList.contains('active')) {
        if (layerOSMBuildingsimg.classList.contains('active')) {
            // resetting for showing new buildings
            // fast method - better than rerendering
            this.OSMBuildings.DontShowBuildings();
            this.OSMBuildings.ShowBuildings();
        }

        event.target.classList.add("active");
        event.target.parentElement.children[1].classList.add("active");

        viewer.terrainProvider = EllipsoidTerrainProvider;

        layerVRWorldTerrainimg.classList.remove("active");
        layerVRWorldTerrainimg.parentElement.children[1].classList.remove("active");
    }
}

    ChangeTerrainVRWorld(event, worldTerrain) {
        let EllisiodTerrainImg = document.getElementById("layer_img_4");

        if (!event.target.classList.contains('active')) {
            let layerOSMBuildingsimg = document.getElementById("layer_img_3");

            if (layerOSMBuildingsimg.classList.contains('active')) {
                let modal = new bootstrap.Modal(document.querySelectorAll("[id^='modal_osm_buildings_clamping']")[0]);
                let modalHeader = document.getElementById("exampleModalLabel");
                let modalBody = document.getElementById("modal_body_osm_buildings_clamping");
                let buttonOK = document.getElementById("ok_button_osm_buildings_terrain");
                let newID = "modal_osm_buildings_clamping_2";
                document.querySelectorAll("[id^='modal_osm_buildings_clamping']")[0].id = newID;

                modalBody.innerHTML = "Wenn die Gebäude auf dem Gelände dargestellt werden, wird eine höhere Rechnerleistung benötigt.";
                // translateModal(modalHeader, modalBody, undefined, undefined, buttonOK);

                modal.show();
            }

            event.target.classList.add("active");
            event.target.parentElement.children[1].classList.add("active");

            viewer.terrainProvider = worldTerrain;
            EllisiodTerrainImg.classList.remove("active");
            EllisiodTerrainImg.parentElement.children[1].classList.remove("active");
        }
    }

    checkTerrainBuildings(VRWorldTerrainProvider, EllipsoidTerrainProvider) {

        // const evt = viewer.scene.globe.terrainProviderChanged;
        // evt.addEventListener(ausgabe);

        let layerOSMBuildingsimg = document.getElementById("layer_img_3");
        let layerEllipsoidTerrainimg = document.getElementById("layer_img_4");
        let layerVRWorldTerrainimg = document.getElementById("layer_img_5");
        let layerItemsElements = document.querySelectorAll("[id^='modal_osm_buildings_clamping']");

        document.getElementById("abbrechen_button_osm_buildings_terrain").addEventListener("click", () => {
            // var provider_view_model = viewer.baseLayerPicker.viewModel.selectedTerrain;
            // console.log(viewer.baseLayerPicker.viewModel.terrainProviderViewModels[0]);
            // viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
            // viewer.baseLayerPicker.viewModel.selectedTerrain = viewer.baseLayerPicker.viewModel.terrainProviderViewModels[0];

            if (layerItemsElements[0].id === "modal_osm_buildings_clamping_2") {
                // set layers EllipsoidTerrain as active
                layerEllipsoidTerrainimg.classList.add("active");
                layerEllipsoidTerrainimg.parentElement.children[1].classList.add("active");

                // set terrainProvider
                viewer.terrainProvider = EllipsoidTerrainProvider;

                // Dont set VRWorld as active
                layerVRWorldTerrainimg.classList.remove("active");
                layerVRWorldTerrainimg.parentElement.children[1].classList.remove("active");

            } else {

                // Gebäude Layer ausschalten im menu
                layerOSMBuildingsimg.classList.remove("active");
                layerOSMBuildingsimg.parentElement.children[1].classList.remove("active");
            }

        });

        document.getElementById("ok_button_osm_buildings_terrain").addEventListener("click", () => {

            // Buildings are activated and we click on the VR Terrain button
            if (layerItemsElements[0].id === "modal_osm_buildings_clamping_2") {

                // delete old buildings and fetch new one
                // resetting for showing new buildings
                // fast method - better than rerendering
                this.OSMBuildings.DontShowBuildings();
                this.OSMBuildings.ShowBuildings();

                console.log('new Camera listener added!');

            } else {
                // VR Terrain activated and we click on the OSMBuildings button

                this.OSMBuildings.DontShowBuildings();
                this.OSMBuildings.ShowBuildings();

                // Add the event listener to fetch new buldings
                // viewer.camera.changed.addEventListener(cameraChangedListener);
                console.log('Camera listener added!');
            }

        });
    }
 

}