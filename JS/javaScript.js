import { updateCesiumContainerHeight, updateMaxHeightLayerMenu } from './responsiveDesign.js';
import { toggleLanguage, deleteLanguageSwitchModal } from './languageSwitch.js';
import { translateButtonTitle } from './translate.js';

import Map from './Map.js';
import HelpTour from './HelpTour.js';

export let viewer;

window.addEventListener('load', function() {
    start();
});

function start() {

    Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE3NThhYi01N2QyLTRlYjgtODVjOC0yNmZmOTVkMjc5NmUiLCJpZCI6MjAzMTcsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1ODU2NDYwOTh9.15deq-wlgG1etoMnlMVacxOD48gTv1p85401mlsO6P8";

    // // Auf NRW zoomen am Start
    // var extent = Cesium.Rectangle.fromDegrees(
    //     5.863953,
    //     51.042848,
    //     9.103,
    //     51.857073
    // );

    // Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
    // Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

    // Create ArcGIS Map imagery provider
    let esri = new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
    });
    let ImageryLayerEsri = new Cesium.ImageryLayer(esri, {
        rectangle: Cesium.Rectangle.MAX_VALUE
    });

    // Create the OSM imagery provider
    let osmProvider = new Cesium.OpenStreetMapImageryProvider({
        url: 'https://a.tile.openstreetmap.org/',
        credit: "MapQuest, Open Street Map and contributors, CC-BY-SA"
    });

    // Create a CesiumJS imagery layer using the OSM provider
    let ImageryLayerOSM = new Cesium.ImageryLayer(osmProvider);

    // // Create VR World terrain provider
    // let VRWorldTerrainProvider = new Cesium.VRTheWorldTerrainProvider({
    //     url: 'http://www.vr-theworld.com/vr-theworld/tiles/1.0.0/73/'
    // });

    // create world terrain from cesium
    let worldTerrain = Cesium.createWorldTerrain();

    // let VRWorldTerrainProvider = await Cesium.VRTheWorldTerrainProvider.fromUrl(
    //     "http://www.vr-theworld.com/vr-theworld/tiles1.0.0/73/"
    // );

    // Cerate EllipsiodTerrainProvider
    let EllipsoidTerrainProvider = new Cesium.EllipsoidTerrainProvider();

    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    viewer = new Cesium.Viewer("cesiumContainer", {
        // BaseLayerPicker off
        baseLayerPicker: false,
        //Zeitregler, Szenen Modus und Geocoder nicht essentiell
        animation: false,
        timeline: false,
        sceneModePicker: true,
        geocoder: false,
        //Verschattung
        terrainShadows: Cesium.ShadowMode.DISABLED,
        //Setzen einer Atmospähre
        skyAtmosphere: new Cesium.SkyAtmosphere(),
        msaaSamples: 0,
        // globe: false,
        //Voreingestelltes Terrain (ESRI 3D Gelände) und Oberflächenbilder (OSM)
        // terrainProvider: Cesium.createWorldTerrain(),
        // terrainProvider: new Cesium.VRTheWorldTerrainProvider({
        //     url: 'http://www.vr-theworld.com/vr-theworld/tiles1.0.0/73/'
        //         //         //         //         //     url: 'https://api.maptiler.com/tiles/terrain-quantized-mesh/?key=poisGDv6bKJxzUUYIWpE' // get your own key at https://cloud.maptiler.com
        // }),

        // terrainProvider: new Cesium.ArcGISTiledElevationTerrainProvider({
        //     url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer'
        // }),
        imageryProvider: osmProvider,
        // Der Request Render Mode sorgt dafür, dass im idle nur bei bestimmten Situationen neu gerendert wird was im Bild ist, 
        // was die CPU Last reduziert
        requestRenderMode: true,
        // Optimierung, es wird nicht immer nach 0.0 sec ein neuer Frame gerendert 
        // maximumRenderTimeChange: Infinity
    });

    // disable, due to not shown imagerylayers when zoomed out
    viewer.scene.globe.showGroundAtmosphere = false;

    // add geoloction button
    addGeolocationButton();
    // adding the measure buttons
    addMeasureButtons();
    // add the layer menu
    LayerMenu();

    viewer.scene.debugShowFramesPerSecond = true;

    //FXAA Kantenglättung
    viewer.scene.postProcessStages.fxaa.enabled = false;
    // Ambient Occlusion 
    viewer.scene.postProcessStages.ambientOcclusion.enabled = false;
    viewer.scene.postProcessStages.bloom.enabled = false;

    // HDR aus
    viewer.scene.highDynamicRange = false;
    // Optimierung der Performance
    // level-of-detail refinement. Higher values will provide better performance but lower visual quality
    viewer.scene.globe.maximumScreenSpaceError = 2.5;

    viewer.scene.globe.depthTestAgainstTerrain = true;

    viewer.scene.pickTranslucentDepth = true;

    // Willkommensbildschirm
    let modal_welcome = new bootstrap.Modal(document.getElementById("modal_welcome"));
    modal_welcome.show();

    // initales setzen des value wertes für das Suchfeld
    document.getElementById("input_geocode").value = "";

    // Deutsche Title(tooltips) der Menüpunkte in Cesium
    var homebutton = document.getElementsByClassName("cesium-button cesium-toolbar-button cesium-home-button")[0];
    homebutton.title = "Initiale Kartenausrichtung";

    var help_button = document.getElementsByClassName("cesium-button cesium-toolbar-button cesium-navigation-help-button")[0];
    help_button.title = "Bedienungshilfe";

    var help_button = document.getElementsByClassName("cesium-button cesium-fullscreenButton")[0];
    help_button.title = "Vollbild";

    // initiating all the other functions
    // geolocate();
    // geocodieren();
    // clear_geocodes();
    // setInterval(choose_geocode, 800);
    // add_external_geodata();
    // MutationObserverDOM();
    // add_external_service();
    // measureFunctions();
    // measure_height();
    // measure_distance();
    // popover_tour();
    // get_featureinfo();
    // interval_delete_layer = setInterval(createLayerdeleteExternalData, 500);
    // handlingOSMmap(osmLayer, esriLayer);
    // handlingESRIMap(esriLayer, osmLayer);
    
    // Usage example
    // const esriLayer = new EsriLayer();
    // esriLayer.handlingEsriLayer(ImageryLayerEsri);
    const map = new Map();
    map.handlingImagery(ImageryLayerOSM, ImageryLayerEsri);
    map.handlingOSMBuildings();
    
    // handlingImagery(osmLayer, esriLayer);
    // handlingOSMBuildings();
    map.handlingTerrain(worldTerrain, EllipsoidTerrainProvider);

    map.geolocate();
    map.geocodieren();
    map.clearGeocodes();
    map.measureFunctions();
    map.getFeatureInfo();

    new HelpTour().popoverTour();

    // Call the chooseGeocode method on the map object every 800 milliseconds using setInterval
    setInterval(() => {
        map.chooseGeocode();
    }, 800);

    // Call updateMaxHeight on page load
    updateMaxHeightLayerMenu();
    // Responsive design to update height when menu folded out on small devices
    updateCesiumContainerHeight();

    toggleLanguage();
    deleteLanguageSwitchModal();

    translateButtonTitles();

    addCreditsIcons();

    // leider nicht performant genug, wenn die entities gelöscht werden, wenn diese aus der view verschwinden
    // viewer.scene.postRender.addEventListener(updateBuildingsview);
}

/*
    Function: addCreditsIcons
    Description: Adds credits with tooltips, images, and links to be displayed onscreen.
    Input Parameters: None
    Returns: None
*/
function addCreditsIcons() {
    // Create a credit for Icons8 Icons and add it to the credit display
    let creditIcons8 = new Cesium.Credit(`<a href="http://icons8.com/icons" target="_blank">Icons8 Icons</a>`);
    viewer.creditDisplay.addStaticCredit(creditIcons8);

    // Create a credit for Fontawesome Icons and add it to the credit display
    let creditFontAwesome = new Cesium.Credit(`<a href="https://fontawesome.com/" target="_blank">Fontawesome Icons</a>`);
    viewer.creditDisplay.addStaticCredit(creditFontAwesome);
}

/*
    Function: addGeolocationButton
    Description: Adds a geolocation button to the toolbar.
    Input Parameters: None
    Returns: None
*/
function addGeolocationButton() {
    const modeButton = document.getElementsByClassName("cesium-button cesium-toolbar-button cesium-home-button")[0];

    // Create a geolocation button element
    let geolocationButton = document.createElement("button");
    geolocationButton.setAttribute("class", "cesium-button cesium-toolbar-button");
    geolocationButton.setAttribute("id", "geolocate_button_toolbar");
    geolocationButton.setAttribute("type", "button");
    geolocationButton.setAttribute("title", "Positionsbestimmung");

    // Set the inner HTML of the geolocation button with an SVG icon
    geolocationButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="27" height="28"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 0c17.7 0 32 14.3 32 32V66.7C368.4 80.1 431.9 143.6 445.3 224H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H445.3C431.9 368.4 368.4 431.9 288 445.3V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V445.3C143.6 431.9 80.1 368.4 66.7 288H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H66.7C80.1 143.6 143.6 80.1 224 66.7V32c0-17.7 14.3-32 32-32zM128 256a128 128 0 1 0 256 0 128 128 0 1 0 -256 0zm128-80a80 80 0 1 1 0 160 80 80 0 1 1 0-160z"/></svg>';

    // Insert the geolocation button before the modeButton in the toolbar
    modeButton.before(geolocationButton);
}

/*
    Function: addMeasureButtons
    Description: Adds measure buttons (height and distance) to the toolbar.
    Input Parameters: None
    Returns: None
*/
function addMeasureButtons() {
    const geolocateButton = document.getElementById("geolocate_button_toolbar");

    // Create a measure height button element
    let measureHeightButton = document.createElement("button");
    measureHeightButton.setAttribute("class", "cesium-button cesium-toolbar-button d-none d-lg-block");
    measureHeightButton.setAttribute("id", "measure_height_button_toolbar");
    measureHeightButton.setAttribute("type", "button");
    measureHeightButton.setAttribute("title", "Höhen messen");

    // Set the inner HTML of the measure height button with an image
    measureHeightButton.innerHTML = '<img src="./Icons/height-marker-white-96.svg" width="30" height="31"><a href="http://icons8.com/icons"</a></img>';

    // Insert the measure height button after the geolocate button in the toolbar
    geolocateButton.after(measureHeightButton);

    // Create a measure distance button element
    let measureDistanceButton = document.createElement("button");
    measureDistanceButton.setAttribute("class", "cesium-button cesium-toolbar-button d-none d-lg-block");
    measureDistanceButton.setAttribute("id", "measure_distance_button_toolbar");
    measureDistanceButton.setAttribute("type", "button");
    measureDistanceButton.setAttribute("title", "Strecken messen");

    // Set the inner HTML of the measure distance button with an image
    measureDistanceButton.innerHTML = '<img src="./Icons/measure-line-white-outline.svg" width="30" height="32"><a href="http://icons8.com/icons"</a></img>';

    // Insert the measure distance button after the measure_height_button in the toolbar
    measureHeightButton.after(measureDistanceButton);
}


/*
    Function: translateButtonTitles
    Description: Translates the titles of buttons based on the selected language.
    Input Parameters: None
    Returns: None
*/
function translateButtonTitles() {
    // Set IDs of elements that don't have an ID yet
    document.querySelector('[title="3D"]').id = "3D";
    document.querySelector('[title="2D"]').id = "2D";
    document.querySelector('[title="Columbus View"]').id = "Columbus-view";

    // Get all img tags with specific classes
    const imgTags = document.querySelectorAll('img.eng, img.thai, img.ger');
    // Store button IDs in an array
    const buttonIds = ['3D', '2D', 'layer_delete_button', 'Columbus-view', 'measure_height_button_toolbar', 'measure_distance_button_toolbar', 'geolocate_button_toolbar', 'menu_btn', 'homebutton', 'help_button', 'fullscreen'];

    // Loop through the img tags
    for (let imgTag of imgTags) {
        // Add click event listener to each img tag
        imgTag.onclick = function() {
            const lang = imgTag.classList[0];
            // Use forEach loop to iterate over buttonIds array and translate button titles
            buttonIds.forEach(id => translateButtonTitle(lang, document.getElementById(id)));
        };
    }
}

// /*
//     Function: handlingImagery
//     Description: Handles the imagery layers, including the removal of event listeners and the handling of OSM and ESRI layers.
//     Input Parameters:
//         - osmLayer: Cesium.ImageryLayer
//         - esriLayer: Cesium.ImageryLayer
//     Returns: None
// */
// function handlingImagery(osmLayer, esriLayer) {
//     let layerESRIImg = document.getElementById("layer_img_2");
//     // remove the eventlistener for toggle the active Layers state
//     layerESRIImg.removeEventListener("click", toggleActiveImgItem);
//     handlingESRIMap(esriLayer);

//     let layerOSMImg = document.getElementById("layer_img_1");
//     // remove the eventlistener for toggle the active Layers state
//     layerOSMImg.removeEventListener("click", toggleActiveImgItem);
//     handlingOSMmap(osmLayer);
// }

// /*
//     Function: handlingESRIMap
//     Description: Handles the ESRI map layer, including the addition/removal of the layer and updating the active state.
//     Input Parameters:
//         - esriLayer: Cesium.ImageryLayer object representing the ESRI layer
//     Returns: None
// */
// function handlingESRIMap(esriLayer) {
//     let layerESRIImg = document.getElementById("layer_img_2");
//     let layerOSMImg = document.getElementById("layer_img_1");

//     layerESRIImg.addEventListener("click", function(event) {
//         if (!event.target.classList.contains('active')) {
//             event.target.classList.add("active");
//             event.target.parentElement.children[1].classList.add("active");

//             // Remove existing layers and add ESRI layer at position 0
//             viewer.imageryLayers.remove(viewer.imageryLayers.get(0), false);
//             viewer.imageryLayers.add(esriLayer, 0);

//             // Remove active state from OSM layer
//             layerOSMImg.classList.remove("active");
//             layerOSMImg.parentElement.children[1].classList.remove("active");
//         }
//     });
// }

// /*
//     Function: handlingOSMmap
//     Description: Handles the OSM map layer, including the addition/removal of the layer and updating the active state.
//     Input Parameters:
//         - osmLayer: Cesium.ImageryLayer
//     Returns: None
// */
// function handlingOSMmap(osmLayer) {
//     let layerOSMImg = document.getElementById("layer_img_1");
//     let layerESRIImg = document.getElementById("layer_img_2");

//     layerOSMImg.addEventListener("click", function(event) {
//         console.log(event.target.classList);

//         if (!event.target.classList.contains('active')) {
//             // Add active state to clicked element
//             event.target.classList.add("active");
//             event.target.parentElement.children[1].classList.add("active");

//             // Remove existing layers and add OSM layer at position 0
//             viewer.imageryLayers.remove(viewer.imageryLayers.get(0), false);
//             viewer.imageryLayers.add(osmLayer, 0);

//             // Remove active state from ESRI layer
//             layerESRIImg.classList.remove("active");
//             layerESRIImg.parentElement.children[1].classList.remove("active");
//         }
//     });
// }


// function updateBuildingsview() {

//     let viewRectangelcamera = viewer.camera.computeViewRectangle();

//     for (let i = 0; i < globalArray.length; i++) {
//         // Continuously check for entities in view
//         let EntityCollection = globalArray[i].entities;
//         // for (let j = 0; j < EntityCollection.values.length; j++) {
//         viewer.dataSources.get(i).entities.values.forEach(function(entity) {

//             // let entity = EntityCollection.values[j];

//             // console.log(entity.polygon.hierarchy.getValue(viewer.clock.currentTime).positions[0]);
//             let positioncart = entity.polygon.hierarchy.getValue(viewer.clock.currentTime).positions[0];
//             if (!Cesium.defined(positioncart)) {
//                 return;
//             }

//             let poscarto = Cesium.Cartographic.fromCartesian(positioncart);

//             // console.log(poscarto);

//             if (viewRectangelcamera) {

//                 let boolTest = Cesium.Rectangle.contains(viewRectangelcamera, poscarto);

//                 if (boolTest) {
//                     // true if the provided cartographic is inside the rectangle, false otherwise.
//                     entity.show = true;
//                     // console.log(entity.show);
//                     if (!EntityCollection.contains(entity))
//                         EntityCollection.add(entity);

//                 } else {
//                     // entity.show = false;
//                     EntityCollection.remove(entity);
//                     cartesian_array = [];
//                     // viewer.dataSources.get(i).entities.remove(entity);
//                 }
//             }
//             //}
//         });
//     }
// }

// /*
//     Function: cameraChangedListener
//     Description: Event listener function triggered when the camera changes. It retrieves the camera height and calls the fetchURL function.
//     Input Parameters: None
//     Returns: None
// */
// function cameraChangedListener() {
//     console.log('Camera changed!');

//     // Call the fetchURL function to add geodata
//     fetchURL();
// }

/*
    Function: handlingOSMBuildings
    Description: Handles the OSMBuildings layer, including toggling the layer visibility and displaying a modal if certain conditions are met.
    Input Parameters: None
    Returns: None
// */
// function handlingOSMBuildings() {
//     let layerOSMBuildingsimg = document.getElementById("layer_img_3");

//     layerOSMBuildingsimg.addEventListener("click", function(event) {

//         console.log(event.target.classList);

//         if (event.target.classList.contains('active')) {
//             let VRWorldTerrainImg = document.getElementById("layer_img_5");
//             if (VRWorldTerrainImg.classList.contains('active')) {
//                 // Display a modal with inforamtion that the buildings use much ressource with Terrain(RAM etc.)
//                 let modal = new bootstrap.Modal(document.querySelectorAll("[id^='modal_osm_buildings_clamping']")[0]);
//                 let modalHeader = document.getElementById("exampleModalLabel");
//                 let modalBody = document.getElementById("modal_body_osm_buildings_clamping");
//                 let buttonOK = document.getElementById("ok_button_osm_buildings_terrain");
//                 let newID = "modal_osm_buildings_clamping";
//                 document.querySelectorAll("[id^='modal_osm_buildings_clamping']")[0].id = newID;
//                 // modalBody.innerText = "Für die Aktiverung des Geländes mit eingeschalteten Gebäuden werden aus Performancegründen keine Gebäude auf dem Gelände dargestellt. Daher werden die Gebäude nur auf dem WGS84 Ellipsiod dargestellt und visualiert.";

//                 // translate the modal
//                 translateModal(modalHeader, modalBody, undefined, undefined, buttonOK);

//                 modal.show();
//             } else {
//                 console.log("ShowBuildings");
//                 ShowBuildings();
//             }
//         } else {
//             console.log("DontShowBuildings");
//             DontShowBuildings();
            
//         }
//     });
// }

// /*
//     Function: DontShowBuildings
//     Description: Removes the buildings data sources from the viewer, clears related arrays, and removes the cameraChangedListener.
//     Input Parameters: None
//     Returns: None
// */
// function DontShowBuildings() {
//     viewer.camera.changed.removeEventListener(cameraChangedListener);

//     console.log(viewer.camera.changed);

//     for (let i = 0; i < viewer.dataSources.length; i++) {
//         let datasource = viewer.dataSources.get(i);
//         if (datasource.name && datasource.name.startsWith("Buildings") && datasource.show === true) {
//             for (let datasource of globalArray) {
//                 viewer.dataSources.remove(datasource);
//             }
//             globalArray = [];
//             cartesian_array = [];
//         }
//     }
//     viewer.scene.requestRender();
//     console.log('Camera listener removed!');
// }

// /*
//     Function: ShowBuildings
//     Description: Displays the buildings data sources on the viewer and adds the cameraChangedListener.
//     Input Parameters: None
//     Returns: None
// */
// function ShowBuildings() {
//     viewer.scene.requestRender();
//     viewer.camera.percentageChanged = 1;
//     viewer.camera.changed.addEventListener(cameraChangedListener);
//     console.log(viewer.camera.changed);
//     console.log("Buildings einschalten");
// }

/*
    Function: toggleActiveImgItem
    Description: Toggles the active state of the image and span elements.
    Input Parameters:
        - event: Event object
    Returns: None
*/
export function toggleActiveImgItem(event) {
    var imgItem = event.target;
    imgItem.classList.toggle("active");
    imgItem.parentElement.children[1].classList.toggle("active");
}

/*
    Function: markActiveSelectedLayers
    Description: Marks the selected layers as active to provide visual feedback to the user.
    Input Parameters: None
    Returns: None
*/
export function markActiveSelectedLayers() {
    var imgItems = document.getElementsByClassName("img_layers");

    for (const imgItem of imgItems) {
        if (!imgItem.getAttribute('listener')) {
            imgItem.setAttribute('listener', 'true');
            imgItem.parentElement.children[1].setAttribute('listener', 'true');
            imgItem.addEventListener("click", toggleActiveImgItem);
        }
    }
}

/*
    Function: StopCloseMenu
    Description: Prevents the layer menu from closing when items are clicked.
    Input Parameters: None
    Returns: None
*/
export function StopCloseMenu() {
    let layerItems = document.querySelectorAll("[class^='dropdown-item layermenu']");

    for (const layerItem of layerItems) {
        if (!layerItem.getAttribute('listenerStopPropagation')) {
            layerItem.setAttribute('listenerStopPropagation', 'true');

            layerItem.addEventListener("click", function(event) {
                // menu dont close when items are clicked
                event.stopPropagation();
            });
        }
    }
}

/*
    Function: LayerMenu
    Description: Handles the layer menu functionality, including toggling the menu visibility and marking selected layers.
    Input Parameters: None
    Returns: None
*/
function LayerMenu() {
    const modeButton = document.getElementsByClassName("cesium-button cesium-toolbar-button cesium-home-button")[0];
    const layer_menue_btn = document.getElementById("layermenue_button_toolbar");

    modeButton.before(layer_menue_btn);
    layer_menue_btn.classList.toggle("active");

    // mark the active selected layers in the menu
    markActiveSelectedLayers();
    // Stop close the menu when clicked
    StopCloseMenu();
}

// /*
//     Function: ChangeTerrainEllipsoidWGS84
//     Description: Handles the terrain change to WGS84 ellipsoid, including updating the active state and switching terrain providers.
//     Input Parameters:
//         - event: Event object
//         - EllipsoidTerrainProvider: Cesium.EllipsoidTerrainProvider
//     Returns: None
// */
// function ChangeTerrainEllipsoidWGS84(event, EllipsoidTerrainProvider) {
//     let layerVRWorldTerrainimg = document.getElementById("layer_img_5");
//     let layerOSMBuildingsimg = document.getElementById("layer_img_3");

//     if (!event.target.classList.contains('active')) {
//         if (layerOSMBuildingsimg.classList.contains('active')) {
//             DontShowBuildings();
//             ShowBuildings();
//         }

//         event.target.classList.add("active");
//         event.target.parentElement.children[1].classList.add("active");

//         viewer.terrainProvider = EllipsoidTerrainProvider;

//         layerVRWorldTerrainimg.classList.remove("active");
//         layerVRWorldTerrainimg.parentElement.children[1].classList.remove("active");
//     }
// }

// /*
//     Function: ChangeTerrainVRWorld
//     Description: Handles the terrain change to VR-TheWorld, including updating the active state and displaying a modal if buildings are active.
//     Input Parameters:
//         - event: Event object
//         - worldTerrain: Cesium.CesiumTerrainProvider
//     Returns: None
// */
// function ChangeTerrainVRWorld(event, worldTerrain) {
//     let EllisiodTerrainImg = document.getElementById("layer_img_4");

//     if (!event.target.classList.contains('active')) {
//         let layerOSMBuildingsimg = document.getElementById("layer_img_3");

//         if (layerOSMBuildingsimg.classList.contains('active')) {
//             let modal = new bootstrap.Modal(document.querySelectorAll("[id^='modal_osm_buildings_clamping']")[0]);
//             let modalHeader = document.getElementById("exampleModalLabel");
//             let modalBody = document.getElementById("modal_body_osm_buildings_clamping");
//             let buttonOK = document.getElementById("ok_button_osm_buildings_terrain");
//             let newID = "modal_osm_buildings_clamping_2";
//             document.querySelectorAll("[id^='modal_osm_buildings_clamping']")[0].id = newID;

//             translateModal(modalHeader, modalBody, undefined, undefined, buttonOK);

//             modal.show();
//         }

//         event.target.classList.add("active");
//         event.target.parentElement.children[1].classList.add("active");

//         viewer.terrainProvider = worldTerrain;
//         EllisiodTerrainImg.classList.remove("active");
//         EllisiodTerrainImg.parentElement.children[1].classList.remove("active");
//     }
// }


/*
    Function: handlingTerrain
    Description: Handles the terrain change functionality, including adding event listeners for terrain options.
    Input Parameters:
        - worldTerrain: Cesium.CesiumTerrainProvider
        - EllipsoidTerrainProvider: Cesium.EllipsoidTerrainProvider
    Returns: None
*/
// function handlingTerrain(worldTerrain, EllipsoidTerrainProvider) {
//     check_cesium_terrain_buildings(worldTerrain, EllipsoidTerrainProvider);

//     let EllisiodTerrainImg = document.getElementById("layer_img_4");

//     // remove eventlistener, terrain can not be deactivated
//     EllisiodTerrainImg.removeEventListener("click", toggleActiveImgItem);
//     EllisiodTerrainImg.addEventListener("click", function(event) {
//         ChangeTerrainEllipsoidWGS84(event, EllipsoidTerrainProvider);
//     });

//     let layerVRWorldTerrainImg = document.getElementById("layer_img_5");

//     // remove eventlistener, terrain can not be deactivated
//     layerVRWorldTerrainImg.removeEventListener("click", toggleActiveImgItem);
//     layerVRWorldTerrainImg.addEventListener("click", function(event) {
//         ChangeTerrainVRWorld(event, worldTerrain);
//     });
// }

// /*
//     Function: remove_external_layers
//     Description: Handles the removal of external layers, including imagery layers and GeoJSON data sources.
//     Input Parameters: None
//     Returns: None
// */
// function remove_external_layers() {
//     document.getElementById("layer_delete_button").addEventListener('click', () => {
//         let my_modal = new bootstrap.Modal(document.getElementById("modal_delete_all_data"));
//         let modalbody = document.getElementById("modal_body_delete_all_data");
//         translateModal(undefined, modalbody, undefined, undefined);
//         my_modal.show();
//     });

//     document.getElementById("ok_button_delete_all_data").addEventListener('click', () => {
//         const section4 = document.getElementById("section_4");

//         // This function removes an imagery layer from the Cesium viewer given a layer name
//         function deleteImageryLayer(layer) {
//             for (let i = 0; i < viewer.imageryLayers.length; i++) {
//                 if (viewer.imageryLayers.get(i).imageryProvider._layers === layer) {
//                     viewer.imageryLayers.remove(viewer.imageryLayers.get(i));
//                     console.log("Deleted imagery layer:", layer);
//                 }
//             }
//         }

//         // This function removes a GeoJSON data source from the Cesium viewer given a data source name
//         function deleteGeoJSONdataSource(name) {
//             for (let i = 0; i < viewer.dataSources.length; i++) {
//                 if (viewer.dataSources.get(i).name === name) {
//                     viewer.dataSources.remove(viewer.dataSources.get(i), false);
//                     console.log("Deleted GeoJSON dataSource:", name);
//                     // Delete global list for GeoJSON
//                     globalList = [];
//                 }
//             }
//         }

//         while (section4.firstChild) {
//             const child = section4.firstChild;
//             if (child.dataset) {
//                 if (child.dataset.layerswms) {
//                     deleteImageryLayer(child.dataset.layerswms);
//                 } else if (child.dataset.filelayergeojson) {
//                     deleteGeoJSONdataSource(child.dataset.filelayergeojson);
//                 }
//             }
//             section4.removeChild(child);
//             viewer.scene.requestRender();
//         }

//         if (document.getElementById("layer_delete_button")) {
//             let layer_del = document.getElementById("layer_delete_button");
//             layer_del.remove();
//         }

//         section4.style.display = "none";
//         let section4Text = document.getElementById("section_4_text");
//         section4Text.style.display = "none";
//     });
// }

// /*
//     Function: createLayerdeleteExternalData
//     Description: Creates a button to delete external data layers
//     Input Parameters: None
//     Returns: None
// */
// function createLayerdeleteExternalData() {
//     let LayerMenuToolbar = document.getElementById("layermenue_button_toolbar");

//     if (!document.getElementById("layer_delete_button")) {
//         var layer_delete_button = document.createElement("button");
//         layer_delete_button.setAttribute("class", "btn btn-outline-secondary cesium-toolbar-button cesium-button");
//         layer_delete_button.setAttribute("id", "layer_delete_button");
//         layer_delete_button.setAttribute("type", "button");
//         layer_delete_button.setAttribute("title", "Alle externen Layer löschen");
//         layer_delete_button.innerHTML = '<div style="text-align:center;" style="width: 20px; height: 20px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-70 -50 600 600"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg></div>';
//         LayerMenuToolbar.before(layer_delete_button);
//     }

//     remove_external_layers();
// }


// function ausgabe() {
//     console.log("Gelände geändert");
//     // console.log(viewer.scene.globe.terrainProvider);
// }

// function check_cesium_terrain_buildings(VRWorldTerrainProvider, EllipsoidTerrainProvider) {

//     const evt = viewer.scene.globe.terrainProviderChanged;
//     evt.addEventListener(ausgabe);

//     let layerOSMBuildingsimg = document.getElementById("layer_img_3");
//     let layerEllipsoidTerrainimg = document.getElementById("layer_img_4");
//     let layerVRWorldTerrainimg = document.getElementById("layer_img_5");
//     let layerItemsElements = document.querySelectorAll("[id^='modal_osm_buildings_clamping']");

//     document.getElementById("abbrechen_button_osm_buildings_terrain").addEventListener("click", () => {
//         // var provider_view_model = viewer.baseLayerPicker.viewModel.selectedTerrain;
//         // console.log(viewer.baseLayerPicker.viewModel.terrainProviderViewModels[0]);
//         // viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
//         // viewer.baseLayerPicker.viewModel.selectedTerrain = viewer.baseLayerPicker.viewModel.terrainProviderViewModels[0];

//         if (layerItemsElements[0].id === "modal_osm_buildings_clamping_2") {
//             // set layers EllipsoidTerrain as active
//             layerEllipsoidTerrainimg.classList.add("active");
//             layerEllipsoidTerrainimg.parentElement.children[1].classList.add("active");

//             // set terrainProvider
//             viewer.terrainProvider = EllipsoidTerrainProvider;

//             // Dont set VRWorld as active
//             layerVRWorldTerrainimg.classList.remove("active");
//             layerVRWorldTerrainimg.parentElement.children[1].classList.remove("active");

//             console.log("a");

//         } else {

//             console.log("b");

//             // Gebäude Layer ausschalten im menu
//             layerOSMBuildingsimg.classList.remove("active");
//             layerOSMBuildingsimg.parentElement.children[1].classList.remove("active");
//         }

//     });

//     document.getElementById("ok_button_osm_buildings_terrain").addEventListener("click", () => {

//         // Buildings are activated and we click on the VR Terrain button
//         if (layerItemsElements[0].id === "modal_osm_buildings_clamping_2") {

//             // // set terrainProvider
//             // viewer.terrainProvider = VRWorldTerrainProvider;
//             // // set layers VR world terrain to active
//             // layerVRWorldTerrainimg.classList.add("active");
//             // layerVRWorldTerrainimg.parentElement.children[1].classList.add("active");
//             // // dont set layers Ellisiod terrain to active
//             // layerEllipsoidTerrainimg.classList.remove("active");
//             // layerEllipsoidTerrainimg.parentElement.children[1].classList.remove("active");

//             // Gebäude entfernen nachdem bestätigt worden ist
//             // for (let i = 0; i < viewer.dataSources.length; i++) {

//             //     var datasource = viewer.dataSources.get(i);
//             //     if (viewer.dataSources.get(i).name.startsWith("Buildings")) {

//             //         datasource.show = false;

//             //     }
//             // }

//             // Fetchen neuer Gebäude
//             // viewer.camera.changed.addEventListener(cameraChangedListener);

//             // delete old buildings and fetch new one
//             DontShowBuildings();
//             ShowBuildings();

//             // for (let datasource of globalArray) {
//             //     viewer.dataSources.remove(datasource, true);
//             // }

//             // globalArray = [];
//             // cartesian_array = [];

//             // Gebäude Layer ausschalten im menu
//             // layerOSMBuildingsimg.classList.remove("active");
//             // layerOSMBuildingsimg.parentElement.children[1].classList.remove("active");

//             // Fetchen neuer Gebäude ausschalten
//             // remove cameraChangedListener
//             // viewer.camera.changed.removeEventListener(cameraChangedListener);
//             console.log('new Camera listener added!');

//         } else {

//             // VR Terrain is activated and we click on the OSM Buildings button

//             // // Remove VR World terrain
//             // viewer.terrainProvider = EllipsoidTerrainProvider;
//             // // Farblich nicht aktiv setzten des layers VR world terrain im menu
//             // layerVRWorldTerrainimg.classList.remove("active");
//             // layerVRWorldTerrainimg.parentElement.children[1].classList.remove("active");

//             // // Farblich aktiv setzten des layers Ellipsiod terrain im menu
//             // layerEllipsoidTerrainimg.classList.add("active");
//             // layerEllipsoidTerrainimg.parentElement.children[1].classList.add("active");

//             // Activate Buildings
//             // for (let i = 0; i < viewer.dataSources.length; i++) {

//             //     var datasource = viewer.dataSources.get(i);
//             //     if (viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show == false) {

//             //         datasource.show = true;
//             //     }
//             // }

//             DontShowBuildings();
//             ShowBuildings();

//             // Add the event listener to fetch new buldings
//             // viewer.camera.changed.addEventListener(cameraChangedListener);
//             console.log('Camera listener added!');
//         }

//         // for (let element of document.getElementsByClassName("cesium-baseLayerPicker-itemLabel")) {
//         //     if (element.innerHTML === "Cesium World Terrain") {
//         //         element.style = "color: rgb(0, 255, 106);"
//         //         element.parentNode.className = 'cesium-baseLayerPicker-item cesium-baseLayerPicker-selectedItem';
//         //     } else if (element.innerHTML === "WGS84 Ellipsoid") {
//         //         element.style = "";
//         //         //Remove the CSS class using classList.remove()
//         //         element.parentNode.className = 'cesium-baseLayerPicker-item';
//         //     }
//         // }

//         // for (i = 0; i < viewer.dataSources.length; i++) {
//         //     // var datasource = viewer.dataSources.get(i);
//         //     if (viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show == true) {
//         //         //Get the array of entities

//         //         console.log(viewer.dataSources.get(i).name);

//         //         const entities = viewer.dataSources.get(i).entities.values;

//         //         for (let i = 0; i < entities.length; i++) {
//         //             const entity = entities[i];

//         //             // cesiumJS algorithmus
//         //             // entity.polygon.height = entity.properties.height;
//         //             // entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
//         //             // entity.polygon.extrudedHeight = 0.0;
//         //             // entity.polygon.extrudedHeightReference = Cesium.HeightReference.CLAMP_TO_GROUND;

//         //             // Extrude the polygon based on the Hoehe and clamp on Ground
//         //             // height - damit die gebäude im gelände nicht schweben
//         //             entity.polygon.height = -1;

//         //             entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
//         //             entity.polygon.extrudedHeight = entity.properties.height;
//         //             entity.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;

//         //             entity.polygon.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(100.0, 4000.0);
//         //         }
//         //     }
//         // }

//         // clearInterval(interval_buildings);
//         // // alle intervalle instanzen auf null setzen
//         // interval_buildings = null;
//         // while (interval_buildings !== null) {
//         //     interval_buildings = null;
//         // }
//         // html_element.style = "";


//     });

//     // document.getElementById("abbrechen_button_osm_buildings_terrain").addEventListener("click", () => {

//     //     console.log("second eventlistener");

//     //     // Gebäude Layer ausschalten im menu
//     //     let layerOSMBuildingsimg = document.getElementById("layer_img_3");
//     //     layerOSMBuildingsimg.classList.remove("active");
//     //     layerOSMBuildingsimg.parentElement.children[1].classList.remove("active");

//     // });

//     // document.getElementById("ok_button_osm_buildings_terrain").addEventListener("click", () => {

//     //     // Remove VR World terrain
//     //     viewer.terrainProvider = EllipsoidTerrainProvider;
//     //     // Farblich nicht aktiv setzten des layers VR world terrain im menu
//     //     let layerVRWorldTerrainimg = document.getElementById("layer_img_5");
//     //     layerVRWorldTerrainimg.classList.remove("active");
//     //     layerVRWorldTerrainimg.parentElement.children[1].classList.remove("active");

//     //     // Farblich aktiv setzten des layers Ellipsiod terrain im menu
//     //     let layerEllipsoidTerrainimg = document.getElementById("layer_img_4");
//     //     layerEllipsoidTerrainimg.classList.add("active");
//     //     layerEllipsoidTerrainimg.parentElement.children[1].classList.add("active");

//     //     // Activate Buildings
//     //     for (let i = 0; i < viewer.dataSources.length; i++) {

//     //         var datasource = viewer.dataSources.get(i);
//     //         if (viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show == false) {

//     //             datasource.show = true;
//     //         }
//     //     }

//     //     // Explicitly render a new frame
//     //     viewer.scene.requestRender();

//     //     // Add the event listener
//     //     viewer.camera.changed.addEventListener(cameraChangedListener);

//     // });
// }


// GeoJSON Buildings OSM

// var height, promise_geojson, tilexy, vergleich;
// var cartesian_array = [];

// var webmercatortiling = new Cesium.WebMercatorTilingScheme();

// Die Funktion fetchURL wird jede Sekunde aufgerufen
// setInterval(fetchURL, 1000);
// setInterval(check_height, 1000);

// let cartesian_array = [];
// let globalArray = [];

// // Funktion zum fetchen der URL der OSM Gebäudedaten
// // Führt außerdem das rendern der empfangenen Daten durch
// function fetchURL() {

//     let promise_geojson, tilexy, vergleich, addedpromise;

//     let webmercatortiling = new Cesium.WebMercatorTilingScheme();

//     // Höhe abfragen
//     let height = viewer.camera.positionCartographic.height * (0.001).toFixed(1);
//     // Kachelschema erzeugen für Level 15 aus der Position der Kamera
//     let cartesian = new Cesium.Cartesian2();
//     tilexy = webmercatortiling.positionToTileXY(
//         viewer.camera.positionCartographic,
//         15,
//         cartesian
//     );

//     // Erst ab einer Entfernung von kleiner als 4 km soll das Fetchen der OSM Gebäudedaten erfolgen
//     // Reduziert die Abfragen
//     if ((viewer.camera.positionCartographic.height * 0.001).toFixed(1) < 4) {
//         // Jede Sekunde wird eine Resource erstellt
//         var resource_json = new Cesium.Resource({
//             url: "https://data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json",
//             templateValues: {
//                 x: tilexy.x,
//                 y: tilexy.y,
//                 z: 15,
//             },
//         });

//         // Initiales Fetchen der Daten
//         if (cartesian_array.length == 0) {
//             cartesian_array.push(tilexy);

//             promise_geojson = Cesium.GeoJsonDataSource.load(resource_json, {
//                 // TODO, funktioniert bisher nicht!!!
//                 // clampToGround: true,
//                 strokeWidth: 0,
//                 fill: Cesium.Color.BURLYWOOD,
//                 stroke: Cesium.Color.BURLYWOOD,
//             });
//             console.log("Initiale Kacheln angefragt");

//             // Anfrageoptimierung, da bisherige angefragte Kacheln nicht erneut angefragt werden
//         } else {
//             for (const element of cartesian_array) {
//                 // console.log("Arrayelemente: " + cartesian_array);
//                 // console.log("Tileelement: " + tilexy);
//                 // console.log("element.equals(tilexy): " + element.equals(tilexy));
//                 //
//                 if (element.equals(tilexy)) {
//                     vergleich = true;
//                     break;
//                     // console.log("Das Tilearray enthält bereits die neuen Kacheln");
//                 } else {
//                     vergleich = false;
//                     // console.log("Das Tilearray enthält noch nicht die neuen Kacheln, die neuen werden hinzugefügt");
//                 }
//             }

//             if (vergleich == false) {
//                 console.log("Neue Kacheln werden gefetcht");
//                 cartesian_array.push(tilexy);
//                 promise_geojson = Cesium.GeoJsonDataSource.load(resource_json, {
//                     // TODO, funktioniert bisher nicht!!!
//                     // clampToGround: true,
//                     strokeWidth: 0,
//                     fill: Cesium.Color.BURLYWOOD,
//                     stroke: Cesium.Color.BURLYWOOD,
//                 });
//             } else {
//                 console.log("Die Kacheln wurden bereits gefetcht und müssen nicht erneut angefragt werden");
//             }
//         }

//     } else {

//         // when the viewer is more than 4 km away, the buildings got removed for better performance
//         for (let datasource of globalArray) {
//             viewer.dataSources.remove(datasource);
//         }
//         // console.log(viewer.dataSources.remove(datasource));
//         globalArray = [];
//         cartesian_array = [];

//     }

//     // Rendern der Empfagenen Daten
//     // Renderoptimierung, es werden nur neue Kacheln gerendert, keine wiederholt angefragten Kacheln
//     if (promise_geojson != null) {
//         promise_geojson
//             .then(function(dataSource) {

//                 // console.log(viewer.dataSources._dataSources);
//                 if (viewer.dataSources.length == 0) {
//                     dataSource.name = "Buildings" + (tilexy.x + "_" + tilexy.y).toString();
//                     // console.log("Array ist empty, erste datasource hinzugefügt");
//                     addedpromise = viewer.dataSources.add(dataSource);
//                     globalArray.push(dataSource);
//                     // console.log(viewer.dataSources._dataSources);
//                 } else {
//                     dataSource.name = "Buildings" + (tilexy.x + "_" + tilexy.y).toString();

//                     // Die neue Datasource wird in der datasource collection gefunden, das resultierende Array ist > 0
//                     if (viewer.dataSources.getByName(dataSource.name).length === 0) {
//                         addedpromise = viewer.dataSources.add(dataSource);
//                         globalArray.push(dataSource);
//                         // console.log("Datasourcesarray enthält noch nicht die neue Anfragekachel, neue Kachel wird hinzugefügt");
//                         // dataSource.name = "Buildings" + (tilexy.x + "_" + tilexy.y).toString();
//                     }
//                 }

//                 // let layerEllipsoidTerrainimg = document.getElementById("layer_img_4");
//                 let layerVRWorldTerrainimg = document.getElementById("layer_img_5");

//                 //Get the array of entities
//                 let entities = dataSource.entities.values;

//                 if (layerVRWorldTerrainimg.classList.contains('active')) {

//                     for (let i = 0; i < entities.length; i++) {
//                         const entity = entities[i];

//                         // cesiumJS algorithmus
//                         // entity.polygon.height = entity.properties.height;
//                         // entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
//                         // entity.polygon.extrudedHeight = 0.0;
//                         // entity.polygon.extrudedHeightReference = Cesium.HeightReference.CLAMP_TO_GROUND;

//                         //  Extrude the polygon based on the Hoehe and clamp on Ground
//                         //  height - damit die gebäude im gelände nicht schweben
//                         entity.polygon.height = -5;

//                         entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
//                         entity.polygon.extrudedHeight = entity.properties.height;
//                         entity.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;

//                         // entity.polygon.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(50.0, 3500.0);
//                     }

//                 } else {

//                     for (let i = 0; i < entities.length; i++) {
//                         const entity = entities[i];
//                         // only set height property
//                         entity.polygon.extrudedHeight = entity.properties.height;
//                     }
//                 }

//             });
//     }

//     // Explicitly render a new frame
//     viewer.scene.requestRender();

//     // for (let i = 0; i < viewer.dataSources.length; i++) {
//     //     console.log(viewer.dataSources.get(i));
//     //     // do something with the new data source
//     // }

//     // viewer.dataSources.dataSourceAdded.addEventListener(function() {
//     //     for (let i = 0; i < viewer.dataSources.length; i++) {
//     //         console.log(viewer.dataSources.get(i));
//     //         // do something with the new data source
//     //     }
//     // });

//     // nach einmaligem klicken auf den Button wird das onlickevent ausgelöst.
//     // html_element.parentElement.onclick = () => {

//     // // Fall Buildings ausschalten
//     // if (active_osm) {
//     //     console.log("active");

//     //     for (i = 0; i < viewer.dataSources.length; i++) {

//     //         var datasource = viewer.dataSources.get(i);
//     //         if (viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show == true) {

//     //             datasource.show = false;
//     //         }
//     //     }
//     //     // Explicitly render a new frame
//     //     viewer.scene.requestRender();

//     //     clearInterval(interval_buildings);
//     //     // alle intervalle instanzen auf null setzen
//     //     interval_buildings = null;
//     //     while (interval_buildings !== null) {
//     //         interval_buildings = null;
//     //     }
//     //     // html_element.style = "";
//     //     // active_osm = false;

//     //     // Fall Buildings wieder einschalten
//     // } else if (active_osm == false) {

//     //     for (i = 0; i < viewer.dataSources.length; i++) {

//     //         var datasource = viewer.dataSources.get(i);
//     //         if (viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show == false) {

//     //             datasource.show = true;
//     //         }
//     //     }

//     //     // Explicitly render a new frame
//     //     viewer.scene.requestRender();

//     //     if (!interval_buildings)
//     //         interval_buildings = setInterval(fetchURL, 1000);
//     //     // active_osm = true;
//     // }

//     // else {

//     //     for (i = 0; i < viewer.dataSources.length; i++) {

//     //         var datasource = viewer.dataSources.get(i);
//     //         if (viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show == true) {

//     //             datasource.show = false;
//     //             // viewer.dataSources.remove(datasource, true);
//     //             clearInterval(myinterval);
//     //             // alle intervalle instanzen auf null setzen
//     //             myinterval = null;
//     //             while (myinterval !== null) {
//     //                 myinterval = null;
//     //             }
//     //             html_element.style = "";
//     //         } else if (viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show == false) {

//     //             // console.log(datasource);
//     //             datasource.show = true;
//     //             html_element.style = "color: rgb(0, 255, 106);"
//     //                 // erst prüfen, ob das intervall null ist, dann intervall neu setzen    
//     //             if (!myinterval)
//     //                 myinterval = setInterval(fetchURL, 1000);

//     //         }
//     //     }
//     // }

// }

// function geolocate() {

//     let geolocation_button = document.getElementById("geolocate_button_toolbar");

//     geolocation_button.addEventListener('click', getLocation);

//     function getLocation() {
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(showPosition);
//         } else {
//             // Modal Abfrage Geoloation not supported

//             let modal = new bootstrap.Modal(document.getElementById("modal"));
//             let div_body = document.getElementById("modalBody");

//             // div_body.innerText = "Die Abfrage der Geolocation ist in diesem Browser nicht unterstützt.";

//             translateModal(undefined, div_body, undefined, undefined);

//             modal.show();
//         }
//     }

//     async function showPosition(position) {

//         geolocation_button.style = "background-color: rgb(0, 255, 106);"

//         console.log("Latitude: " + position.coords.latitude +
//             "Longitude: " + position.coords.longitude);

//         // create a cartesian coord for elippsiod terrain
//         let cartesian = Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude);

//         // use await to wait for result of function 
//         // update coordinate if terrain is used
//         cartesian = await checkForTerrainAndCalcCartesian(cartesian, position.coords.longitude, position.coords.latitude);

//         // let VRWorldTerrainImg = document.getElementById("layer_img_5");
//         // if (VRWorldTerrainImg.classList.contains('active')) {
//         //     // calulate height of entity postion first
//         //     let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
//         //     // let heightfromglobe = viewer.scene.globe.getHeight(cartographic);
//         //     // Get the terrain height at the coordinate
//         //     await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [cartographic]).then(function(samples) {
//         //         let height = samples[0].height;
//         //         // console.log(height);
//         //         // create a cartesian coord for Cesium terrain
//         //         cartesian = Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude, height);
//         //         // add_marker(cartesian);
//         //         // Do something with the height value here
//         //     });

//         // }

//         add_marker(cartesian);

//         // 1000 meter abstand zu dem Punkt to fly to
//         let cartesianWithHeight = Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude, 1000);

//         // let cartesianWithHeight = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);

//         viewer.camera.flyTo({
//             destination: cartesianWithHeight,
//             complete: change_backgroundcolor_normal
//         });

//     }

//     function change_backgroundcolor_normal() {
//         geolocation_button.style = "";
//     }

//     function add_marker(cartesian_three) {

//         // Prüfen, ob bereits entitites bestehen und falls ja löschen!
//         var array_entities = [];
//         // löschen der Werte aus dem Array!

//         for (let teil of viewer.entities.values) {
//             if (teil.id.includes("geolocate_point_")) {
//                 array_entities.push(teil);
//                 console.log("the geolocate point which was set before is deleted");
//             }
//         }

//         // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
//         for (let entity of array_entities) {
//             viewer.entities.remove(entity);
//         }

//         // Bild ist von https://fonts.google.com/icons?icon.query=location
//         let locationEntity = viewer.entities.add({
//             name: "My Location",
//             position: cartesian_three,
//             description: "An marker with my current location.",
//             billboard: {
//                 image: "./Icons/user-location.svg",
//                 scale: 0.5,
//                 distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 3000.0),
//                 heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//                 pixelOffset: new Cesium.Cartesian2(0, -15),
//                 scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 4000, 0.1)
//             },
//             id: 'geolocate_point_'
//         });

//         return locationEntity;
//     }
// }

// function geocodieren() {

//     // Init a timeout variable to be used below
//     let timeout = null;

//     let geocoder_search_url = "https://nominatim.openstreetmap.org/search?q={query}&format=geojson&addressdetails=1";

//     // geocode_SearchUrl = "https://www.gis-rest.nrw.de/location_finder/lookup?" +
//     //     "limit=10&filter=type:ort,stra%C3%9Fe,adress.lan:Nordrhein-Westfalen&query={query}";

//     document.getElementById('input_geocode').addEventListener('keyup', e => {
//         requestAPI(e.target.value);
//     });

//     function requestAPI(query) {

//         clearTimeout(timeout);

//         // Make a new timeout set to go off in 800ms
//         timeout = setTimeout(async function() {
//             var geocoder_search_url_replaced = geocoder_search_url.replace("{query}", query);

//             console.log(geocoder_search_url_replaced);

//             let response = await fetch(geocoder_search_url_replaced);

//             if (response.ok) { // if HTTP-status is 200-299
//                 // get the response body (the method explained below)
//                 let json = await response.json();

//                 // console.log(json.features.length);
//                 createResultList(json.features);

//             } else {
//                 alert("HTTP-Error: " + response.status);
//             }

//         }, 800);

//     }

//     function createResultList(data) {
//         var div = document.createElement("div");
//         div.setAttribute("class", "list-group");
//         div.setAttribute("id", "liste");
//         let html = "";

//         if (data.length === 0) {

//             html += '<a href="#" class="list-group-item list-group-item-action">Kein Ergebnis gefunden</a>';
//         } else {
//             for (let i = 0; i < data.length; i++) {

//                 console.log(data[i]);

//                 html += '<a style="font-size: smaller;" href="#" id="' + "list_item_" + i + '"class="list-group-item list-group-item-action itnrwSearchResultItem" data-name="' + data[i].properties.display_name + '"data-longitude="' + data[i].geometry.coordinates[0] + '"data-latitude="' + data[i].geometry.coordinates[1] + '">' + data[i].properties.display_name + '</a>';
//             }
//         }
//         div.innerHTML = html;

//         if (document.getElementById("geocode").lastChild.className != "list-group") {
//             document.getElementById("geocode").appendChild(div);
//         } else {
//             document.getElementById("geocode").replaceChild(div, document.getElementsByClassName("list-group")[0]);
//         }

//     }
// }

// function clear_geocodes() {
//     let list = document.getElementsByClassName("list-group");

//     document.getElementById("abbrechen_button").addEventListener('click', () => {

//         for (let element of list) {
//             element.remove();
//         }
//         // löschen des Wertes aus der Suchleiste
//         document.getElementById("input_geocode").value = '';

//         // Prüfen, ob bereits entitites bestehen und falls ja löschen!
//         let array_entities = [];
//         // löschen der Werte aus dem Array!
//         for (let teil of viewer.entities.values) {
//             if (teil.id.includes("searchadress_point_")) {
//                 array_entities.push(teil);
//                 console.log("adresspoint");
//             }
//         }

//         // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
//         for (let entity of array_entities) {
//             viewer.entities.remove(entity);
//         }

//         // Explicitly render a new frame
//         viewer.scene.requestRender();

//     });

// }

// function choose_geocode() {

//     var point_id = 0;

//     var liste = document.getElementById("liste");
//     if (document.body.contains(document.getElementById("liste"))) {
//         liste.onclick = async e => {
//             const elementClicked = e.target;

//             // Bei der Auswahl wird die Liste gelöscht
//             var list = document.getElementsByClassName("list-group");
//             for (let element of list) {
//                 element.remove();
//             }

//             // Prüfen, ob bereits entitites bestehen und falls ja löschen!
//             let array_entities = [];
//             // löschen der Werte aus dem Array!
//             for (let teil of viewer.entities.values) {
//                 if (teil.id.includes("searchadress_point_")) {
//                     array_entities.push(teil);
//                     console.log("adresspoint");
//                 }
//             }

//             // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
//             for (let entity of array_entities) {
//                 viewer.entities.remove(entity);
//             }

//             console.log(elementClicked.getAttribute('data-name'));

//             if (elementClicked.getAttribute('data-name')) {

//                 let name_adress = elementClicked.getAttribute('data-name');

//                 // setzen des namens in die Suchleiste bei Auswahl
//                 document.getElementById("input_geocode").value = name_adress;

//                 // let cartographic_position = Cesium.Cartographic.fromDegrees(parseFloat(elementClicked.getAttribute('data-longitude')),
//                 //     parseFloat(elementClicked.getAttribute('data-latitude')));

//                 // let cartesian_position = Cesium.Cartographic.toCartesian(cartographic_position);

//                 // create a cartesian coord for elippsiod terrain
//                 let cartesian = Cesium.Cartesian3.fromDegrees(parseFloat(elementClicked.getAttribute('data-longitude')),
//                     parseFloat(elementClicked.getAttribute('data-latitude')));

//                 let longitude = parseFloat(elementClicked.getAttribute('data-longitude'));
//                 let latitude = parseFloat(elementClicked.getAttribute('data-latitude'));

//                 // use await to wait for result of function 
//                 // update coordinate if terrain is used
//                 cartesian = await checkForTerrainAndCalcCartesian(cartesian, longitude, latitude);

//                 // Bild ist von https://fonts.google.com/icons?icon.query=location
//                 let entity = viewer.entities.add({
//                     name: name_adress,
//                     position: cartesian,
//                     description: "The adress you searched",
//                     billboard: {
//                         image: "./Icons/search-address-pin.svg",
//                         scale: 0.5,
//                         distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 4000.0),
//                         heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//                         // pixelOffset: new Cesium.Cartesian2(0, -15),
//                         scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 4000, 0.1)
//                     },
//                     id: 'searchadress_point_' + point_id++
//                 });

//                 let cartographic = Cesium.Cartographic.fromCartesian(entity.position.getValue(0));
//                 let longitudeEntity = Cesium.Math.toDegrees(cartographic.longitude);
//                 let latitudeEntitiy = Cesium.Math.toDegrees(cartographic.latitude);
//                 // 1000 meter distance to the entity
//                 let altitude = cartographic.height + 1000;

//                 let cartesianWithHeight = Cesium.Cartesian3.fromDegrees(longitudeEntity, latitudeEntitiy, altitude);

//                 viewer.camera.flyTo({
//                     destination: cartesianWithHeight
//                 })
//             }
//         }
//     }

// }

// async function checkForTerrainAndCalcCartesian(cartesian, longitude, latitude) {

//     let VRWorldTerrainImg = document.getElementById("layer_img_5");

//     if (VRWorldTerrainImg.classList.contains('active')) {
//         // calulate height of entity postion first
//         let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
//         // let heightfromglobe = viewer.scene.globe.getHeight(cartographic);
//         // Get the terrain height at the coordinate
//         await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [cartographic]).then(function(samples) {
//             let height = samples[0].height;
//             // console.log(height);
//             // create a cartesian coord for Cesium terrain
//             cartesian = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
//             // add_marker(cartesian2);
//             // Do something with the height value here
//         });

//     }

//     console.log(cartesian);

//     return cartesian;
// }

// function add_external_geodata() {

//     // Das unschöne input element wird versteckt und durch einen schöneren Button aufgerufen
//     // const fileSelect = document.getElementById("locale_data_button"),
//     //     fileElem = document.getElementById("locale_data_input");

//     // fileSelect.addEventListener("click", function() {
//     //     if (fileElem) {
//     //         fileElem.click();

//     //         //Add basic drag and drop functionality
//     //         if (viewer.dropEnabled != true) {
//     //             viewer.extend(Cesium.viewerDragDropMixin, { clearOnDrop: false });

//     //             // GeoJSON validation drag and drop
//     //             document.getElementById("cesiumContainer").addEventListener('drop', e => {
//     //                 // Returns a FileList of the files being dragged, if any.
//     //                 var filelist = e.dataTransfer.files;

//     //                 // loadAnimationGeoJSON();

//     //                 for (let i = 0, numFiles = filelist.length; i < numFiles; i++) {
//     //                     const file = filelist[i];

//     //                     // Check if the file is an geojson, otherwise get Info
//     //                     if (file.type && !file.type.startsWith('application/geo')) {
//     //                         console.log('File is not an GeoJSON.', file.type, file);

//     //                         var my_modal = new bootstrap.Modal(document.getElementById("modal_wrong_format"));
//     //                         my_modal.show();

//     //                     } else {

//     //                         // Die Datei wird über einen Reader eingelesen und geprüft
//     //                         const reader = new FileReader();

//     //                         reader.addEventListener('load', (event) => {

//     //                             let errors = geojsonhint.hint(event.target.result);

//     //                             // stopLoadAnimation();

//     //                             if (errors.length == 0) {

//     //                                 var my_modal = new bootstrap.Modal(document.getElementById("modal_load_data"));
//     //                                 my_modal.show();

//     //                             } else {

//     //                                 var my_modal = new bootstrap.Modal(document.getElementById("modal_wrong_geojson"));
//     //                                 var body = document.getElementById("modal_body_wronggeojson");
//     //                                 var innertext = JSON.stringify(errors);
//     //                                 innertext = innertext.replace("[{", "");
//     //                                 innertext = innertext.replace("}]", "");
//     //                                 innertext = innertext.replace(/},{/gm, "");

//     //                                 body.innerText = " Das GeoJSON, welches Sie hinzufügen wollen, besitzt Fehler: " + innertext;
//     //                                 my_modal.show();

//     //                             }

//     //                         });

//     //                         reader.readAsBinaryString(file);
//     //                     }
//     //                 }

//     //             });
//     //         }
//     //     }
//     // }, false);

//     // Observer einmal aufrufen reicht, da ansonsten zweimal aufgerufen
//     // MutationObserverDOM();

//     let ID = 0;
//     let nameGeoJSon;
//     let fileName;

//     const fileSelect = document.getElementById("locale_data_button");

//     let fileModal = new bootstrap.Modal(document.getElementById("fileModal"));
//     let modalAddLayermenu = new bootstrap.Modal(document.getElementById("modal"));

//     let alertnoGeoJSON = document.getElementById("noGeoJSON");
//     let alertGeoJSONExistsAlready = document.getElementById("GeoJSONExistsAlready");
//     let addGeojsonBtn = document.getElementById("addGeoJsonMenu");

//     fileSelect.addEventListener("click", function(event) {

//         // Initial Alertmeldung nicht sichtbar stellen
//         alertnoGeoJSON.style.display = "none";
//         alertGeoJSONExistsAlready.style.display = "none";

//         // document.getElementsByClassName("custom-file-label")[0].innerText = "Keine Datei...";
//         let label = document.getElementsByClassName("custom-file-label")[0];

//         translateModal(undefined, undefined, undefined, undefined, undefined, undefined, label);

//         // Set title of input element to nothing and the selected files
//         document.getElementById("fileInput").title = "";
//         document.getElementById("fileInput").value = "";

//         fileModal.show();
//     });

//     let fileInput = document.getElementById("fileInput");
//     // var selectedFile = fileInput.files[0];

//     // Get the file input field and label element
//     const label = fileInput.nextElementSibling;

//     // Set the label text to the selected file name
//     fileInput.addEventListener('change', () => {
//         fileName = Array.from(fileInput.files).map(file => file.name).join(', ');
//         label.innerText = fileName;
//     });

//     document.getElementById("addGeoJsonMenu").addEventListener("click", function() {
//         let fileInput = document.getElementById("fileInput");

//         // console.log(fileInput.files);
//         if (fileInput.files.length === 0) {
//             alertnoGeoJSON.style.display = "";
//             // alert.innertext = "Wählen Sie erst eine Datei aus";
//             translateModal(undefined, undefined, undefined, alertnoGeoJSON, undefined, undefined);

//         } else {

//             // check if there are existing GeoJSON Layers compared with the new adding ones
//             let bool = checkForDublicateGeoJSonMenu(fileInput, alertGeoJSONExistsAlready, addGeojsonBtn);

//             // only execute adding GeoJSON Layer if the GeoJSON is not found in the menu
//             if (!bool) {
//                 // set the modal closed when ok clicked and the layers sucesfully added
//                 addGeojsonBtn.setAttribute("data-dismiss", "modal");

//                 for (let element of handleFiles(fileInput)) {
//                     // only if no element selected found in the globallist, push into globallist
//                     // global list is used for load the layers when clicked
//                     if (!globalList.find(file => file.name === element.name)) {
//                         globalList.push(element);
//                         // console.log(globalList)
//                     }
//                 }
//             }
//             // Close the modal
//             // fileModal.hide();
//         }
//     });

//     // if (fileElem) {
//     //     // Listener, um auf change event zu reagieren und die Daten lesen zu können
//     //     fileElem.addEventListener("change", function() {
//     //         globalList = handleFiles();
//     //     }, false);
//     // }

//     // Daten der Datei einlesen
//     function handleFiles(fileElem) {

//         const fileList = fileElem.files; /* now you can work with the file list */

//         // loadAnimationGeoJSON();

//         for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
//             const file = fileList[i];
//             // console.log(file.name);

//             let array = file.name.split(".");

//             let nameGeoJSon = array[0];

//             // Check if the file is an geojson, otherwise get Info
//             if (file.type && !file.type.startsWith('application/geo')) {
//                 console.log('File is not an GeoJSON.', file.type, file);

//                 let modal = new bootstrap.Modal(document.getElementById("modal"));
//                 let modalHeader = document.getElementById("ModalLabel");
//                 // modalHeader.innerText = "Achtung";

//                 let modalBody = document.getElementById("modalBody");
//                 // modalBody.innerText = " Die Daten, welche Sie hinzufügen möchten, sind keine GeoJSON Dateien. Bitte laden Sie nur GeoJSON.";

//                 translateModal(modalHeader, modalBody, undefined, undefined);

//                 modal.show();

//             } else {

//                 // GeoJSON validation
//                 // Die Datei wird über einen Reader eingelesen und der Szene hinzugefügt
//                 const reader = new FileReader();
//                 reader.addEventListener('load', (event) => {

//                     let errors = geojsonhint.hint(event.target.result);

//                     if (errors.length === 0) {

//                         console.log("add geojonsLayer");
//                         addLayerGeoJson(nameGeoJSon, ID, file);

//                     } else {

//                         let my_modal = new bootstrap.Modal(document.getElementById("modal"));
//                         let modalBody = document.getElementById("modalBody");
//                         let modalHeader = document.getElementById("ModalLabel");
//                         let innertext = JSON.stringify(errors);
//                         innertext = innertext.replace("[{", "");
//                         innertext = innertext.replace("}]", "");
//                         innertext = innertext.replace(/},{/gm, "");

//                         // modalBody.innerText = " Das GeoJSON, welches Sie hinzufügen wollen, besitzt Fehler: " + innertext;

//                         translateModal(modalHeader, modalBody, innertext);

//                         my_modal.show();
//                         // stopLoadAnimationGeoJSON();
//                     }

//                 });

//                 reader.readAsBinaryString(file);
//             }
//         }

//         return fileList;

//         // // Check if the file is an geojson, otherwise get Info
//         // if (file.type && !file.type.startsWith('application/geo')) {
//         //     console.log('File is not an GeoJSON.', file.type, file);

//         //     let my_modal = new bootstrap.Modal(document.getElementById("modal_wrong_format"));
//         //     my_modal.show();

//         // } else {

//         //     // GeoJSON validation
//         //     // Die Datei wird über einen Reader eingelesen und der Szene hinzugefügt
//         //     const reader = new FileReader();
//         //     reader.addEventListener('load', (event) => {

//         //         let nameGeoJSon;

//         //         let errors = geojsonhint.hint(event.target.result);

//         //         // console.log(errors);

//         //         if (errors.length == 0) {

//         //             let promise = Cesium.GeoJsonDataSource.load(JSON.parse(event.target.result), {
//         //                 clampToGround: true,
//         //                 name: "external GeoJSON data" + ID++
//         //             });

//         //             promise
//         //                 .then(function(dataSource) {
//         //                     // viewer.dataSources.add(dataSource);

//         //                     nameGeoJSon = dataSource.name;

//         //                     // var my_modal = new bootstrap.Modal(document.getElementById("modal_load_data"));
//         //                     // my_modal.show();

//         //                 });

//         //             // let promiseBoolean = viewer.flyTo(promise);

//         //             // ist der promise onFulfilled wird die anonyme innere funktion aufgerufen und der wert message des promise in der Funktion verwendet
//         //             // promiseBoolean.then(function(Message) {
//         //             //     // when true stop animation
//         //             //     if (Message) {
//         //             //         stopLoadAnimationGeoJSON();
//         //             //     }

//         //             // });


//         //         } else {

//         //             var my_modal = new bootstrap.Modal(document.getElementById("modal_wrong_geojson"));
//         //             var body = document.getElementById("modal_body_wronggeojson");
//         //             var innertext = JSON.stringify(errors);
//         //             innertext = innertext.replace("[{", "");
//         //             innertext = innertext.replace("}]", "");
//         //             innertext = innertext.replace(/},{/gm, "");

//         //             body.innerText = " Das GeoJSON, welches Sie hinzufügen wollen, besitzt Fehler: " + innertext;
//         //             my_modal.show();
//         //             stopLoadAnimation();
//         //         }

//         //     });

//         //     reader.readAsBinaryString(file);
//         // }
//         // }
//     }
// }

// function checkForDublicateGeoJSonMenu(fileInput, alertGeoJSONExistsAlready, addGeojsonBtn) {
//     let section4Layers = document.getElementById("section_4").children;

//     let boolTest = false;

//     for (let i = 0; i < section4Layers.length; i++) {
//         let layer = section4Layers[i];
//         let layerFile = layer.dataset.filelayergeojson;

//         for (let j = 0; j < fileInput.files.length; j++) {
//             let file = fileInput.files[j];

//             if (layerFile === file.name) {
//                 console.log(`The dataset attribute filelayergeojson of layer ${i + 1} matches file ${j + 1} in the fileInput`);
//                 alertGeoJSONExistsAlready.style.display = "";
//                 translateModal(undefined, undefined, undefined, alertGeoJSONExistsAlready, undefined, undefined);
//                 // console.log("file.name === file.name");
//                 addGeojsonBtn.setAttribute("data-dismiss", "");
//                 boolTest = true;

//             } else {
//                 // addGeojsonBtn.setAttribute("data-dismiss", "modal");
//                 // boolTest = false;

//             }
//         }
//     }

//     return boolTest;
// }

// function addLayerGeoJson(nameGeoJSon, ID, file) {

//     console.log(nameGeoJSon);

//     let section_4 = document.getElementById("section_4");
//     section_4.style.display = "block";

//     let section4Text = document.getElementById("section_4_text");
//     section4Text.style.display = "inline-block";

//     // Create the new <a> tag element
//     const newLink = document.createElement("a");

//     // Set the attributes for the new <a> tag
//     newLink.className = "dropdown-item layermenu";
//     newLink.title = file.name;
//     newLink.setAttribute("data-fileLayerGeoJson", file.name);

//     // newLink.setAttribute("data-fileGeojson", file);
//     newLink.setAttribute("data-LayersGeoJson", nameGeoJSon);
//     // newLink.setAttribute("data-layerTitle", layer_title);

//     // Create the <img> and <span> tags to go inside the <a> tag
//     const newImg = document.createElement("img");
//     newImg.className = "img_layers";
//     newImg.src = "../Icons/WMS.png";

//     const newSpan = document.createElement("span");
//     newSpan.className = "title";
//     newSpan.textContent = nameGeoJSon;

//     // Loop through the number of sections and create the section names
//     // Create numbers from 6 up to 20 for external ID of WMS and set iterated ID to img ID

//     //get number ID from last layer element
//     let layerItemsElements = document.querySelectorAll("[id^='layer_item']");

//     let layerItemsElement = layerItemsElements[layerItemsElements.length - 1];

//     let oldcount = layerItemsElement.id[layerItemsElement.id.length - 1];

//     ID = oldcount;

//     ++ID;

//     let layerImgName = "layer_img_" + ID;
//     let layerItemName = "layer_item_" + ID;

//     newLink.id = layerItemName;
//     newImg.id = layerImgName;

//     // Add the <img> and <span> tags to the <a> tag
//     newLink.appendChild(newImg);
//     newLink.appendChild(newSpan);

//     // newDIVSection.appendChild(newLink);

//     // Add the new <a> tag to the <div> element with ID "section_4"
//     section_4.appendChild(newLink);

//     let modalAddLayermenu = new bootstrap.Modal(document.getElementById("modal"));

//     let modalHeader = document.getElementById("ModalLabel");
//     modalHeader.innerText = "Information";

//     let modalBody = document.getElementById("modalBody");
//     // modalBody.innerText = "Ihre GeoJSON daten sind dem Menü als Layer hinzugefügt worden.";

//     translateModal(modalHeader, modalBody, null, undefined, null);

//     // only show one modal at a time
//     if (!document.getElementById("modal").classList.contains("show")) {
//         // The modal is not currently being displayed, so show it
//         modalAddLayermenu.show();
//     }

//     markActiveSelectedLayers();
//     StopCloseMenu();
// }

// function handleExternalServices(node, value_name_wms, value_url_wms) {

//     let imageryLayer;

//     // Create WMSImageryProvider
//     let wms_provider = new Cesium.WebMapServiceImageryProvider({
//         url: value_url_wms,
//         layers: value_name_wms,
//         credit: "WMS Data provided by " + node.dataset.contactorganisation.toString(),
//         parameters: {
//             format: 'image/png',
//             transparent: true
//         }
//     });

//     if (node) {
//         node.children[0].addEventListener("click", function(event) {

//             // Even though the wms_provider variable is overwritten each time handleExternalServices() is called for a different node, the event listener 
//             // function that was created for a particular node still has access to the wms_provider variable that was created when handleExternalServices() was called for that node, 
//             // because of how JavaScript's function scoping works.
//             // Jede node hat durch die innere funktion die Varialbe wms_provider im scope, auf das sie zugreifen kann
//             // When the event listener function is created, it "closes over" the wms_provider variable in the scope where it was defined
//             // When a function is created, it forms a closure, which contains the function itself and any variables that were in scope at the time of creation. These variables are still accessible to the function even if they are no longer in scope outside of the closure.

//             // When the node has the active class, the referencing wms_prover for the node gets added
//             if (event.target.classList.contains('active')) {

//                 imageryLayer = new Cesium.ImageryLayer(wms_provider, {
//                     alpha: 0.6
//                 });
//                 viewer.imageryLayers.add(imageryLayer);

//                 // imageryLayer = viewer.imageryLayers.addImageryProvider(wms_provider);

//                 // viewer.imageryLayers.add(esriLayer);
//                 console.log("initial added WMS");
//             } else {
//                 // when the node dont has activ class the wms gets removed
//                 viewer.imageryLayers.remove(imageryLayer);
//                 console.log("WMS contains already. The WMS layer gets deleted.");
//             }
//         });
//     }
// }

// function handleExternalGeodata(node) {

//     // console.log(node.dataset.filegeojson);

//     // console.log(typeof node.dataset.filegeojson);

//     let geoJSONdataSource;

//     // const fileSelect = document.getElementById("locale_data_button"),
//     //     fileElem = document.getElementById("locale_data_input");

//     // fileSelect.addEventListener("click", function() {
//     //     if (fileElem) {
//     //         fileElem.click();
//     //     }
//     // });

//     if (node) {
//         // Listener, um auf change event zu reagieren und die Daten lesen zu können
//         // fileElem.addEventListener("change", handleFiles, false);
//         node.children[0].addEventListener("click", function(event) {
//             if (event.target.classList.contains('active')) {

//                 addGeoJSONLayerMap(node.dataset.filelayergeojson);

//             } else {

//                 viewer.dataSources.remove(geoJSONdataSource);

//                 // Explicitly render a new frame
//                 viewer.scene.requestRender();

//             }

//         });

//     }

//     let ID = 0;

//     // Daten der Datei einlesen
//     function addGeoJSONLayerMap(layerGeoJSONName) {

//         // start loading animation each time
//         loadAnimationGeoJSON();

//         for (let i = 0, numFiles = globalList.length; i < numFiles; i++) {
//             const file = globalList[i];

//             // GeoJSON validation
//             // Die Datei wird über einen Reader eingelesen und der Szene hinzugefügt
//             const reader = new FileReader();
//             reader.addEventListener('load', (event) => {

//                 let promise = Cesium.GeoJsonDataSource.load(JSON.parse(event.target.result), {
//                     clampToGround: true,
//                     markerSymbol: '?'
//                 });

//                 promise
//                     .then(function(dataSource) {

//                         dataSource.name = layerGeoJSONName;

//                         geoJSONdataSource = dataSource;

//                         viewer.dataSources.add(dataSource);

//                         // // Explicitly render a new frame
//                         // viewer.scene.requestRender();

//                         let my_modal = new bootstrap.Modal(document.getElementById("modal_load_data"));
//                         my_modal.show();

//                         // // add a listener function to the loadingEvent
//                         // dataSource.loadingEvent.addEventListener(function(isLoading) {
//                         //     console.log('loadingEvent fired');
//                         //     console.log('Data source loading state changed:', isLoading);
//                         //     stopLoadAnimationGeoJSON();
//                         // });

//                     });

//                 let promiseBoolean = viewer.flyTo(promise);

//                 // ist der promise onFulfilled wird die anonyme innere funktion aufgerufen und der wert message des promise in der Funktion verwendet
//                 promiseBoolean.then(function(Message) {
//                     // when true stop animation
//                     console.log(Message);
//                     if (Message) {
//                         stopLoadAnimationGeoJSON();
//                     }

//                 });

//             });

//             // When the layerGeoJSONName of the clicked img tag is the same as in the fileliste then read data of file 
//             if (file.name === layerGeoJSONName) {
//                 reader.readAsBinaryString(file);
//             }
//         }
//     }
// }

// function MutationObserverDOM() {

//     // Select the element you want to watch for changes
//     const targetNode = document.getElementById('section_4');

//     // Create a new observer object
//     const observer = new MutationObserver(function(mutationsList) {
//         for (let mutation of mutationsList) {
//             // check for type of childlist mutation
//             // only when nodes are added functions should be executed mutation.addedNodes.length > 0!
//             if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
//                 // A new child element has been added to the targetNode
//                 console.log('New element created!');
//                 // console.log(mutation.target.lastChild);
//                 // Create the layerdelete button
//                 createLayerdeleteExternalData();
//                 // if dataset attribute layerswmslegend then add layer WMS
//                 // console.log(mutation.target.lastChild.dataset.layerswmslegend);
//                 if (mutation.target.lastChild.dataset.layerswmslegend) {

//                     let layerWMS = mutation.target.lastChild.previousElementSibling.dataset.layerswms
//                     let URLWMS = mutation.target.lastChild.previousElementSibling.dataset.urlwms
//                         // console.log(mutation.target.lastChild.previousElementSibling);
//                     handleExternalServices(mutation.target.lastChild.previousElementSibling, layerWMS, URLWMS);

//                     // only execute once when wms and legend added to the menu
//                     break;
//                 } else {

//                     handleExternalGeodata(mutation.target.lastChild);
//                 }

//             }
//         }
//     });

//     // Start observing the targetNode for new changes
//     observer.observe(targetNode, { childList: true });

// }

// function add_external_service() {

//     let htmlcollection_layer, contactOrganisation;
//     let ID, value_url_wms;

//     let alerts = document.getElementsByClassName("alert");

//     let noWMSURL = document.getElementById("noWMSURL");
//     let noWMSURLreco = document.getElementById("noURLRecognised");
//     let errorRequest = document.getElementById("errorRequest");
//     let noRequestSend = document.getElementById("noRequestSend");
//     let noWMSSelected = document.getElementById("noWMSelected");
//     let noWMSQueryed = document.getElementById("noWMSQueryed");
//     let WMSexistsMenu = document.getElementById("WMSExistsMenu");
//     let success = document.getElementById("success");

//     let wmsURL = document.getElementById("wms-text");
//     // delete url initial one time on onload of website
//     wmsURL.value = "";

//     document.getElementById("external_service").addEventListener('click', () => {
//         var my_modal = new bootstrap.Modal(document.getElementById("modal_load_service"));
//         my_modal.show();
//         let option_list_wms = document.getElementById("datalistOptions");

//         console.log(wmsURL.value);

//         // check if wms list has children
//         if (option_list_wms.children.length !== 0) {
//             // Show wms list, when it has children
//             document.getElementById("wms_list").style.display = "";
//         } else {
//             // dont show wms list, when it has no children
//             document.getElementById("wms_list").style.display = "none";
//             if (wmsURL.value && !wmsURL.value.startsWith('https://'))
//             // delete wms URL if not start with http
//                 wmsURL.value = "";
//         }

//         // wenn das Feld ausgewählt, Feld leeren
//         document.getElementById("exampleDataList").value = "";
//         // popover();

//         // Initial Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
//         for (let alert of alerts) {
//             alert.style.display = "none";
//         }

//     });

//     document.getElementById("anfrage_button_wms").addEventListener('click', () => {
//         // var value_name_wms = document.getElementById("wms-name").value;
//         value_url_wms = document.getElementById("wms-text").value;

//         if (value_url_wms == "") {

//             // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
//             for (let alert of alerts) {
//                 alert.style.display = "none";
//             }

//             noWMSURL.style.display = "";
//             // alert.innerHTML = "<strong>Achtung!</strong>Geben Sie erst eine URL des WMS an!";

//             translateModal(undefined, undefined, undefined, noWMSURL, undefined);

//         } else {

//             // bei anfragen das layerfeld aufklappen
//             document.getElementById("wms_list").style.display = "";
//             // Feld leeren
//             document.getElementById("exampleDataList").value = "";

//             // Start the loading animation
//             startLoadingAnimationWMS();

//             // initiales leeren der Auswahlliste der Layer des WMS
//             let datalist_options = document.getElementById("datalistOptions");
//             while (datalist_options.firstChild) {
//                 datalist_options.removeChild(datalist_options.lastChild);
//             }

//             let xhttp = new XMLHttpRequest();

//             // anhängen der requestparameter des WMS GetCapabilities requestes
//             xhttp.open("GET", value_url_wms + "?REQUEST=GetCapabilities&SERVICE=WMS");
//             xhttp.send();

//             xhttp.onload = function() {
//                 if (this.readyState == 4 && this.status == 200) {
//                     // Typical action to be performed when the document is ready:
//                     let response_text = xhttp.responseXML;

//                     console.log(response_text);

//                     if (response_text) {

//                         contactOrganisation = response_text.querySelector("ContactOrganization").textContent;

//                         htmlcollection_layer = response_text.getElementsByTagName("Layer");

//                         console.log(htmlcollection_layer);

//                         for (let element_layer of htmlcollection_layer) {

//                             let hasLayerName = false;
//                             let hasTitle = false;
//                             let hasBoundingBox = false;
//                             let layerTitle, layerName, layerAbstract, layerLegendURL;

//                             for (let child of element_layer.children) {
//                                 const { nodeName, textContent } = child;
//                                 switch (nodeName) {
//                                     case "Name":
//                                         hasLayerName = true;
//                                         layerName = textContent;
//                                         break;
//                                     case "Title":
//                                         hasTitle = true;
//                                         layerTitle = textContent;
//                                         break;
//                                     case "BoundingBox":
//                                         hasBoundingBox = true;
//                                         break;
//                                     case "Abstract":
//                                         layerAbstract = textContent;
//                                         break;
//                                     case "Style":
//                                         const xlingAttribut = child.querySelector("OnlineResource").getAttribute("xlink:href");
//                                         if (xlingAttribut) {
//                                             layerLegendURL = xlingAttribut;
//                                         }
//                                         break;
//                                 }
//                             }

//                             // if the layer tag in the xml has a layername an title tag and an boundingbox
//                             // then add an option element to the list of options
//                             if (hasLayerName && hasTitle && hasBoundingBox) {
//                                 let option = document.createElement("option");
//                                 // console.log(child);
//                                 if(layerTitle){
//                                 option.value = layerTitle;
//                                 } else {
//                                     console.log(element_layer.querySelector("Name"));
//                                     // if the title element is empty for the layer, then use the Name as title of the layer tag 
//                                     const NameElement = element_layer.querySelector("Name");

//                                     if (NameElement) {
//                                         option.value = NameElement.textContent;
//                                     }
//                                 }
//                                 option.setAttribute("data-LayersWms", layerName);
//                                 option.setAttribute("data-LayersWmsAbstract", layerAbstract);

//                                 // Check if the href doesn't start with "http://" or "https://"
//                                 // then it must be a relative link
//                                 if (!layerLegendURL.startsWith("http://") && !layerLegendURL.startsWith("https://")) {
//                                     // Add your desired string in front of the href
//                                     // const queryString = layerLegendURL.split('?')[1];
//                                     // console.log(queryString);
//                                     layerLegendURL = value_url_wms + "?" + layerLegendURL;
//                                     console.log(layerLegendURL);
//                                 }
//                                 option.setAttribute("data-LayersWmsLengendURL",layerLegendURL);
//                                 document.getElementById("datalistOptions").appendChild(option);
//                             }

//                         }

//                         // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
//                         for (let alert of alerts) {
//                             alert.style.display = "none";
//                         }

//                         success.style.display = "";
//                         // success.innerHTML = "Die Abfrage der Layer des WMS war erfolgreich.";
//                         translateModal(undefined, undefined, undefined, success, undefined);

//                     } else {

//                         // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
//                         for (let alert of alerts) {
//                             alert.style.display = "none";
//                         }

//                         noWMSURLreco.style.display = "";
//                         // noWMSURLreco.innerHTML = "<strong>Achtung!</strong>Keine URL erkannt, bitte nochmal versuchen.";
//                         translateModal(undefined, undefined, undefined, noWMSURLreco, undefined);

//                     }

//                 } else {
//                     console.log(this.status);
//                     // alert("Fehler in dem Request, bitte nochmal versuchen");

//                     // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
//                     for (let alert of alerts) {
//                         alert.style.display = "none";
//                     }

//                     errorRequest.style.display = "";
//                     // errorRequest.innerHTML = "<strong>Achtung!</strong>Fehler in dem Request, bitte nochmal versuchen.";
//                     translateModal(undefined, undefined, undefined, errorRequest, undefined);

//                 }

//                 // stop the loading animation for all cases onload
//                 stopLoadingAnimationWMS();
//             };
//             // Force the response to be parsed as XML
//             xhttp.overrideMimeType('text/xml');

//             // Bei Fehler, only triggers if the request couldn't be made at all
//             xhttp.onerror = function() {

//                 // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
//                 for (let alert of alerts) {
//                     alert.style.display = "none";
//                 }

//                 noRequestSend.style.display = "";
//                 // noRequestSend.innerHTML = "<strong>Achtung!</strong> Request konnte nicht abgesetzt werden, bitte nochmal versuchen.";

//                 translateModal(undefined, undefined, undefined, noRequestSend, undefined);
//                 // stop the loading animation for onerror
//                 stopLoadingAnimationWMS();
//             };
//         }

//     });

//     document.getElementById("ok_button_wms").addEventListener('click', () => {
//         let layer_title = document.getElementById("exampleDataList").value;
//         console.log(layer_title);

//         let value_name_wms, abstractWMS, wmsLegendURL;
//         let okbtn = document.getElementById("ok_button_wms");

//         // when no layer in the collection and try add layer to menu
//         if (!htmlcollection_layer) {

//             // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
//             for (let alert of alerts) {
//                 alert.style.display = "none";
//             }

//             // when the attribute can be found it will be set not to close the modal to show error message
//             if (okbtn.getAttribute("data-dismiss")) {
//                 okbtn.setAttribute("data-dismiss", "");
//             }

//             noWMSQueryed.style.display = "";
//             // noWMSQueryed.innerHTML = "<strong>Achtung!</strong>Bitte zuerst den WMS anfragen und dann auf 'Zum Menü hinzufügen' klicken.";

//             translateModal(undefined, undefined, undefined, noWMSQueryed, undefined);

//             // when layer not selected
//         } else if (layer_title.length === 0) {

//             // when the attribute can be found it will be set not to close the modal to show error message
//             if (okbtn.getAttribute("data-dismiss")) {
//                 okbtn.setAttribute("data-dismiss", "");
//             }

//             // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
//             for (let alert of alerts) {
//                 alert.style.display = "none";
//             }

//             // show alert message
//             noWMSSelected.style.display = "";
//             // noWMSSelected.innerHTML = "<strong>Achtung!</strong>Bitte zuerst den WMS auswählen und dann auf 'Zum Menü hinzufügen' klicken.";
//             // success.style.display = "none";
//             translateModal(undefined, undefined, undefined, noWMSSelected, undefined);

//         } else {

//             // get choosen title to compare with list to set value_name_wms
//             let titleWMS = document.getElementById("exampleDataList").value;

//             // get datalist options
//             let datalistOptions = document.getElementById("datalistOptions");

//             // wenn der value des ausgewählten elements gleich dem aus der liste, dann setzt die value_name var des wms um diesen später abzufragen
//             for (let option of datalistOptions.children) {
//                 if (option.value === titleWMS) {
//                     value_name_wms = option.dataset.layerswms;
//                     abstractWMS = option.dataset.layerswmsabstract;
//                     wmsLegendURL = option.dataset.layerswmslengendurl;
//                 }
//             }

//             // for (let element_layer of htmlcollection_layer) {
//             //     // console.log(element_layer.firstElementChild.nodeName);

//             //     if (element_layer.attributes[0] && element_layer.attributes[0].name == "queryable" && element_layer.firstElementChild.nodeName == "Name") {
//             //         for (let child of element_layer.children) {
//             //             // console.log(child);
//             //             if (child.nodeName == "Title" && child.textContent == layer_title) {

//             //                 value_name_wms = child.previousElementSibling.textContent;

//             //                 // value_name_wms_array.push(value_name_wms);

//             //             }
//             //         }
//             //     }
//             // }

//             // check if there are existing WMS Layers compared with the new adding ones
//             let bool = checkForDublicateWMSLayer(titleWMS, WMSexistsMenu, okbtn);

//             // only execute adding WMS Layer if the WMS is not found in the menu
//             if (!bool) {
//                 // when the layer was added, close modal
//                 okbtn.setAttribute("data-dismiss", "modal");

//                 addWMSLayer(value_name_wms, value_url_wms, layer_title, ID, abstractWMS, wmsLegendURL, contactOrganisation);
//             }
//             // when the layer was added, close modal
//             // okbtn.setAttribute("data-dismiss", "modal");

//         }
//     });

// }

// function checkForDublicateWMSLayer(WMSTitle, alertWMSexists, okButtom) {

//     let section4Layers = document.getElementById("section_4").children;

//     let boolTest = false;

//     for (let i = 0; i < section4Layers.length; i++) {
//         let layer = section4Layers[i];
//         let layertitle = layer.dataset.layertitle;

//         console.log(layertitle);
//         console.log(WMSTitle);

//         if (layertitle === WMSTitle) {

//             alertWMSexists.style.display = "";
//             translateModal(undefined, undefined, undefined, alertWMSexists, undefined, undefined);
//             console.log("WMS vorhaden in menu");
//             okButtom.setAttribute("data-dismiss", "");
//             boolTest = true;
//         }

//         // for (let j = 0; j < fileInput.files.length; j++) {
//         //     let file = fileInput.files[j];

//         //     if (layerFile === file.name) {
//         //         console.log(`The dataset attribute filelayergeojson of layer ${i + 1} matches file ${j + 1} in the fileInput`);
//         //         alertGeoJSONExistsAlready.style.display = "";
//         //         translate(undefined, undefined, undefined, alertGeoJSONExistsAlready, undefined, undefined);
//         //         // console.log("file.name === file.name");
//         //         addGeojsonBtn.setAttribute("data-dismiss", "");
//         //         boolTest = true;

//         //     } else {
//         //         // addGeojsonBtn.setAttribute("data-dismiss", "modal");
//         //         // boolTest = false;

//         //     }
//         // }
//     }

//     return boolTest;

// }

// function fetchWMSLegend(wmslegendURL, layerTitleWMS) {

//     // Create a <details> element and set its summary text
//     const wmsLegendDetails = document.createElement("details");
//     const wmsLegendDetailsSummary = document.createElement("summary");
//     wmsLegendDetailsSummary.innerText = "Legende " + layerTitleWMS;
//     wmsLegendDetails.className = "dropdown-item layermenu WMSLegend-details";
//     wmsLegendDetails.setAttribute("data-LayersWmsLegend", "WMS Legend");

//     // create an a tag for link of wmslegendURL
//     const aTag = document.createElement("a");
//     aTag.href = wmslegendURL;
//     aTag.target = "_blank";

//     // Create an <img> element and fetch the image URL
//     const imgTag = document.createElement("img");
//     fetch(wmslegendURL)
//         .then(response => response.blob())
//         .then(imageBlob => {
//             const imageUrl = URL.createObjectURL(imageBlob);
//             imgTag.src = imageUrl;
//             imgTag.className = "WMSLegend-img";
//             // imgTag.setAttribute("data-LayersWmsLegendURL", imageUrl);
//         })
//         .catch(error => {
//             console.error('Error fetching image:', error);
//         });

//     // Add the <img> element to the <details> element
//     wmsLegendDetails.appendChild(wmsLegendDetailsSummary);
//     aTag.appendChild(imgTag);
//     wmsLegendDetails.appendChild(aTag);

//     // Add the <details> element to the document
//     const section_4 = document.getElementById("section_4");
//     section_4.appendChild(wmsLegendDetails);

//     // displayImage();

// }

// function addWMSLayer(value_name_wms, value_url_wms, layer_title, ID, abstract, wmslegendURL, contactOrganisation) {

//     let section_4 = document.getElementById("section_4");
//     section_4.style.display = "block";

//     let section4Text = document.getElementById("section_4_text");
//     section4Text.style.display = "inline-block";

//     // Create the new <a> tag element
//     const newLink = document.createElement("a");

//     // // fetch the wmslegend URL of the added wms Layer in the menu
//     // fetch(wmslegendURL)
//     //     .then(response => response.blob())
//     //     .then(imageBlob => {
//     //         const imageUrl = URL.createObjectURL(imageBlob);
//     //         // Do something with the image URL, e.g. set it as the source of an <img> element
//     //         const imgTag = document.createElement("img");
//     //         imgTag.src = imageUrl;
//     //         imgTag.setAttribute("data-LayersWmsLegend", imageUrl);
//     //         section_4.appendChild(imgTag);
//     //     })
//     //     .catch(error => {
//     //         console.error('Error fetching image:', error);
//     //     });

//     // Set the attributes for the new <a> tag
//     newLink.className = "dropdown-item layermenu";
//     newLink.title = abstract;
//     newLink.setAttribute("data-urlWms", value_url_wms);
//     newLink.setAttribute("data-LayersWms", value_name_wms);
//     newLink.setAttribute("data-layerTitle", layer_title);
//     newLink.setAttribute("data-contactOrganisation", contactOrganisation);
//     // Create the <img> and <span> tags to go inside the <a> tag
//     const newImg = document.createElement("img");
//     newImg.className = "img_layers";
//     newImg.src = "../Icons/WMS.png";

//     const newSpan = document.createElement("span");
//     newSpan.className = "title";
//     newSpan.textContent = layer_title;

//     //get number ID from last layer element
//     let layerItemsElements = document.querySelectorAll("[id^='layer_item']");

//     let layerItemsElement = layerItemsElements[layerItemsElements.length - 1];

//     let oldcount = layerItemsElement.id[layerItemsElement.id.length - 1];

//     ID = oldcount;

//     ++ID;

//     let layerImgName = "layer_img_" + ID;
//     let layerItemName = "layer_item_" + ID;

//     newLink.id = layerItemName;
//     newImg.id = layerImgName;

//     // Add the <img> and <span> tags to the <a> tag
//     newLink.appendChild(newImg);
//     newLink.appendChild(newSpan);

//     // newDIVSection.appendChild(newLink);
//     // Add the new <a> tag to the <div> element with ID "section_4"
//     section_4.appendChild(newLink);

//     addCreditWMS(contactOrganisation);

//     fetchWMSLegend(wmslegendURL, layer_title);

//     // const layermenu = document.getElementById("layermenue_dropdown");
//     // layermenu.appendChild(newDIVText);
//     // layermenu.appendChild(newDIVSection);
//     markActiveSelectedLayers();
//     StopCloseMenu();
// }

// function addCreditWMS(ContactOrganization){

//     // Create a credit for WMS and add it to the credit display
//     let creditIcons8 = new Cesium.Credit(ContactOrganization);
//     viewer.creditDisplay.addStaticCredit(creditIcons8);
// }

// function handleKeyPress(event) {

//     if (event.keyCode === 27 || event.code === "Escape") {
//         // the user pressed the Esc key
//         // add your code here to handle the Esc key press
//         let array_entities = [];
//         // löschen der Werte aus dem Array!

//         for (let teil of viewer.entities.values) {
//             if (teil.id.includes("polyline_distance_")) {
//                 array_entities.push(teil);
//                 console.log("polyline");
//             } else if (teil.id.includes("distance_label_")) {
//                 array_entities.push(teil);
//                 console.log("label");
//             } else if (teil.id.includes("distance_marker_")) {
//                 array_entities.push(teil);
//                 console.log("marker");
//             }
//         }

//         // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
//         for (let entity of array_entities) {
//             viewer.entities.remove(entity);
//         }

//         // Explicitly render a new frame
//         viewer.scene.requestRender();
//     }
// }

// function measureFunctions() {

//     let measure_height_button = document.getElementById("measure_height_button_toolbar");
//     let measure_distance_button = document.getElementById("measure_distance_button_toolbar");

//     let height_id = 0;
//     let label_id = 0;

//     let handler_height, handler_distance;

//     let distance_id = 0;
//     let marker_id = 0;

//     let total_distance = 0;

//     // Declare the function reference variable
//     let handleKeyDownRef;

//     let myToast = new bootstrap.Toast(document.getElementById("myToast"));
//     let bodyToast = document.getElementById("toastBody");

//     function measureHeight() {

//         if (handler_height) {
//             handler_height = handler_height && handler_height.destroy();
//             measure_height_button.style = "";

//             console.log("ausschalten");

//             myToast.hide();

//             if (handler_distance) {
//                 console.log("handler distance aktiv");
//             } else {
//                 // Neues setzen der Funktion als Input Action
//                 viewer.screenSpaceEventHandler.setInputAction(get_featureinfo(), Cesium.ScreenSpaceEventType.LEFT_CLICK);
//             }

//         } else {

//             console.log("einschalten");

//             let modal_height = new bootstrap.Modal(document.getElementById("modalMeasure"));

//             let modalHeader = document.getElementById("ModalLabelMeasure");
//             let div_body = document.getElementById("modalBodyMeasurePoint");

//             if (handler_distance) {

//                 myToast.hide();

//                 // modalHeader.innerText = "Achtung";
//                 // div_body.innerText = "Es können nicht beide Messfunktionen gleichzeitig verwendet werden, schalten Sie eine aus!";

//                 translateModal(modalHeader, div_body, undefined, undefined, undefined, handler_distance);

//             } else {

//                 // modalHeader.innerText = "Information";
//                 // div_body.innerText = "Sie können mit der linken Maustaste Punkte auf der Karte setzen. Mit einem Klick der rechten Maustaste in der Karte löschen Sie alle gezeichneten Höhenpunkte aus der Karte.";

//                 translateModal(modalHeader, div_body, undefined, undefined, undefined);
//             }

//             modal_height.show();

//             // Der Click Handler wird zertört, damit keine Klicks in der Karte mehr als Attributtabelle auftauchen
//             handler_karte_click = handler_karte_click && handler_karte_click.destroy();

//             measure_height_button.style = "background-color: rgb(0, 255, 106);"

//             handler_height = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

//             handler_height.setInputAction(
//                 async function(click) {

//                     // delete the previous drawn points
//                     for (let teil of viewer.entities.values) {
//                         if (teil.id.includes("point_height_marker")) {
//                             viewer.entities.remove(teil);
//                             console.log("height removed");
//                         }
//                     }

//                     let cartesian = viewer.scene.pickPosition(click.position);

//                     if (viewer.scene.pickPositionSupported && Cesium.defined(cartesian)) {

//                         let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
//                         let altitudeString;

//                         // calc new height due to terrain and negativ values
//                         await Cesium.sampleTerrain(viewer.terrainProvider, 13, [cartographic]).then(function(samples) {
//                             let heightTerrain = samples[0].height;
//                             console.log(heightTerrain);
//                             altitudeString = Math.round(heightTerrain).toString();
//                         });

//                         // Create a new polyline entity and add it to the viewer
//                         viewer.entities.add({
//                             name: "Height point",
//                             position: cartesian,
//                             description: "Your measured Point with the ID" + ++height_id,
//                             point: {
//                                 color: Cesium.Color.fromCssColorString('#ff0000'),
//                                 pixelSize: 8,
//                                 // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
//                                 distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 6000.0),
//                                 // scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 6000, 0.1),
//                                 outlineColor: Cesium.Color.fromCssColorString('#000000'),
//                                 outlineWidth: 1,
//                                 disableDepthTestDistance: Number.POSITIVE_INFINITY // disable depth testing for the point
//                             },
//                             id: 'point_height_marker' + height_id
//                         });

//                         // bodyToast.textContent = "Bitte wählen Sie noch einen Punkt, um die Messung zu starten.";

//                         // Wählen Sie das <small>-Element aus
//                         const toastTime = document.querySelector('#toastTime');

//                         // Aktualisieren Sie den Inhalt des <small>-Tags
//                         toastTime.textContent = 0 + ' min ago';

//                         // function to set time and the height of toast
//                         setToastHeight(altitudeString, bodyToast, myToast);

//                         // viewer.entities.add({
//                         //     name: "Point height label",
//                         //     position: Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude + 2.2),
//                         //     label: {
//                         //         text: altitudeString + " Meter",
//                         //         // font: "bold 36px 'Helvetica Neue', Helvetica, Arial, sans-serif",
//                         //         // fillColor: Cesium.Color.WHITE,
//                         //         // outlineColor: Cesium.Color.BLACK,
//                         //         // outlineWidth: 3,
//                         //         // shadow: true,
//                         //         // style: Cesium.LabelStyle.FILL_AND_OUTLINE,
//                         //         // verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
//                         //         // scale: 1.0,
//                         //         // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 2000.0),
//                         //         // scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 2000, 0.1),
//                         //         // disableDepthTestDistance: Number.POSITIVE_INFINITY // disable depth testing for the point
//                         //     },
//                         //     id: 'height_label_' + label_id++
//                         // });

//                     }

//                     // Explicitly render a new frame
//                     // Dies ist nötig, da sonst die neuen Elemeten im Bild nicht erscheinen
//                     viewer.scene.requestRender();

//                 }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//             handler_height.setInputAction(
//                 function() {

//                     var array_entities = [];

//                     for (let teil of viewer.entities.values) {
//                         if (teil.id.includes("point_height_marker")) {
//                             array_entities.push(teil);
//                             console.log("height");
//                         } else if (teil.id.includes("height_label_")) {
//                             array_entities.push(teil);
//                             console.log("label");
//                         }
//                     }

//                     // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
//                     for (let entity of array_entities) {
//                         viewer.entities.remove(entity);
//                     }

//                     // Explicitly render a new frame
//                     viewer.scene.requestRender();

//                 }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

//         }
//     }

//     function measureDistance() {

//         let array_cartesians_3 = [];

//         if (handler_distance) {
//             handler_distance = handler_distance && handler_distance.destroy();
//             // remove eventlistener for esc for deleting the measured lines
//             if (handleKeyDownRef) {
//                 document.removeEventListener("keydown", handleKeyDownRef);
//                 console.log("removed");
//             }
//             measure_distance_button.style = "";

//             myToast.hide();
//             total_distance = 0;

//             console.log("ausschalten lines");

//             if (handler_height) {
//                 console.log("handler height aktiv");
//             } else {
//                 // Neues setzen der Funktion als Input Action
//                 viewer.screenSpaceEventHandler.setInputAction(get_featureinfo(), Cesium.ScreenSpaceEventType.LEFT_CLICK);
//             }

//         } else {

//             let modal_distance = new bootstrap.Modal(document.getElementById("modalMeasureLine"));

//             let modalHeader = document.getElementById("ModalLabelMeasureLine");
//             let div_body = document.getElementById("modalBodyMeasureLine");

//             console.log("einschalten");

//             if (handler_height) {
//                 // modalHeader.innerText = "Achtung";
//                 // div_body.innerText = "Es können nicht beide Messfunktionen gleichzeitig verwendet werden, schalten Sie eine aus!";

//                 translateModal(modalHeader, div_body, undefined, undefined, undefined, handler_height);

//             } else {

//                 // modalHeader.innerText = "Information";
//                 // div_body.innerText = "Sie können mit der linken Maustaste Punkte auf der Karte setzen. Mit einem Klick der rechten " +
//                 //     "Maustaste in der Karte können sie die Messung beenden. Mit der 'Esc' Taste löschen Sie alle Punkte";

//                 translateModal(modalHeader, div_body, undefined, undefined, undefined);
//             }

//             modal_distance.show();

//             // Der Click Handler wird zertört, damit keine Klicks in der Karte mehr als Attributtabelle auftauchen
//             handler_karte_click = handler_karte_click && handler_karte_click.destroy();

//             measure_distance_button.style = "background-color: rgb(0, 255, 106);"
//             handler_distance = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

//             handler_distance.setInputAction(
//                 function() {

//                     // Delete all points in the array and set distance to 0
//                     array_cartesians_3 = [];
//                     total_distance = 0;

//                 }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

//             handler_distance.setInputAction(
//                 function(click) {

//                     let cartesian = viewer.scene.pickPosition(click.position);

//                     if (Cesium.defined(cartesian)) {

//                         array_cartesians_3.push(cartesian);

//                         // Neues Array aus den letzten beiden Punkten wird erstellt
//                         let array_coord = array_cartesians_3.slice(-2);
//                         // let cartographic = Cesium.Cartographic.fromCartesian(array_coord[0]);
//                         // let longitude = Cesium.Math.toDegrees(cartographic.longitude);
//                         // let latitude = Cesium.Math.toDegrees(cartographic.latitude);

//                         if (array_coord.length === 1) {

//                             // points.add({
//                             //     position: array_coord[0],
//                             //     color: Cesium.Color.CYAN,
//                             //     disableDepthTestDistance: Number.POSITIVE_INFINITY,
//                             //     distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 5000.0),
//                             //     pixelSize: 8,
//                             //     id: 'distance_marker_' + marker_id++
//                             // });

//                             // console.log(array_coord.length);

//                             // Bild ist von https://fonts.google.com/icons?icon.query=location
//                             viewer.entities.add({
//                                 name: "Polyline point",
//                                 position: array_coord[0],
//                                 description: "Line point from polyline",
//                                 point: {
//                                     // image: "./Icons/PunktMeasureLine.png",
//                                     // Darstellung auch auf Gebäuden, auf clamptoground kann verzichtet werden
//                                     distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 4000.0),
//                                     scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 4000, 0.1),
//                                     outlineColor: Cesium.Color.BLACK,
//                                     outlineWidth: 1,
//                                     pixelSize: 8,
//                                     disableDepthTestDistance: Number.POSITIVE_INFINITY // disable depth testing for the point
//                                 },
//                                 id: 'distance_marker_' + marker_id++
//                             });

//                             // bodyToast.textContent = "Bitte wählen Sie noch einen Punkt, um die Messung zu starten.";

//                             translateToast(bodyToast, 0, 0);

//                             // Wählen Sie das <small>-Element aus
//                             const toastTime = document.querySelector('#toastTime');

//                             // Aktualisieren Sie den Inhalt des <small>-Tags
//                             toastTime.textContent = 0 + ' min ago';

//                             myToast.show();

//                             // Explicitly render a new frame
//                             viewer.scene.requestRender();

//                         } else {

//                             // let cartographic2 = Cesium.Cartographic.fromCartesian(array_coord[1]);
//                             // let longitude2 = Cesium.Math.toDegrees(cartographic2.longitude);
//                             // let latitude2 = Cesium.Math.toDegrees(cartographic2.latitude);

//                             viewer.entities.add({
//                                 name: "Measured polyline",
//                                 description: "Polyline withe the ID " + ++distance_id,
//                                 polyline: {
//                                     // clampToGround: true,
//                                     positions: array_coord,
//                                     distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 5000.0),
//                                     width: 5,
//                                     depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
//                                         color: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.5),
//                                         outlineColor: Cesium.Color.DEEPSKYBLUE,
//                                         outlineWidth: 2
//                                     }),
//                                     material: new Cesium.PolylineOutlineMaterialProperty({
//                                         color: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.5),
//                                         outlineColor: Cesium.Color.DEEPSKYBLUE,
//                                         outlineWidth: 2
//                                     }),
//                                 },
//                                 id: 'polyline_distance_' + distance_id
//                             });

//                             // points.get(0).show = true;

//                             // points.add({
//                             //     position: array_coord[1],
//                             //     color: Cesium.Color.CYAN,
//                             //     disableDepthTestDistance: Number.POSITIVE_INFINITY,
//                             //     distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 5000.0),
//                             //     pixelSize: 8,
//                             //     id: 'distance_marker_' + marker_id++
//                             // });

//                             // Bild ist von https://fonts.google.com/icons?icon.query=location
//                             viewer.entities.add({
//                                 name: "Polyline marker",
//                                 description: "Line point from polyline",
//                                 position: array_coord[1],
//                                 point: {
//                                     // image: "./Icons/PunktMeasureLine.png",
//                                     // Darstellung auch auf Gebäuden, auf clamptoground kann verzichtet werden
//                                     distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 4000.0),
//                                     scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 4000, 0.1),
//                                     outlineColor: Cesium.Color.BLACK,
//                                     outlineWidth: 1,
//                                     pixelSize: 8,
//                                     disableDepthTestDistance: Number.POSITIVE_INFINITY // disable depth testing for the point
//                                 },
//                                 id: 'distance_marker_' + marker_id++
//                             });

//                             // Explicitly render a new frame
//                             viewer.scene.requestRender();

//                             // Der Mittelpunkt wird aus den Beiden Punkten berechnet
//                             let result = new Cesium.Cartesian3();
//                             Cesium.Cartesian3.midpoint(array_coord[0], array_coord[1], result);

//                             // Die Distanz wird aus den beiden Punkten berechnet
//                             let distance = Cesium.Cartesian3.distance(array_coord[0], array_coord[1]);

//                             total_distance = total_distance + distance;

//                             // function to set time and the distances
//                             setToastDistance(distance, total_distance, bodyToast, myToast);

//                             // let my_modal = new bootstrap.Modal(document.getElementById("modal_distance"));
//                             // let body = document.getElementById("content_body_distance");
//                             // body.innerText = "Die gesamte gemessene Strecke beträgt: " + total_distance + "Meter.";

//                             // my_modal.show();

//                             // // Eigene Entity für das Label hinzufügen
//                             // viewer.entities.add({
//                             //     name: "Polyline label",
//                             //     position: result,
//                             //     label: {
//                             //         // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
//                             //         text: "Total " + total_distance.toFixed(3).toString() + " m",
//                             //         eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -25.0),
//                             //         scale: 0.70,
//                             //         translucencyByDistance: new Cesium.NearFarScalar(0, 0.9, 5000, 0.0),
//                             //         fillColor: Cesium.Color.MAROON
//                             //     },
//                             //     id: 'distance_label_' + label_id++

//                             // });

//                         }

//                         // console.log(viewer.entities.values);
//                     }

//                 }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//             // Declare the anonyoums function which will be called
//             function handleKeyDown(event) {
//                 // call function
//                 handleKeyPress(event);
//                 // delete array with linepoints
//                 array_cartesians_3 = [];
//                 // delete the total lenght
//                 total_distance = 0;
//             }

//             // Set the function reference variable to the function
//             handleKeyDownRef = handleKeyDown;

//             // Add event listener using the function which is in the let
//             document.addEventListener("keydown", handleKeyDownRef);

//             // when a keydown event happens 
//             // document.addEventListener("keydown", function(event) {
//             //     handleKeyPress(event, array_cartesians_3, total_distance);
//             // });
//         }

//         // return count++;
//     }

//     document.getElementById("measure_height_button_toolbar").addEventListener('click', measureHeight);

//     document.getElementById("measure_distance_button_toolbar").addEventListener('click', measureDistance);

// }

// function setToastHeight(height, bodyToast, toast) {

//     translateToastHeight(bodyToast, height);

//     toast.show();
// }

// function setToastDistance(distance, total_distance, bodyToast, myToast) {

//     if (distance > 1000 && total_distance > 1000) {
//         // Wenn die Distanz und total distance größer als 1000 Meter ist, umrechnen in Kilometer
//         // bodyToast.innerText = "Distanz: " + (distance / 1000).toFixed(3) + " Kilometer \n Gesamtdistanz des Linienzugs: " + (total_distance / 1000).toFixed(3) + " Kilometer";
//         translateToast(bodyToast, distance, total_distance);
//     } else if (total_distance > 1000) {
//         // Wenn die total distance größer als 1000 Meter ist, umrechnen in Kilometer
//         // bodyToast.innerText = "Distanz: " + distance.toFixed(3) + " Meter \n Gesamtdistanz des Linienzugs: " + (total_distance / 1000).toFixed(3) + " Kilometer";
//         translateToast(bodyToast, distance, total_distance);
//     } else {
//         // Wenn die Distanz kleiner oder gleich 1000 Meter ist, in Metern belassen
//         // bodyToast.innerText = "Distanz: " + distance.toFixed(3) + " Meter \n Gesamtdistanz des Linienzugs: " + total_distance.toFixed(3) + " Meter";
//         translateToast(bodyToast, distance, total_distance);
//     }

//     // Call function to set and start the update of the time in the toast
//     let startTime = new Date();
//     updateToastTime(startTime);

//     // show the toast
//     myToast.show();
// }

// // Funktion zum Aktualisieren des Inhalts des <small>-Tags
// function updateToastTime(startTime) {

//     // delete intervall
//     clearToastInterval();

//     // Wählen Sie das <small>-Element aus
//     const toastTime = document.querySelector('#toastTime');

//     // Holen Sie sich die aktuelle Zeit und berechnen Sie die vergangene Zeit in Minuten
//     const now = new Date();
//     const minsAgo = Math.floor((now - startTime) / 60000);

//     // Aktualisieren Sie den Inhalt des <small>-Tags
//     toastTime.textContent = minsAgo + ' min ago';

//     // Schedule the next update in one minute
//     const intervalId = setInterval(function() {
//         updateToastTime(startTime);
//     }, 60000);

//     // Store the interval ID on the toastTime element
//     toastTime.dataset.intervalId = intervalId;
// }

// // Function to clear the interval of toast
// function clearToastInterval() {
//     const toastTime = document.querySelector('#toastTime');
//     const intervalId = toastTime.dataset.intervalId;
//     if (intervalId)
//         clearInterval(intervalId);
// }

// function popover_tour() {

//     const toolbar = document.querySelector("div.cesium-viewer-toolbar");

//     // toolbar.childNodes[3].id = "homebutton";
//     toolbar.childNodes[4].id = "homebutton";
//     toolbar.childNodes[5].id = "sceneModePickerBtn";
//     toolbar.childNodes[6].children[0].id = "help_button";

//     const fullscreen = document.getElementsByClassName("cesium-button cesium-fullscreenButton");

//     fullscreen[0].id = "fullscreen";

//     // Verwendet wird für die Hilfetour "Bootstrap Tourist"

//     /* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

//     The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

//     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//     */

//     document.getElementById("btnB").addEventListener("click", () => {

//         // Start the tour - note, no call to .init() is required
//         let tour = setLanguageHelpTour();

//         tour.restart();
//     });

//     document.getElementById("help_tour").addEventListener("click", () => {

//         let tour = setLanguageHelpTour();
//         tour.restart();
//     });
// }

// function setLanguageHelpTour() {

//     // get all img tags with the lang class
//     const imagTags = document.querySelectorAll('img.eng, img.thai, img.ger');
//     let helptour;

//     // Loop through the img tags
//     for (const imgTag of imagTags) {
//         // Get the language class of the img tag
//         const lang = imgTag.classList[0];

//         // Check if the img tag has the "active-flag" class
//         if (imgTag.classList.contains('active-flag')) {
//             // Do something with the img tag based on its language class
//             console.log(lang);
//             if (lang === 'ger') {
//                 helptour = new Tour({
//                     framework: 'bootstrap4', // or "bootstrap3" depending on your version of bootstrap
//                     name: "tour",
//                     backdrop: true,
//                     localization: buttonTextGer,
//                     steps: tour_steps_ger
//                 });
//             } else if (lang === 'eng') {
//                 helptour = new Tour({
//                     framework: 'bootstrap4', // or "bootstrap3" depending on your version of bootstrap
//                     name: "tour",
//                     backdrop: true,
//                     localization: buttonTextEng,
//                     steps: tour_steps_eng
//                 });
//             } else if (lang === 'thai') {
//                 helptour = new Tour({
//                     framework: 'bootstrap4', // or "bootstrap3" depending on your version of bootstrap
//                     name: "tour",
//                     backdrop: true,
//                     localization: buttonTextThai,
//                     steps: tour_steps_th
//                 });
//             }
//         }
//     }

//     return helptour;
// }

// function ShowClickMarker(click) {

//     // Get the click position in the map
//     var windowPosition = new Cesium.Cartesian2(click.position.x, click.position.y);
//     var clickPosition = viewer.camera.pickEllipsoid(windowPosition, viewer.scene.globe.ellipsoid);

//     // Only show the click animation if the click is on the globe
//     if (clickPosition) {
//         // Create a new div element for the click animation
//         var clickAnimation = document.createElement('div');
//         clickAnimation.classList.add('click-animation');
//         clickAnimation.style.left = click.position.x - 15 + 'px';
//         clickAnimation.style.top = click.position.y + 38 + 'px';

//         // Add the click animation to the DOM
//         document.body.appendChild(clickAnimation);
//     }

//     // Remove the click animation after a delay
//     setTimeout(function() {
//         if (clickAnimation)
//             clickAnimation.parentNode.removeChild(clickAnimation);
//     }, 850);
// }

// function get_featureinfo() {

//     let info_id = 0;

//     // Leider war es nicht möglich über die Standardfunktionen den selection_indicator und die Infobox so auszuschalten
//     // das nach einem Klick beim Messen auch keine Infobox mehr erscheint
//     // Daher wurde eine neue Infobox erstellt, welche ordnungsgemäß funktioniert

//     // inital wird die Input action entfernt, um die initalen Infofelder und den selector nicht zu verwenden
//     viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

//     // var infoBox_one = document.getElementsByClassName("cesium-infoBox cesium-infoBox-bodyless")[0];
//     // if (infoBox_one) {
//     //     console.log("check");
//     //     infoBox_one.hidden = true;
//     // }

//     // Neue Inputaction
//     handler_karte_click = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

//     let infoboxcontainer = document.getElementsByClassName("cesium-viewer-infoBoxContainer")[0];
//     // var selectionindicator_container = document.getElementsByClassName("cesium-viewer-selectionIndicatorContainer")[0];

//     // Neue Infobox
//     let infobox_karte = new Cesium.InfoBox(infoboxcontainer);

//     // set eventlistner for close click on infobox
//     infobox_karte.viewModel.closeClicked.addEventListener(() => {
//         // close infobox
//         closeInfoBox(infobox_karte);
//     });

//     // Neuer Selection Indicator
//     // var selection_indicator = new Cesium.SelectionIndicator(selectionindicator_container, viewer.scene);

//     // var selection_indicator_view = new Cesium.SelectionIndicatorViewModel(viewer.scene, selection_indicator, selectionindicator_container);

//     handler_karte_click.setInputAction(
//         async function(click) {

//             // Show blue marker on click on map
//             ShowClickMarker(click);

//             let table = document.createElement("table");
//             //zum schöner machen die Class 
//             table.className = "cesium-infoBox-defaultTable";

//             let cartesian = viewer.scene.pickPosition(click.position);

//             // Prüfen, ob bereits entitites der infomarker bestehen und falls ja löschen!
//             // Add marker for better UX
//             if (cartesian){
//                 let object = addMarkerClickInfo(cartesian, info_id);
//                 info_id = object.infoID;
//             }

//             // add Longitude and Latitude once to the table for every click
//             await addLongLattoTable(cartesian, table, click);

//             // Entities anklicken
//             let picked_entity = viewer.scene.pick(click.position);

//             let loadingAnimation = loadingInfoTable(table);

//             // loadingAnimation.row.style.display = "table-row";
//             // // loadingAnimation.row.classList.add("hide");
//             // loadingAnimation.animation.style.display = "block";

//             // Add the css from the main html to the iframe html documents head to activate animation in the info Table
//             // Get the content document of the infobox_karte frame
//             let infoboxDoc = infobox_karte.frame.contentDocument;

//             // Check if the link tag already exists in the head
//             let existingLinkTag = infoboxDoc.querySelector('head link[href="./CSS/styleInfoTable.css"]');
//             if (!existingLinkTag) {
//                 // Create a new link tag
//                 let newLinkTag = infoboxDoc.createElement('link');
//                 newLinkTag.rel = 'stylesheet';
//                 newLinkTag.type = 'text/css';
//                 newLinkTag.href = './CSS/styleInfoTable.css';

//                 // Add the new link tag to the head
//                 infoboxDoc.head.appendChild(newLinkTag);
//             } else {
//                 console.log('Link already exists in the head of infobox_karte.frame.contentDocument');
//             }

//             // document.getElementById("loading-row").style.display = "table-row";

//             // bei jedem click wird eine neue Zeile und tD erstellt
//             let tr = document.createElement('tr'); //Zeile
//             let tD = document.createElement('td'); //Datenzelle linksbündig und regular
//             let tD2 = document.createElement('td'); //Datenzelle linksbündig und regular

//             infobox_karte.viewModel.showInfo = true;
//             // update table due to modify table
//             infobox_karte.viewModel.description = table.outerHTML;

//             // let loadingRow = document.getElementsByClassName("loadingRow");
//             // console.log(loadingRow);

//             if (!Cesium.defined(picked_entity)) {
//                 console.log('No features picked.');

//                 // dont show loading animation 
//                 loadingAnimation.row.style.display = "none";
//                 // loadingAnimation.row.classList.add("hide");
//                 loadingAnimation.animation.style.display = "none";
//                 // loadingAnimation.animation.classList.add("hide");

//                 // update description table
//                 infobox_karte.viewModel.description = table.outerHTML;

//                 // let tD = document.createElement('td'); //Überschriftenzelle center und fett dargestellt

//                 // tD.innerHTML = "Test";

//                 // tr.appendChild(tD);
//                 // table.appendChild(tr);

//                 // infobox_karte.viewModel.description = table.outerHTML;

//             } else {

//                 // show loading animation due to data loaded
//                 loadingAnimation.row.style.display = "contents";
//                 //loadingAnimation.row.classList.remove("hide");
//                 loadingAnimation.animation.style.display = "block";
//                 // loadingAnimation.animation.classList.remove("hide");

//                 // Tabellenbeschreibung als HTML
//                 infobox_karte.viewModel.description = table.outerHTML;

//                 if (picked_entity.id instanceof Cesium.Entity) {

//                     let entity = picked_entity.id;

//                     // console.log(typeof entity.label);
//                     if (entity && typeof entity.id === 'string') {

//                         console.log(typeof entity.id);
//                         console.log(entity.id);

//                         if (entity.id.includes("geolocate_point_") || entity.id.includes("distance_marker_") ||
//                             entity.id.includes("point_height_marker") || entity.id.includes("polyline_distance_") ||
//                             entity.id.includes("searchadress_point_") || entity.id.includes("point_info_marker")) {

//                             if (entity.position) {
//                                 // Code to execute if the entity position is defined to place marker on entity 
//                                 let positionEntity = entity.position.getValue(Cesium.JulianDate.now());

//                                 let object = addMarkerClickInfo(positionEntity, info_id);
//                                 info_id = object.infoID;
//                                 let createdEntity = object.Entity;
//                                 // based on the entity set height to show marker on top of the object
//                                 if (entity.id.includes("geolocate_point_")) {
//                                     // set the billboard marker on top of the entity object
//                                     createdEntity.billboard.pixelOffset = new Cesium.Cartesian2(0, -45);
//                                 } else if (entity.id.includes("searchadress_point_")) {
//                                     // set the billboard marker on top of the entity object
//                                     createdEntity.billboard.pixelOffset = new Cesium.Cartesian2(0, -30);
//                                 }
//                                 // set long and lat and other attrbibutes for clicked entity with an position
//                                 table = getFeaturesEntity(entity, table);
//                             } else {
//                                 // for lines or polygons etc.
//                                 table = getFeaturesEntity(entity, table);
//                             }

//                             infobox_karte.viewModel.description = table.outerHTML;

//                         } else {
                            
//                             if (entity.position) {
//                                 // Code to execute if the entity position is defined to place marker at entity
//                                 // only if entity point or someting with an position 
//                                 let positionEntity = entity.position.getValue(Cesium.JulianDate.now());
//                                 let object = addMarkerClickInfo(positionEntity, info_id);
//                                 info_id = object.infoID;
//                                 let createdEntity = object.Entity;
//                                 // set the billboard marker on top of the entity object
//                                 createdEntity.billboard.pixelOffset = new Cesium.Cartesian2(0, -64);
//                               }

//                             // OSM Builings are entitites
//                             // input string
//                             let inputString = entity.description.getValue(Cesium.JulianDate.now());

//                             inputString = inputString.replaceAll('<th>', '<td>');
//                             inputString = inputString.replaceAll('</th>', '</td>');

//                             // TODO
//                             // translateInfoTable(inputString);

//                             // Convert string to HTML document object
//                             let parser = new DOMParser();
//                             let doc = parser.parseFromString(inputString, 'text/html');

//                             let tableRows = doc.querySelectorAll('tr');

//                             for (let i = 0; i < tableRows.length; i++) {
//                                 if (tableRows[i]) {
//                                     table.appendChild(tableRows[i]);
//                                 }
//                             }

//                             loadingAnimation.row.style.display = "none";
//                             // loadingAnimation.row.classList.add("hide");
//                             loadingAnimation.animation.style.display = "none";
//                             // loadingAnimation.animation.classList.add("hide");

//                             infobox_karte.viewModel.description = table.outerHTML;
//                         }

//                     }

//                     // infobox_karte.viewModel.closeClicked.addEventListener(() => {

//                     //     // Prüfen, ob bereits entitites der infomarker bestehen und falls ja löschen!
//                     //     closeInfoBox(infobox_karte);
//                     // });

//                 }
//             }

//             // Gebäude ancklicken
//             // An entity object which will hold info about the currently selected feature for infobox display
//             // var selectedEntity = new Cesium.Entity();

//             // // Pick a new feature
//             // var pickedFeature = viewer.scene.pick(click.position);

//             // if (!Cesium.defined(pickedFeature)) {
//             //     console.log('No features picked.');
//             // } else {

//             //     // Prüfen, ob bereits entitites der infomarker bestehen und falls ja löschen!
//             //     info_id = addMarkerClickInfo(cartesian, info_id);

//             //     if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
//             //         infobox_karte.viewModel.showInfo = true;

//             //         // //Set feature infobox description
//             //         // if (!Cesium.defined(pickedFeature.getProperty('ObjectId'))) {
//             //         //     featureName = pickedFeature.getProperty('gml_id');
//             //         // } else {
//             //         //     featureName = pickedFeature.getProperty('ObjectId');
//             //         // }
//             //         // //var featureName = pickedFeature.getProperty('name');
//             //         // selectedEntity.name = featureName;
//             //         // viewer.selectedEntity = selectedEntity;

//             //         var propertyNames = pickedFeature.getPropertyNames();
//             //         var length = propertyNames.length;

//             //         // var table_citygml = document.createElement("table");
//             //         // //zum schöner machen die Class 
//             //         // table_citygml.className = "cesium-infoBox-defaultTable";

//             //         //Dynamisches erstellen der Tabelle mit den jeweilgen Metadaten über die gesamtanzahl der Attribute bei jedem Klick
//             //         for (var i = 0; i < length; i++) {
//             //             propertyName = propertyNames[i];
//             //             if (pickedFeature.getProperty(propertyName) != null) {
//             //                 //alert(propertyName + ': ' + pickedFeature.getProperty(propertyName));

//             //                 var tr = document.createElement('tr'); //Zeile
//             //                 var th = document.createElement('th'); //Überschriftenzelle center und fett dargestellt
//             //                 var td = document.createElement('td'); //Datenzelle linksbündig und regular

//             //                 th.innerHTML = propertyName;
//             //                 td.innerHTML = pickedFeature.getProperty(propertyName);

//             //                 tr.appendChild(th);
//             //                 tr.appendChild(td);
//             //                 table.appendChild(tr);
//             //             }
//             //         }

//             //         infobox_karte.viewModel.description = table.outerHTML;
//             //         // setzen des Tabellennamens
//             //         // infobox_karte.viewModel.titleText = "Kartenabfrage CityGML";

//             //         //     //Holen des div Tags, der Tabelle enthalten soll 
//             //         //     var div = document.getElementById("infotabelle");

//             //         //     //Hinzufügen der tabelle dynamisch an das div Tag
//             //         //     if (div.childNodes.length < 1) {
//             //         //         div.appendChild(table);
//             //         //     } else {
//             //         //         // Entfernen des ersten Kindknotens (index 0)
//             //         //         div.removeChild(div.childNodes[0]);
//             //         //         div.appendChild(table);
//             //         //     }

//             //         infobox_karte.viewModel.closeClicked.addEventListener(() => {

//             //             // Prüfen, ob bereits entitites der infomarker bestehen und falls ja löschen!
//             //             closeInfoBox(entity);
//             //         });

//             //     }
//             // }

//             //Die Beschreibung der Entität als HTML angegeben, diese erfolgt hier dynamisch, stellt die Tabelle dar
//             // selectedEntity.description = document.getElementById("infotabelle").innerHTML;

//             const pickRay = viewer.camera.getPickRay(click.position);
//             const featuresPromise = viewer.imageryLayers.pickImageryLayerFeatures(pickRay, viewer.scene);
//             if (!Cesium.defined(featuresPromise)) {

//                 console.log('No features picked.');

//                 loadingAnimation.row.style.display = "none";
//                 //loadingAnimation.row.classList.add("hide");
//                 loadingAnimation.animation.style.display = "none";
//                 //loadingAnimation.animation.classList.add("hide");

//                 infobox_karte.viewModel.description = table.outerHTML;

//             } else {

//                 loadingAnimation.row.style.display = "contents";
//                 // loadingAnimation.row.classList.remove("hide");
//                 loadingAnimation.animation.style.display = "block";
//                 // loadingAnimation.animation.classList.remove("hide");

//                 // Tabellenbeschreibung als HTML
//                 infobox_karte.viewModel.description = table.outerHTML;

//                 Promise.resolve(featuresPromise).then(function(features) {

//                     // This function is called asynchronously when the list if picked features is available.

//                     if (features.length > 0) {

//                         for (let element of features) {
//                             // console.log(element.imageryLayer.imageryProvider._layers);

//                             if (element.description && element.data.geometryType === "esriGeometryPolygon") {
//                                 let count = Object.keys(element.properties).length;

//                                 // input string
//                                 let inputString = element.description;

//                                 // translateInfoTable(inputString);

//                                 // Convert string to HTML document object
//                                 let parser = new DOMParser();
//                                 let doc = parser.parseFromString(inputString, 'text/html');

//                                 let tableRows = doc.querySelectorAll('tr');

//                                 for (let i = 0; i < count; i++) {
//                                     if (tableRows[i]) {

//                                         // trElement.appendChild(thElement);
//                                         // tr.appendChild(tdElement);
//                                         table.appendChild(tableRows[i]);
//                                     }
//                                 }

//                                 // console.log(table.outerHTML);
//                                 // Nur das erste Element aus der langen Liste soll angezeigt werden, daher break nach dem ersten Element
//                                 break;

//                             } else {

//                                 // WMS Data
//                                 // input string
//                                 let inputString = element.description;

//                                 // translateInfoTable(inputString);

//                                 // Convert string to HTML document object
//                                 let parser = new DOMParser();
//                                 let doc = parser.parseFromString(inputString, 'text/html');

//                                 let tableRows = doc.querySelectorAll('tr');

//                                 for (let i = 0; i < tableRows.length; i++) {
//                                     if (tableRows[i]) {
//                                         console.log(tableRows[i]);
//                                         table.appendChild(tableRows[i]);
//                                     }
//                                 }
//                             }

//                             // infobox_karte.viewModel.description = table.outerHTML;

//                         }

//                         // when all features are queryed, dont show the loading animation
//                         loadingAnimation.row.style.display = "none";
//                         // // loadingAnimation.row.classList.add("hide");
//                         loadingAnimation.animation.style.display = "none";
//                         // // loadingAnimation.animation.classList.add("hide");

//                         // translateInfoTable(table.outerHTML);

//                         // Tabellenbeschreibung als HTML
//                         infobox_karte.viewModel.description = table.outerHTML;

//                     }

//                     // when no features are queryed, dont show the loading animation
//                     loadingAnimation.row.style.display = "none";
//                     // // loadingAnimation.row.classList.add("hide");
//                     loadingAnimation.animation.style.display = "none";
//                     // // loadingAnimation.animation.classList.add("hide");

//                     // Tabellenbeschreibung als HTML
//                     infobox_karte.viewModel.description = table.outerHTML;

//                 });

//             }

//             // setzen des Tabellennamens
//             infobox_karte.viewModel.titleText = "Abfrageergebnisse";

//         }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
// }

// function getFeaturesEntity(entity, table) {

//     console.log(entity);

//     if (entity.position) {
//         let posEntity = entity.position.getValue(Cesium.JulianDate.now());

//         let cartographic = Cesium.Cartographic.fromCartesian(posEntity);
//         let longitude = Cesium.Math.toDegrees(cartographic.longitude);
//         let latitude = Cesium.Math.toDegrees(cartographic.latitude);
//         let altitude = cartographic.height;
//         let altitudeString = Math.round(altitude).toString();

//         // safe values from point in array
//         let arr = ["Longitude", longitude.toFixed(5) + " °", "Latitude", latitude.toFixed(5) + " °", "Altitude (WGS84)", altitudeString + " meter", "Object", entity.name, "Description", entity.description];
//         let counter = 1;

//         for (let i = 0; i < arr.length; i += 2) {
//             let tr = document.createElement('tr'); //Zeile
//             let tD = document.createElement('td');
//             let tD2 = document.createElement('td');
//             tD.innerHTML = arr[i];
//             tD2.innerHTML = arr[i + 1];

//             tr.appendChild(tD);
//             tr.appendChild(tD2);
//             table.appendChild(tr);
//             table.replaceChild(tr, table.children[counter++]);
//             // console.log(table.children[counter++]);
//         }
//     } else {
//         // If position is not defined, add a row to the table with "undefined" values
//         let tr = document.createElement('tr');
//         let tD = document.createElement('td');
//         let tD2 = document.createElement('td');
//         tD.innerHTML = "Longitude";
//         tD2.innerHTML = "undefined";

//         tr.appendChild(tD);
//         tr.appendChild(tD2);
//         table.appendChild(tr);
//         table.replaceChild(tr, table.children[1]);

//         tr = document.createElement('tr');
//         tD = document.createElement('td');
//         tD2 = document.createElement('td');
//         tD.innerHTML = "Latitude";
//         tD2.innerHTML = "undefined";

//         tr.appendChild(tD);
//         tr.appendChild(tD2);
//         table.appendChild(tr);
//         table.replaceChild(tr, table.children[2]);

//         tr = document.createElement('tr');
//         tD = document.createElement('td');
//         tD2 = document.createElement('td');
//         tD.innerHTML = "Objekt";
//         tD2.innerHTML = entity.name;

//         tr.appendChild(tD);
//         tr.appendChild(tD2);
//         table.appendChild(tr);
//         table.replaceChild(tr, table.children[3]);
//     }

//     return table;
// }

// async function addLongLattoTable(cartesian, table, click) {

//     if (cartesian) {

//         let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
//         let longitude = Cesium.Math.toDegrees(cartographic.longitude);
//         let latitude = Cesium.Math.toDegrees(cartographic.latitude);
//         // let altitude = cartographic.height;
//         // let altitudeWGS84 = viewer.scene.globe.getHeight(cartographic);
//         // let altitudeString = Math.round(altitudeWGS84).toString();

//         let altitudeString;

//         // calc height of point on terrain due to cartographic.height negativ values
//         await Cesium.sampleTerrain(viewer.terrainProvider, 13, [cartographic]).then(function(samples) {
//             let heightTerrain = samples[0].height;
//             altitudeString = Math.round(heightTerrain).toString();
//         });

//         let arr = ["Longitude", longitude.toFixed(5) + " °", "Latitude", latitude.toFixed(5) + " °", "Altitude (WGS84)", altitudeString + " meter"];

//         for (let i = 0; i < arr.length; i += 2) {
//             let tr = document.createElement('tr'); //Zeile
//             let tD = document.createElement('td');
//             let tD2 = document.createElement('td');
//             tD.innerHTML = arr[i];
//             tD2.innerHTML = arr[i + 1];

//             tr.appendChild(tD);
//             tr.appendChild(tD2);
//             table.appendChild(tr);
//         }

//     } else {

//         // Get the click position in the map
//         var windowPosition = new Cesium.Cartesian2(click.position.x, click.position.y);
//         var clickPosition = viewer.camera.pickEllipsoid(windowPosition, viewer.scene.globe.ellipsoid);

//         if (!clickPosition) {
//             // Add row no data selected
//             let noDataRow = table.insertRow(0);

//             noDataRow.innerText = "No data here.";
//         }

//     }
// }

// function closeInfoBox(infoBox) {

//     let array_entities = [];
//     // löschen der Werte aus dem Array!
//     for (let teil of viewer.entities.values) {
//         if (teil.id.includes("point_info_marker")) {
//             array_entities.push(teil);
//             console.log("info point");
//         }
//     }

//     // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
//     for (let entity of array_entities) {
//         console.log("info point removed");
//         viewer.entities.remove(entity);
//     }

//     // Explicitly render a new frame
//     viewer.scene.requestRender();

//     infoBox.viewModel.showInfo = false;
// }

// function addMarkerClickInfo(cartesian, info_id) {

//     // let array_entities = [];
//     // löschen der Werte aus dem Array!
//     for (let teil of viewer.entities.values) {
//         if (teil.id.includes("point_info_marker")) {
//             // array_entities.push(teil);
//             // console.log(teil.id);
//             viewer.entities.remove(teil);
//         }
//     }

//     // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
//     // for (let entity of array_entities) {
//     //     console.log("info point removed");
//     //     viewer.entities.remove(entity);
//     // }

//     let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
//     let longitude = Cesium.Math.toDegrees(cartographic.longitude);
//     let latitude = Cesium.Math.toDegrees(cartographic.latitude);
//     let altitude = cartographic.height;
//     // let altitude = viewer.scene.globe.getHeight(cartographic);

//     let entity = viewer.entities.add({
//         name: "Point info marker",
//         position: Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude),
//         description: "Infomarker for getting information from the globe",
//         billboard: {
//             image: "./Icons/output-onlinejpgtools.jpg",
//             //uri: "./glb/infopointGLB.glb",
//             // scale: 25,
//             //allowPicking: false,
//             distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 4000.0),
//             scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 2000, 0.6),
//             heightReference: Cesium.HeightReference.NONE,
//             // Darstellung auch auf Gebäuden, auf clamptoground kann verzichtet werden
//             // Damit das billboard nicht im boden versinkt, wird pixeloffset verwendet
//             pixelOffset: new Cesium.Cartesian2(0, -20),
//             disableDepthTestDistance: Number.POSITIVE_INFINITY // disable depth testing for the point
//         },
//         id: 'point_info_marker' + info_id++
//     });

//     // Explicitly render a new frame für info marker
//     viewer.scene.requestRender();

//     return {infoID: info_id, Entity: entity};
// }