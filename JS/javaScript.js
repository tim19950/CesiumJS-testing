import { loadAnimationGeoJSON, stopLoadAnimationGeoJSON, startLoadingAnimationWMS, stopLoadingAnimationWMS, loadingInfoTable } from './loadAnimations.js';
import { updateCesiumContainerHeight, updateMaxHeightLayerMenu } from './responsiveDesign.js';
import { toggleLanguage, deleteLanguageSwitchModal } from './languageSwitch.js';
import { translate, translateButtonTitle, translateInfoTable, translateToast } from './translate.js';
import { tour_steps_ger, tour_steps_eng, tour_steps_th, buttonTextGer, buttonTextEng, buttonTextThai } from './toursteps.js';


let viewer;
let handler_karte_click;

let globalList = [];

window.addEventListener('load', function() {
    start();
});

function start() {

    Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE3NThhYi01N2QyLTRlYjgtODVjOC0yNmZmOTVkMjc5NmUiLCJpZCI6MjAzMTcsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1ODU2NDYwOTh9.15deq-wlgG1etoMnlMVacxOD48gTv1p85401mlsO6P8";

    // Auf NRW zoomen am Start
    var extent = Cesium.Rectangle.fromDegrees(
        5.863953,
        51.042848,
        9.103,
        51.857073
    );

    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
    Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

    // Create ArcGIS Map imagery provider
    let esri = new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
    });
    let esriLayer = new Cesium.ImageryLayer(esri, {
        rectangle: Cesium.Rectangle.MAX_VALUE
    });

    // Create the OSM imagery provider
    let osmProvider = new Cesium.OpenStreetMapImageryProvider({
        url: 'https://a.tile.openstreetmap.org/',
        credit: "MapQuest, Open Street Map and contributors, CC-BY-SA"
    });

    // Create a CesiumJS imagery layer using the OSM provider
    let osmLayer = new Cesium.ImageryLayer(osmProvider);

    // // Create VR World terrain provider
    // let VRWorldTerrainProvider = new Cesium.VRTheWorldTerrainProvider({
    //     url: 'http://www.vr-theworld.com/vr-theworld/tiles1.0.0/73/'
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
        maximumRenderTimeChange: Infinity
    });

    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.scene.globe.lightingFadeOutDistance = Infinity;
    viewer.scene.globe.lightingFadeInDistance = Infinity;

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
    geolocate();
    geocodieren();
    clear_geocodes();
    setInterval(choose_geocode, 800);
    add_external_geodata();
    MutationObserverDOM();
    add_external_service();
    measureFunctions();
    // measure_height();
    // measure_distance();
    popover_tour();
    get_featureinfo();
    // interval_delete_layer = setInterval(createLayerdeleteExternalData, 500);
    // handlingOSMmap(osmLayer, esriLayer);
    // handlingESRIMap(esriLayer, osmLayer);
    handlingImagery(osmLayer, esriLayer);
    handlingOSMBuildings();
    handlingTerrain(worldTerrain, EllipsoidTerrainProvider);

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

function addCreditsIcons() {
    // Add a credit with a tooltip, image and link to display onscreen
    let creditIcons8 = new Cesium.Credit(`<a href="http://icons8.com/icons" target="_blank">Icons8 Icons</a>`);
    viewer.creditDisplay.addStaticCredit(creditIcons8);

    let creditFontAwesome = new Cesium.Credit(`<a href="https://fontawesome.com/" target="_blank">Fontawesome Icons</a>`);
    viewer.creditDisplay.addStaticCredit(creditFontAwesome);
}

function addGeolocationButton() {

    const modeButton = document.getElementsByClassName("cesium-button cesium-toolbar-button cesium-home-button")[0];

    let geolocation_button = document.createElement("button");
    geolocation_button.setAttribute("class", "cesium-button cesium-toolbar-button");
    geolocation_button.setAttribute("id", "geolocate_button_toolbar");
    geolocation_button.setAttribute("type", "button");
    geolocation_button.setAttribute("title", "Positionsbestimmung");

    geolocation_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="27" height="28"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 0c17.7 0 32 14.3 32 32V66.7C368.4 80.1 431.9 143.6 445.3 224H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H445.3C431.9 368.4 368.4 431.9 288 445.3V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V445.3C143.6 431.9 80.1 368.4 66.7 288H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H66.7C80.1 143.6 143.6 80.1 224 66.7V32c0-17.7 14.3-32 32-32zM128 256a128 128 0 1 0 256 0 128 128 0 1 0 -256 0zm128-80a80 80 0 1 1 0 160 80 80 0 1 1 0-160z"/></svg>';

    modeButton.before(geolocation_button);

    // toolbar.insertBefore(geolocation_button, modeButton);
}

function addMeasureButtons() {

    const geolocateButton = document.getElementById("geolocate_button_toolbar");

    let measure_height_button = document.createElement("button");
    measure_height_button.setAttribute("class", "cesium-button cesium-toolbar-button d-none d-lg-block");
    measure_height_button.setAttribute("id", "measure_height_button_toolbar");
    measure_height_button.setAttribute("type", "button");
    measure_height_button.setAttribute("title", "Höhen messen");

    measure_height_button.innerHTML = '<img src="./Icons/height-marker-white-96.svg" width="30" height="31"><a href="http://icons8.com/icons"</a></img>';

    // add measure height button after the geolocate button
    geolocateButton.after(measure_height_button);
    // toolbar.insertBefore(measure_height_button, modeButton);

    let measure_distance_button = document.createElement("button");
    measure_distance_button.setAttribute("class", "cesium-button cesium-toolbar-button d-none d-lg-block");
    measure_distance_button.setAttribute("id", "measure_distance_button_toolbar");
    measure_distance_button.setAttribute("type", "button");
    measure_distance_button.setAttribute("title", "Strecken messen");

    measure_distance_button.innerHTML = '<img src="./Icons/measure-line-white-outline.svg" width="30" height="32"><a href="http://icons8.com/icons"</a></img>';

    // measure_distance_button.innerHTML = '<i class="fa-solid fa-ruler-horizontal fa-xl" style="color: #ffffff;"></i>';
    // add measure distance button after the measure_height_button
    measure_height_button.after(measure_distance_button);

}

function translateButtonTitles() {

    // set IDs of elements that dont have an id yet
    document.querySelector('[title="3D"]').id = "3D";
    document.querySelector('[title="2D"]').id = "2D";
    document.querySelector('[title="Columbus View"]').id = "Columbus-view";

    // Get all img tags
    const imgTags = document.querySelectorAll('img.eng, img.thai, img.ger');
    // safe IDs in array
    const buttonIds = ['3D', '2D', 'Columbus-view', 'measure_height_button_toolbar', 'measure_distance_button_toolbar', 'geolocate_button_toolbar', 'menu_btn', 'homebutton', 'help_button', 'fullscreen'];

    // loop through the img tags
    for (let imgTag of imgTags) {
        // when each imgTag got clicked
        imgTag.onclick = function() {
            const lang = imgTag.classList[0];
            // use forEach loop to iterate over buttonarray to use function translateButtonTitle only once
            buttonIds.forEach(id => translateButtonTitle(lang, document.getElementById(id)));
        };
    }
}

function handlingImagery(osmLayer, esriLayer) {

    let layerESRIImg = document.getElementById("layer_img_2");
    // remove eventlistener, terrain can not be deactivated
    layerESRIImg.removeEventListener("click", toggleActiveImgItem);
    handlingESRIMap(esriLayer);

    // EllisiodTerrainImg.addEventListener("click", ChangeTerrainEllipsoidWGS84);

    let layerOSMImg = document.getElementById("layer_img_1");

    // remove eventlistener, layerOSM can not be deactivated
    layerOSMImg.removeEventListener("click", toggleActiveImgItem);
    handlingOSMmap(osmLayer);
    // layerVRWorldTerrainImg.addEventListener("click", ChangeTerrainVRWorld);
}


function handlingESRIMap(esriLayer) {

    // // Möglichkeit zwei, ich erstelle über eine schleife eventlistener aller layer (die schon existieren)
    // // wird nur mit dom obersver bei dem dynamischen wms layern funktionieren wahrscheinlich
    // if (!viewer.imageryLayers.contains(OSMImageryLayer)) {
    //     viewer.imageryLayers.add(OSMImageryLayer);
    //     console.log("initial");
    // } else {
    //     viewer.imageryLayers.remove(OSMImageryLayer, false);
    //     console.log("remove");
    // }

    let layerESRIImg = document.getElementById("layer_img_2");
    let layerOSMImg = document.getElementById("layer_img_1");

    layerESRIImg.addEventListener("click", function(event) {

        if (!event.target.classList.contains('active')) {

            console.log(event.target.classList);

            event.target.classList.add("active");
            event.target.parentElement.children[1].classList.add("active");

            // viewer.imageryProvider = esriLayer.imageryProvider;
            viewer.imageryLayers.remove(viewer.imageryLayers.get(0), false);
            viewer.imageryLayers.add(esriLayer, 0);
            console.log(viewer.imageryLayers);
            layerOSMImg.classList.remove("active");
            layerOSMImg.parentElement.children[1].classList.remove("active");

        }

        // if (event.target.classList.contains('active') && !viewer.imageryLayers.contains(esriLayer)) {
        //     if (typeof document.getElementById("section_4")) {
        //         viewer.imageryLayers.add(esriLayer);
        //         viewer.imageryLayers.lower(esriLayer);
        //     } else
        //         viewer.imageryLayers.add(esriLayer);
        //     console.log("initial added ESRI imagery");
        // } else {
        //     // load OSM imagery when clicked
        //     // console.log(event.target.parentElement.getAttribute('id'));
        //     // loadOSMMap(osmLayer, event.target.getAttribute('class'));
        //     console.log("ESRI contains already. The ESRI layer gets deleted.");
        //     // console.log(ESRIBaseLayer.imageryProvider.credit.html);
        //     viewer.imageryLayers.remove(esriLayer, false);
        // }
    });

    // console.log(viewer.imageryLayers);
}

function handlingOSMmap(osmLayer) {

    let layerOSMImg = document.getElementById("layer_img_1");

    let layerESRIImg = document.getElementById("layer_img_2");

    layerOSMImg.addEventListener("click", function(event) {

        console.log(event.target.classList);

        if (!event.target.classList.contains('active')) {

            event.target.classList.add("active");
            event.target.parentElement.children[1].classList.add("active");

            viewer.imageryLayers.remove(viewer.imageryLayers.get(0), false);
            viewer.imageryLayers.add(osmLayer, 0);
            console.log(viewer.imageryLayers);
            // viewer.imageryLayers.add(osmLayer, 0);
            layerESRIImg.classList.remove("active");
            layerESRIImg.parentElement.children[1].classList.remove("active");

        }

        // // Three cases if clicked
        // // First, check if not active and the baselayer has the credit, then remove the base layer (Layer on pos 0 in list)
        // if (!event.target.classList.contains('active') && !viewer.imageryLayers.contains(osmLayer)) {
        //     console.log("OSM baselayer contains already. The osm layer gets deleted.");
        //     console.log(viewer.imageryLayers);
        //     console.log(viewer.imageryLayers.get(0).imageryProvider.credit.html);
        //     if (viewer.imageryLayers.get(0).isBaseLayer() && viewer.imageryLayers.get(0).imageryProvider.credit.html === "MapQuest, Open Street Map and contributors, CC-BY-SA") {
        //         viewer.imageryLayers.remove(viewer.imageryLayers.get(0), false);
        //     }
        //     // var osmBaseLayer = viewer.imageryLayers.get(0);
        //     // viewer.imageryLayers.remove(osmBaseLayer, false);
        //     // Secondly, if the layer already was added in the past via the variable osmLayer, then remove
        // } else if (!event.target.classList.contains('active') && viewer.imageryLayers.contains(osmLayer)) {
        //     // remove OSM imagery when clicked
        //     console.log("OSM layer contains already. The osm layer gets deleted.");
        //     viewer.imageryLayers.remove(osmLayer, false);
        //     // if either of the two cases is true, add the osmLayer
        // } else {
        //     viewer.imageryLayers.add(osmLayer, 0);
        //     console.log("added osm layer");

        // }
    });

}

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

// Define the event listener function
function cameraChangedListener() {
    console.log('Camera changed!');

    var cameraHeight = 0;
    var cameraPosition = viewer.camera.positionCartographic;
    cameraHeight = cameraPosition.height;
    console.log(cameraHeight / 1000);

    //Aufruf der function, die die Geodaten hinzufügt
    fetchURL();

}

function handlingOSMBuildings() {

    let layerOSMBuildingsimg = document.getElementById("layer_img_3");

    layerOSMBuildingsimg.addEventListener("click", function(event) {

        console.log(event.target.classList);

        if (event.target.classList.contains('active')) {

            let VRWorldTerrainImg = document.getElementById("layer_img_5");
            if (VRWorldTerrainImg.classList.contains('active')) {

                let modal = new bootstrap.Modal(document.querySelectorAll("[id^='modal_osm_buildings_clamping']")[0]);
                let modalHeader = document.getElementById("exampleModalLabel");
                let modalBody = document.getElementById("modal_body_osm_buildings_clamping");
                let buttonOK = document.getElementById("ok_button_osm_buildings_terrain");
                let newID = "modal_osm_buildings_clamping";
                document.querySelectorAll("[id^='modal_osm_buildings_clamping']")[0].id = newID;
                // modalBody.innerText = "Für die Aktiverung des Geländes mit eingeschalteten Gebäuden werden aus Performancegründen keine Gebäude auf dem Gelände dargestellt. Daher werden die Gebäude nur auf dem WGS84 Ellipsiod dargestellt und visualiert.";

                translate(modalHeader, modalBody, undefined, undefined, buttonOK);

                modal.show();

            } else {

                console.log("ShowBuildings");

                ShowBuildings();

            }

        } else {

            console.log("DontShowBuildings");

            DontShowBuildings();

            // clearInterval(interval_buildings);
            // // alle intervalle instanzen auf null setzen
            // interval_buildings = null;
            // while (interval_buildings !== null) {
            //     interval_buildings = null;
            // }

        }
    });
}

function DontShowBuildings() {

    viewer.camera.changed.removeEventListener(cameraChangedListener);

    for (let i = 0; i < viewer.dataSources.length; i++) {

        let datasource = viewer.dataSources.get(i);
        // console.log(datasource);

        if (datasource.name && datasource.name.startsWith("Buildings") && datasource.show === true) {

            // datasource.show = false;
            for (let datasource of globalArray) {
                viewer.dataSources.remove(datasource);
            }
            // console.log(viewer.dataSources.remove(datasource));
            globalArray = [];
            cartesian_array = [];

        }
    }
    // Explicitly render a new frame
    viewer.scene.requestRender();

    // remove cameraChangedListener
    console.log('Camera listener removed!');
}

function ShowBuildings() {

    // for (let i = 0; i < viewer.dataSources.length; i++) {

    //     var datasource = viewer.dataSources.get(i);
    //     if (viewer.dataSources.get(i).name && viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show === false) {

    //         datasource.show = true;
    //     }
    // }

    // Explicitly render a new frame
    viewer.scene.requestRender();

    // if (!interval_buildings)
    //     interval_buildings = setInterval(fetchURL, 1000);

    viewer.camera.percentageChanged = 1;
    // Add the event listener
    viewer.camera.changed.addEventListener(cameraChangedListener);

    console.log("Buildings einschalten");
}

function toggleActiveImgItem(event) {
    // Image und span tags auf active setzen und attribut listener hinzufügen, damit nicht mehrfach hinzugefügt wird
    var imgItem = event.target;
    imgItem.classList.toggle("active");
    imgItem.parentElement.children[1].classList.toggle("active");
    // console.log(event.target.parentElement.getAttribute('id'));
    // let id = event.target.parentElement.getAttribute('id');
    // load esri imagery when clicked
    // loadArcGisMapServerImageryProvider(esriLayer, id);
}


function markActiveSelectedLayers() {

    // damit die Layer grün werden bei betätigung um den nutzer über den Zusatand zu informieren, werden in der Karte angezeigt
    var imgItems = document.getElementsByClassName("img_layers");

    // set imgitems active when clicked
    for (const imgItem of imgItems) {
        // console.log(layerItem);
        // check if listener already defined
        if (!imgItem.getAttribute('listener')) {

            imgItem.setAttribute('listener', 'true');
            imgItem.parentElement.children[1].setAttribute('listener', 'true');

            imgItem.addEventListener("click", toggleActiveImgItem);
        }
    }

}

function StopCloseMenu() {
    // Das Layermenü soll bei auswahl nicht ausgeblendet werden
    var layerItems = document.getElementsByClassName("dropdown-item layermenu");

    for (const layerItem of layerItems) {
        // console.log(layerItem);
        if (!layerItem.getAttribute('listenerStopPropagation')) {
            layerItem.setAttribute('listenerStopPropagation', 'true');

            layerItem.addEventListener("click", function(event) {
                // menu dont close when items are clicked
                event.stopPropagation();

            });
        }
    }

}

function LayerMenu() {

    const modeButton = document.getElementsByClassName("cesium-button cesium-toolbar-button cesium-home-button")[0];

    const layer_menue_btn = document.getElementById("layermenue_button_toolbar");

    modeButton.before(layer_menue_btn);
    // layer_menue_btn.insertBefore(modeButton);
    // toggle class CSS active when clicked to show menu
    layer_menue_btn.classList.toggle("active");

    // mark the active selected layers in the menu
    markActiveSelectedLayers();
    // Stop close the menu when clicked
    StopCloseMenu();

}

function ChangeTerrainEllipsoidWGS84(event, EllipsoidTerrainProvider) {

    let layerVRWorldTerrainimg = document.getElementById("layer_img_5");
    let layerOSMBuildingsimg = document.getElementById("layer_img_3");

    console.log(event.target.classList);

    if (!event.target.classList.contains('active')) {

        if (layerOSMBuildingsimg.classList.contains('active')) {
            console.log("remove buildings");
            // remove buildings and fetch new one, better then reprojection
            DontShowBuildings();
            ShowBuildings();
        }

        event.target.classList.add("active");
        event.target.parentElement.children[1].classList.add("active");

        viewer.terrainProvider = EllipsoidTerrainProvider;
        layerVRWorldTerrainimg.classList.remove("active");
        layerVRWorldTerrainimg.parentElement.children[1].classList.remove("active");
    }
}

function ChangeTerrainVRWorld(event, worldTerrain) {

    let EllisiodTerrainImg = document.getElementById("layer_img_4");

    console.log(event.target.classList);

    if (!event.target.classList.contains('active')) {

        let layerOSMBuildingsimg = document.getElementById("layer_img_3");
        if (layerOSMBuildingsimg.classList.contains('active')) {

            let modal = new bootstrap.Modal(document.querySelectorAll("[id^='modal_osm_buildings_clamping']")[0]);
            let modalHeader = document.getElementById("exampleModalLabel");
            let modalBody = document.getElementById("modal_body_osm_buildings_clamping");
            let buttonOK = document.getElementById("ok_button_osm_buildings_terrain");
            let newID = "modal_osm_buildings_clamping_2";
            document.querySelectorAll("[id^='modal_osm_buildings_clamping']")[0].id = newID;
            console.log(document.getElementById("modal_osm_buildings_clamping_2").id);
            // buttonOK.innerText = "Okay, fortfahren";
            // modalHeader.innerText = "Information";
            // modalBody.innerText = "Wenn die Gebäude auf dem Gelände dargestellt werden, wird eine höhere Rechnerleistung benötigt.";
            // modalBody.innerText = "Aus Performancegründen werden keine Gebäude auf dem VR-TheWorld Gelände dargestellt. Daher werden die Gebäude nur auf dem WGS84 Ellipsiod dargestellt und visualiert.";

            translate(modalHeader, modalBody, undefined, undefined, buttonOK);

            modal.show();
        }

        event.target.classList.add("active");
        event.target.parentElement.children[1].classList.add("active");

        viewer.terrainProvider = worldTerrain;
        EllisiodTerrainImg.classList.remove("active");
        EllisiodTerrainImg.parentElement.children[1].classList.remove("active");

    }
}

function handlingTerrain(worldTerrain, EllipsoidTerrainProvider) {

    check_cesium_terrain_buildings(worldTerrain, EllipsoidTerrainProvider);

    let EllisiodTerrainImg = document.getElementById("layer_img_4");

    // remove eventlistener, terrain can not be deactivated
    EllisiodTerrainImg.removeEventListener("click", toggleActiveImgItem);
    EllisiodTerrainImg.addEventListener("click", function(event) {
        ChangeTerrainEllipsoidWGS84(event, EllipsoidTerrainProvider);
    });

    let layerVRWorldTerrainImg = document.getElementById("layer_img_5");

    // remove eventlistener, terrain can not be deactivated
    layerVRWorldTerrainImg.removeEventListener("click", toggleActiveImgItem);
    layerVRWorldTerrainImg.addEventListener("click", function(event) {
        ChangeTerrainVRWorld(event, worldTerrain);
    });

}

function remove_external_layers() {

    document.getElementById("layer_delete_button").addEventListener('click', () => {

        let my_modal = new bootstrap.Modal(document.getElementById("modal_delete_all_data"));
        let modalbody = document.getElementById("modal_body_delete_all_data");
        // body.innerText = "Möchten Sie wirklich alle externen Geodaten aus der Szene entfernen?";

        translate(undefined, modalbody, undefined, undefined);

        my_modal.show();
    });

    document.getElementById("ok_button_delete_all_data").addEventListener('click', () => {

        let section_4 = document.getElementById("section_4");

        // Remove all child elements from section 4
        while (section_4.firstChild) {
            // delete the wms layers from the viewer
            for (let i = 0; i < viewer.imageryLayers.length; i++) {
                if (section_4.firstChild.dataset && section_4.firstChild.dataset.layerswms && section_4.firstChild.dataset.layerswms === viewer.imageryLayers.get(i).imageryProvider._layers) {
                    let imageryLayer = viewer.imageryLayers.get(i);
                    viewer.imageryLayers.remove(imageryLayer);
                    console.log("deleted imagery wms");
                }
            }

            // delete the GeoJSON layers from the viewer
            for (let i = 0; i < viewer.dataSources.length; i++) {
                console.log(viewer.dataSources.get(i).name);
                if (section_4.firstChild.dataset && section_4.firstChild.dataset.filelayergeojson && section_4.firstChild.dataset.filelayergeojson === viewer.dataSources.get(i).name) {
                    let geoJSONdataSource = viewer.dataSources.get(i);
                    viewer.dataSources.remove(geoJSONdataSource, true);
                    console.log("deleted geoJSON");
                }
            }

            // Explicitly render a new frame
            viewer.scene.requestRender();

            // delete layers from the menu
            section_4.removeChild(section_4.firstChild);
        }

        if (document.getElementById("layer_delete_button")) {
            // wenn die Layer entfernt wurden soll der Button wieder entfernt werden
            let layer_del = document.getElementById("layer_delete_button");
            layer_del.remove();
        }

        section_4.style.display = "none";

        let section4Text = document.getElementById("section_4_text");
        section4Text.style.display = "none";

    });

}


function createLayerdeleteExternalData() {

    let LayerMenuToolbar = document.getElementById("layermenue_button_toolbar");

    if (!document.getElementById("layer_delete_button")) {

        var layer_delete_button = document.createElement("button");
        layer_delete_button.setAttribute("class", "btn btn-outline-secondary cesium-toolbar-button cesium-button");
        layer_delete_button.setAttribute("id", "layer_delete_button");
        layer_delete_button.setAttribute("type", "button");
        // layer_delete_button.setAttribute("title", "Alle externen Layer löschen");

        layer_delete_button.innerHTML = '<div style="text-align:center;" style="width: 20px; height: 20px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-70 -50 600 600"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg></div>';

        // toolbar.insertBefore(layer_delete_button, layerpicker);

        LayerMenuToolbar.before(layer_delete_button);
    }

    // clearInterval(interval_delete_layer);
    // // alle intervalle instanzen auf null setzen
    // interval_delete_layer = null;
    // while (interval_delete_layer !== null) {
    //     interval_delete_layer = null;
    // }

    // function with listeners to for the modal
    remove_external_layers();

    // wenn die Layer entfernt wurden soll der Button wieder entfernt werden
    // layer_delete_button.remove();

    // ein neues Intervall wird gestartet
    // interval_delete_layer = setInterval(create_layerdelete, 500);

}

function ausgabe() {
    console.log("Gelände geändert");
    // console.log(viewer.scene.globe.terrainProvider);
}

function check_cesium_terrain_buildings(VRWorldTerrainProvider, EllipsoidTerrainProvider) {

    const evt = viewer.scene.globe.terrainProviderChanged;
    evt.addEventListener(ausgabe);

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

            console.log("a");

        } else {

            console.log("b");

            // Gebäude Layer ausschalten im menu
            layerOSMBuildingsimg.classList.remove("active");
            layerOSMBuildingsimg.parentElement.children[1].classList.remove("active");
        }

    });

    document.getElementById("ok_button_osm_buildings_terrain").addEventListener("click", () => {

        // Buildings are activated and we click on the VR Terrain button
        if (layerItemsElements[0].id === "modal_osm_buildings_clamping_2") {

            // // set terrainProvider
            // viewer.terrainProvider = VRWorldTerrainProvider;
            // // set layers VR world terrain to active
            // layerVRWorldTerrainimg.classList.add("active");
            // layerVRWorldTerrainimg.parentElement.children[1].classList.add("active");
            // // dont set layers Ellisiod terrain to active
            // layerEllipsoidTerrainimg.classList.remove("active");
            // layerEllipsoidTerrainimg.parentElement.children[1].classList.remove("active");

            // Gebäude entfernen nachdem bestätigt worden ist
            // for (let i = 0; i < viewer.dataSources.length; i++) {

            //     var datasource = viewer.dataSources.get(i);
            //     if (viewer.dataSources.get(i).name.startsWith("Buildings")) {

            //         datasource.show = false;

            //     }
            // }

            // Fetchen neuer Gebäude
            // viewer.camera.changed.addEventListener(cameraChangedListener);

            // delete old buildings and fetch new one
            DontShowBuildings();
            ShowBuildings();

            // for (let datasource of globalArray) {
            //     viewer.dataSources.remove(datasource, true);
            // }

            // globalArray = [];
            // cartesian_array = [];

            // Gebäude Layer ausschalten im menu
            // layerOSMBuildingsimg.classList.remove("active");
            // layerOSMBuildingsimg.parentElement.children[1].classList.remove("active");

            // Fetchen neuer Gebäude ausschalten
            // remove cameraChangedListener
            // viewer.camera.changed.removeEventListener(cameraChangedListener);
            console.log('new Camera listener added!');

        } else {

            // VR Terrain is activated and we click on the OSM Buildings button

            // // Remove VR World terrain
            // viewer.terrainProvider = EllipsoidTerrainProvider;
            // // Farblich nicht aktiv setzten des layers VR world terrain im menu
            // layerVRWorldTerrainimg.classList.remove("active");
            // layerVRWorldTerrainimg.parentElement.children[1].classList.remove("active");

            // // Farblich aktiv setzten des layers Ellipsiod terrain im menu
            // layerEllipsoidTerrainimg.classList.add("active");
            // layerEllipsoidTerrainimg.parentElement.children[1].classList.add("active");

            // Activate Buildings
            // for (let i = 0; i < viewer.dataSources.length; i++) {

            //     var datasource = viewer.dataSources.get(i);
            //     if (viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show == false) {

            //         datasource.show = true;
            //     }
            // }

            DontShowBuildings();
            ShowBuildings();

            // Add the event listener to fetch new buldings
            // viewer.camera.changed.addEventListener(cameraChangedListener);
            console.log('Camera listener added!');
        }

        // for (let element of document.getElementsByClassName("cesium-baseLayerPicker-itemLabel")) {
        //     if (element.innerHTML === "Cesium World Terrain") {
        //         element.style = "color: rgb(0, 255, 106);"
        //         element.parentNode.className = 'cesium-baseLayerPicker-item cesium-baseLayerPicker-selectedItem';
        //     } else if (element.innerHTML === "WGS84 Ellipsoid") {
        //         element.style = "";
        //         //Remove the CSS class using classList.remove()
        //         element.parentNode.className = 'cesium-baseLayerPicker-item';
        //     }
        // }

        // for (i = 0; i < viewer.dataSources.length; i++) {
        //     // var datasource = viewer.dataSources.get(i);
        //     if (viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show == true) {
        //         //Get the array of entities

        //         console.log(viewer.dataSources.get(i).name);

        //         const entities = viewer.dataSources.get(i).entities.values;

        //         for (let i = 0; i < entities.length; i++) {
        //             const entity = entities[i];

        //             // cesiumJS algorithmus
        //             // entity.polygon.height = entity.properties.height;
        //             // entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
        //             // entity.polygon.extrudedHeight = 0.0;
        //             // entity.polygon.extrudedHeightReference = Cesium.HeightReference.CLAMP_TO_GROUND;

        //             // Extrude the polygon based on the Hoehe and clamp on Ground
        //             // height - damit die gebäude im gelände nicht schweben
        //             entity.polygon.height = -1;

        //             entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
        //             entity.polygon.extrudedHeight = entity.properties.height;
        //             entity.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;

        //             entity.polygon.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(100.0, 4000.0);
        //         }
        //     }
        // }

        // clearInterval(interval_buildings);
        // // alle intervalle instanzen auf null setzen
        // interval_buildings = null;
        // while (interval_buildings !== null) {
        //     interval_buildings = null;
        // }
        // html_element.style = "";


    });

    // document.getElementById("abbrechen_button_osm_buildings_terrain").addEventListener("click", () => {

    //     console.log("second eventlistener");

    //     // Gebäude Layer ausschalten im menu
    //     let layerOSMBuildingsimg = document.getElementById("layer_img_3");
    //     layerOSMBuildingsimg.classList.remove("active");
    //     layerOSMBuildingsimg.parentElement.children[1].classList.remove("active");

    // });

    // document.getElementById("ok_button_osm_buildings_terrain").addEventListener("click", () => {

    //     // Remove VR World terrain
    //     viewer.terrainProvider = EllipsoidTerrainProvider;
    //     // Farblich nicht aktiv setzten des layers VR world terrain im menu
    //     let layerVRWorldTerrainimg = document.getElementById("layer_img_5");
    //     layerVRWorldTerrainimg.classList.remove("active");
    //     layerVRWorldTerrainimg.parentElement.children[1].classList.remove("active");

    //     // Farblich aktiv setzten des layers Ellipsiod terrain im menu
    //     let layerEllipsoidTerrainimg = document.getElementById("layer_img_4");
    //     layerEllipsoidTerrainimg.classList.add("active");
    //     layerEllipsoidTerrainimg.parentElement.children[1].classList.add("active");

    //     // Activate Buildings
    //     for (let i = 0; i < viewer.dataSources.length; i++) {

    //         var datasource = viewer.dataSources.get(i);
    //         if (viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show == false) {

    //             datasource.show = true;
    //         }
    //     }

    //     // Explicitly render a new frame
    //     viewer.scene.requestRender();

    //     // Add the event listener
    //     viewer.camera.changed.addEventListener(cameraChangedListener);

    // });
}


// GeoJSON Buildings OSM

// var height, promise_geojson, tilexy, vergleich;
// var cartesian_array = [];

// var webmercatortiling = new Cesium.WebMercatorTilingScheme();

// Die Funktion fetchURL wird jede Sekunde aufgerufen
// setInterval(fetchURL, 1000);
// setInterval(check_height, 1000);

let cartesian_array = [];
let globalArray = [];

// Funktion zum fetchen der URL der OSM Gebäudedaten
// Führt außerdem das rendern der empfangenen Daten durch
function fetchURL() {

    let promise_geojson, tilexy, vergleich, addedpromise;

    let webmercatortiling = new Cesium.WebMercatorTilingScheme();

    // for (let element_byclass of document.getElementsByClassName("cesium-baseLayerPicker-itemLabel")) {
    //     if (element_byclass.innerHTML == "OSM Gebäude 3D") {
    //         html_element = element_byclass;
    //         element_byclass.style = "color: rgb(0, 255, 106);"
    //         active_osm = true;
    //     }
    // }

    // Höhe abfragen
    let height = viewer.camera.positionCartographic.height * (0.001).toFixed(1);
    // Kachelschema erzeugen für Level 15 aus der Position der Kamera
    let cartesian = new Cesium.Cartesian2();
    tilexy = webmercatortiling.positionToTileXY(
        viewer.camera.positionCartographic,
        15,
        cartesian
    );

    // console.log("Kachelposition: : " + tilexy);

    // Erst ab einer Entfernung von kleiner als 4 km soll das Fetchen der OSM Gebäudedaten erfolgen
    // Reduziert die Abfragen
    if ((viewer.camera.positionCartographic.height * 0.001).toFixed(1) < 4) {
        // Jede Sekunde wird eine Resource erstellt
        var resource_json = new Cesium.Resource({
            url: "https://data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json",
            templateValues: {
                x: tilexy.x,
                y: tilexy.y,
                z: 15,
            },
        });

        // Initiales Fetchen der Daten
        if (cartesian_array.length == 0) {
            cartesian_array.push(tilexy);

            promise_geojson = Cesium.GeoJsonDataSource.load(resource_json, {
                // TODO, funktioniert bisher nicht!!!
                // clampToGround: true,
                strokeWidth: 0,
                fill: Cesium.Color.BURLYWOOD,
                stroke: Cesium.Color.BURLYWOOD,
            });
            console.log("Initiale Kacheln angefragt");

            // Anfrageoptimierung, da bisherige angefragte Kacheln nicht erneut angefragt werden
        } else {
            for (const element of cartesian_array) {
                // console.log("Arrayelemente: " + cartesian_array);
                // console.log("Tileelement: " + tilexy);
                // console.log("element.equals(tilexy): " + element.equals(tilexy));
                //
                if (element.equals(tilexy)) {
                    vergleich = true;
                    break;
                    // console.log("Das Tilearray enthält bereits die neuen Kacheln");
                } else {
                    vergleich = false;
                    // console.log("Das Tilearray enthält noch nicht die neuen Kacheln, die neuen werden hinzugefügt");
                }
            }

            if (vergleich == false) {
                console.log("Neue Kacheln werden gefetcht");
                cartesian_array.push(tilexy);
                promise_geojson = Cesium.GeoJsonDataSource.load(resource_json, {
                    // TODO, funktioniert bisher nicht!!!
                    // clampToGround: true,
                    strokeWidth: 0,
                    fill: Cesium.Color.BURLYWOOD,
                    stroke: Cesium.Color.BURLYWOOD,
                });
            } else {
                console.log("Die Kacheln wurden bereits gefetcht und müssen nicht erneut angefragt werden");
            }
        }

    } else {

        // when the viewer is more than 4 km away, the buildings got removed for better performance
        for (let datasource of globalArray) {
            viewer.dataSources.remove(datasource);
        }
        // console.log(viewer.dataSources.remove(datasource));
        globalArray = [];
        cartesian_array = [];

    }

    // Rendern der Empfagenen Daten
    // Renderoptimierung, es werden nur neue Kacheln gerendert, keine wiederholt angefragten Kacheln
    if (promise_geojson != null) {
        promise_geojson
            .then(function(dataSource) {

                // console.log(viewer.dataSources._dataSources);
                if (viewer.dataSources.length == 0) {
                    dataSource.name = "Buildings" + (tilexy.x + "_" + tilexy.y).toString();
                    // console.log("Array ist empty, erste datasource hinzugefügt");
                    addedpromise = viewer.dataSources.add(dataSource);
                    globalArray.push(dataSource);
                    // console.log(viewer.dataSources._dataSources);
                } else {
                    dataSource.name = "Buildings" + (tilexy.x + "_" + tilexy.y).toString();

                    // Die neue Datasource wird in der datasource collection gefunden, das resultierende Array ist > 0
                    if (viewer.dataSources.getByName(dataSource.name).length === 0) {
                        addedpromise = viewer.dataSources.add(dataSource);
                        globalArray.push(dataSource);
                        // console.log("Datasourcesarray enthält noch nicht die neue Anfragekachel, neue Kachel wird hinzugefügt");
                        // dataSource.name = "Buildings" + (tilexy.x + "_" + tilexy.y).toString();
                    }
                }

                // let layerEllipsoidTerrainimg = document.getElementById("layer_img_4");
                let layerVRWorldTerrainimg = document.getElementById("layer_img_5");

                //Get the array of entities
                let entities = dataSource.entities.values;

                if (layerVRWorldTerrainimg.classList.contains('active')) {

                    for (let i = 0; i < entities.length; i++) {
                        const entity = entities[i];

                        // cesiumJS algorithmus
                        // entity.polygon.height = entity.properties.height;
                        // entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                        // entity.polygon.extrudedHeight = 0.0;
                        // entity.polygon.extrudedHeightReference = Cesium.HeightReference.CLAMP_TO_GROUND;

                        //  Extrude the polygon based on the Hoehe and clamp on Ground
                        //  height - damit die gebäude im gelände nicht schweben
                        entity.polygon.height = -1;

                        entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                        entity.polygon.extrudedHeight = entity.properties.height;
                        entity.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;

                        // entity.polygon.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(50.0, 3500.0);
                    }

                } else {

                    for (let i = 0; i < entities.length; i++) {
                        const entity = entities[i];
                        // only set height property
                        entity.polygon.extrudedHeight = entity.properties.height;

                    }
                }

            });
    }

    // Explicitly render a new frame
    viewer.scene.requestRender();

    // for (let i = 0; i < viewer.dataSources.length; i++) {
    //     console.log(viewer.dataSources.get(i));
    //     // do something with the new data source
    // }

    // viewer.dataSources.dataSourceAdded.addEventListener(function() {
    //     for (let i = 0; i < viewer.dataSources.length; i++) {
    //         console.log(viewer.dataSources.get(i));
    //         // do something with the new data source
    //     }
    // });

    // nach einmaligem klicken auf den Button wird das onlickevent ausgelöst.
    // html_element.parentElement.onclick = () => {

    // // Fall Buildings ausschalten
    // if (active_osm) {
    //     console.log("active");

    //     for (i = 0; i < viewer.dataSources.length; i++) {

    //         var datasource = viewer.dataSources.get(i);
    //         if (viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show == true) {

    //             datasource.show = false;
    //         }
    //     }
    //     // Explicitly render a new frame
    //     viewer.scene.requestRender();

    //     clearInterval(interval_buildings);
    //     // alle intervalle instanzen auf null setzen
    //     interval_buildings = null;
    //     while (interval_buildings !== null) {
    //         interval_buildings = null;
    //     }
    //     // html_element.style = "";
    //     // active_osm = false;

    //     // Fall Buildings wieder einschalten
    // } else if (active_osm == false) {

    //     for (i = 0; i < viewer.dataSources.length; i++) {

    //         var datasource = viewer.dataSources.get(i);
    //         if (viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show == false) {

    //             datasource.show = true;
    //         }
    //     }

    //     // Explicitly render a new frame
    //     viewer.scene.requestRender();

    //     if (!interval_buildings)
    //         interval_buildings = setInterval(fetchURL, 1000);
    //     // active_osm = true;
    // }

    // else {

    //     for (i = 0; i < viewer.dataSources.length; i++) {

    //         var datasource = viewer.dataSources.get(i);
    //         if (viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show == true) {

    //             datasource.show = false;
    //             // viewer.dataSources.remove(datasource, true);
    //             clearInterval(myinterval);
    //             // alle intervalle instanzen auf null setzen
    //             myinterval = null;
    //             while (myinterval !== null) {
    //                 myinterval = null;
    //             }
    //             html_element.style = "";
    //         } else if (viewer.dataSources.get(i).name.startsWith("Buildings") && viewer.dataSources.get(i).show == false) {

    //             // console.log(datasource);
    //             datasource.show = true;
    //             html_element.style = "color: rgb(0, 255, 106);"
    //                 // erst prüfen, ob das intervall null ist, dann intervall neu setzen    
    //             if (!myinterval)
    //                 myinterval = setInterval(fetchURL, 1000);

    //         }
    //     }
    // }

}

function geolocate() {

    let geolocation_button = document.getElementById("geolocate_button_toolbar");

    geolocation_button.addEventListener('click', getLocation);

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            // Modal Abfrage Geoloation not supported

            let modal = new bootstrap.Modal(document.getElementById("modal"));
            let div_body = document.getElementById("modalBody");

            // div_body.innerText = "Die Abfrage der Geolocation ist in diesem Browser nicht unterstützt.";

            translate(undefined, div_body, undefined, undefined);

            modal.show();
        }
    }

    function showPosition(position) {

        geolocation_button.style = "background-color: rgb(0, 255, 106);"

        console.log("Latitude: " + position.coords.latitude +
            "Longitude: " + position.coords.longitude);

        let accuracy = position.coords.accuracy;

        console.log("Accuracy: " + accuracy + " meters");

        // 600 meter abstand zu dem Punkt
        var cartesian = Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude, 600);

        add_marker(cartesian);

        viewer.camera.flyTo({
            destination: cartesian,
            complete: change_backgroundcolor_normal
        });

    }

    function change_backgroundcolor_normal() {
        geolocation_button.style = "";
    }

    function add_marker(cartesian_three) {

        // Prüfen, ob bereits entitites bestehen und falls ja löschen!
        var array_entities = [];
        // löschen der Werte aus dem Array!

        for (let teil of viewer.entities.values) {
            if (teil.id.includes("geolocate_point_")) {
                array_entities.push(teil);
                console.log("the geolocate point which was set before is deleted");
            }
        }

        // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
        for (let entity of array_entities) {
            viewer.entities.remove(entity);
        }

        // Bild ist von https://fonts.google.com/icons?icon.query=location
        viewer.entities.add({
            name: "My Location",
            position: cartesian_three,
            description: "An marker with my current location.",
            billboard: {
                image: "./Icons/user-location.svg",
                scale: 0.5,
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 3000.0),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                pixelOffset: new Cesium.Cartesian2(0, -15),
                scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 4000, 0.1)
            },
            id: 'geolocate_point_'
        });

        // TODO put in queryfeatures
        var entity = viewer.entities.getById("geolocate_point_");

        var table = document.createElement("table");
        //zum schöner machen die Class 
        table.className = "cesium-infoBox-defaultTable";

        var arr_tr = [];
        var arr_th = [];
        var arr_td = [];

        var cartographic = Cesium.Cartographic.fromCartesian(cartesian_three);
        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
        var latitude = Cesium.Math.toDegrees(cartographic.latitude);

        for (let i = 0; i < 2; i++) {
            var tr = document.createElement('tr'); //Zeile
            var th = document.createElement('th'); //Überschriftenzelle center und fett dargestellt
            var td = document.createElement('td'); //Datenzelle linksbündig und regular

            arr_tr[i] = tr;
            arr_th[i] = th;
            arr_td[i] = td;

            arr_tr[i].appendChild(arr_th[i]);
            arr_tr[i].appendChild(arr_td[i]);
            table.appendChild(arr_tr[i]);
        }

        arr_th[0].innerHTML = "Latitude";
        arr_td[0].innerHTML = latitude;

        arr_th[1].innerHTML = "Longitude";
        arr_td[1].innerHTML = longitude;

        entity.description = table.outerHTML;
    }
}

function geocodieren() {

    // Init a timeout variable to be used below
    let timeout = null;

    let geocoder_search_url = "https://nominatim.openstreetmap.org/search?q={query}&format=geojson&addressdetails=1";

    // geocode_SearchUrl = "https://www.gis-rest.nrw.de/location_finder/lookup?" +
    //     "limit=10&filter=type:ort,stra%C3%9Fe,adress.lan:Nordrhein-Westfalen&query={query}";

    document.getElementById('input_geocode').addEventListener('keyup', e => {
        requestAPI(e.target.value);
    });

    function requestAPI(query) {

        clearTimeout(timeout);

        // Make a new timeout set to go off in 800ms
        timeout = setTimeout(async function() {
            var geocoder_search_url_replaced = geocoder_search_url.replace("{query}", query);

            console.log(geocoder_search_url_replaced);

            let response = await fetch(geocoder_search_url_replaced);

            if (response.ok) { // if HTTP-status is 200-299
                // get the response body (the method explained below)
                let json = await response.json();

                // console.log(json.features.length);
                createResultList(json.features);

            } else {
                alert("HTTP-Error: " + response.status);
            }

        }, 800);

    }

    function createResultList(data) {
        var div = document.createElement("div");
        div.setAttribute("class", "list-group");
        div.setAttribute("id", "liste");
        let html = "";

        if (data.length === 0) {

            html += '<a href="#" class="list-group-item list-group-item-action">Kein Ergebnis gefunden</a>';
        } else {
            for (let i = 0; i < data.length; i++) {

                console.log(data[i]);

                html += '<a style="font-size: smaller;" href="#" id="' + "list_item_" + i + '"class="list-group-item list-group-item-action itnrwSearchResultItem" data-name="' + data[i].properties.display_name + '"data-longitude="' + data[i].geometry.coordinates[0] + '"data-latitude="' + data[i].geometry.coordinates[1] + '">' + data[i].properties.display_name + '</a>';
            }
        }
        div.innerHTML = html;

        if (document.getElementById("geocode").lastChild.className != "list-group") {
            document.getElementById("geocode").appendChild(div);
        } else {
            document.getElementById("geocode").replaceChild(div, document.getElementsByClassName("list-group")[0]);
        }

    }
}

function clear_geocodes() {
    let list = document.getElementsByClassName("list-group");

    document.getElementById("abbrechen_button").addEventListener('click', () => {

        for (let element of list) {
            element.remove();
        }
        // löschen des Wertes aus der Suchleiste
        document.getElementById("input_geocode").value = '';

        // Prüfen, ob bereits entitites bestehen und falls ja löschen!
        let array_entities = [];
        // löschen der Werte aus dem Array!
        for (let teil of viewer.entities.values) {
            if (teil.id.includes("searchadress_point_")) {
                array_entities.push(teil);
                console.log("adresspoint");
            }
        }

        // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
        for (let entity of array_entities) {
            viewer.entities.remove(entity);
        }

        // Explicitly render a new frame
        viewer.scene.requestRender();

    });

}

function choose_geocode() {

    var point_id = 0;

    var liste = document.getElementById("liste");
    if (document.body.contains(document.getElementById("liste"))) {
        liste.onclick = e => {
            const elementClicked = e.target;

            // Bei der Auswahl wird die Liste gelöscht
            var list = document.getElementsByClassName("list-group");
            for (let element of list) {
                element.remove();
            }

            // Prüfen, ob bereits entitites bestehen und falls ja löschen!
            let array_entities = [];
            // löschen der Werte aus dem Array!
            for (let teil of viewer.entities.values) {
                if (teil.id.includes("searchadress_point_")) {
                    array_entities.push(teil);
                    console.log("adresspoint");
                }
            }

            // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
            for (let entity of array_entities) {
                viewer.entities.remove(entity);
            }

            console.log(elementClicked.getAttribute('data-name'));

            if (elementClicked.getAttribute('data-name')) {

                var name_adress = elementClicked.getAttribute('data-name');

                // setzen des namens in die Suchleiste bei Auswahl
                document.getElementById("input_geocode").value = name_adress;

                var cartographic_position = Cesium.Cartographic.fromDegrees(parseFloat(elementClicked.getAttribute('data-longitude')),
                    parseFloat(elementClicked.getAttribute('data-latitude')), 1000);

                var cartesian_position = Cesium.Cartographic.toCartesian(cartographic_position);

                // Bild ist von https://fonts.google.com/icons?icon.query=location
                viewer.entities.add({
                    name: name_adress,
                    position: cartesian_position,
                    billboard: {
                        image: "./Icons/search-address-pin.svg",
                        scale: 0.5,
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 4000.0),
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        pixelOffset: new Cesium.Cartesian2(0, -15),
                        scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 4000, 0.1)
                    },
                    id: 'searchadress_point_' + point_id++
                });

                viewer.camera.flyTo({
                    destination: cartesian_position
                })
            }
        }
    }

}

function add_external_geodata() {

    // Das unschöne input element wird versteckt und durch einen schöneren Button aufgerufen
    // const fileSelect = document.getElementById("locale_data_button"),
    //     fileElem = document.getElementById("locale_data_input");

    // fileSelect.addEventListener("click", function() {
    //     if (fileElem) {
    //         fileElem.click();

    //         //Add basic drag and drop functionality
    //         if (viewer.dropEnabled != true) {
    //             viewer.extend(Cesium.viewerDragDropMixin, { clearOnDrop: false });

    //             // GeoJSON validation drag and drop
    //             document.getElementById("cesiumContainer").addEventListener('drop', e => {
    //                 // Returns a FileList of the files being dragged, if any.
    //                 var filelist = e.dataTransfer.files;

    //                 // loadAnimationGeoJSON();

    //                 for (let i = 0, numFiles = filelist.length; i < numFiles; i++) {
    //                     const file = filelist[i];

    //                     // Check if the file is an geojson, otherwise get Info
    //                     if (file.type && !file.type.startsWith('application/geo')) {
    //                         console.log('File is not an GeoJSON.', file.type, file);

    //                         var my_modal = new bootstrap.Modal(document.getElementById("modal_wrong_format"));
    //                         my_modal.show();

    //                     } else {

    //                         // Die Datei wird über einen Reader eingelesen und geprüft
    //                         const reader = new FileReader();

    //                         reader.addEventListener('load', (event) => {

    //                             let errors = geojsonhint.hint(event.target.result);

    //                             // stopLoadAnimation();

    //                             if (errors.length == 0) {

    //                                 var my_modal = new bootstrap.Modal(document.getElementById("modal_load_data"));
    //                                 my_modal.show();

    //                             } else {

    //                                 var my_modal = new bootstrap.Modal(document.getElementById("modal_wrong_geojson"));
    //                                 var body = document.getElementById("modal_body_wronggeojson");
    //                                 var innertext = JSON.stringify(errors);
    //                                 innertext = innertext.replace("[{", "");
    //                                 innertext = innertext.replace("}]", "");
    //                                 innertext = innertext.replace(/},{/gm, "");

    //                                 body.innerText = " Das GeoJSON, welches Sie hinzufügen wollen, besitzt Fehler: " + innertext;
    //                                 my_modal.show();

    //                             }

    //                         });

    //                         reader.readAsBinaryString(file);
    //                     }
    //                 }

    //             });
    //         }
    //     }
    // }, false);

    // Observer einmal aufrufen reicht, da ansonsten zweimal aufgerufen
    // MutationObserverDOM();

    let ID = 0;
    let nameGeoJSon;

    const fileSelect = document.getElementById("locale_data_button");

    let fileModal = new bootstrap.Modal(document.getElementById("fileModal"));

    let alert = document.getElementById("alert1");

    fileSelect.addEventListener("click", function(event) {

        // Initial Alertmeldung nicht sichtbar stellen
        alert.style.display = "none";

        // document.getElementsByClassName("custom-file-label")[0].innerText = "Keine Datei...";
        let label = document.getElementsByClassName("custom-file-label")[0];

        translate(undefined, undefined, undefined, undefined, undefined, undefined, label);

        // Set title of input element to nothing and the selected files
        document.getElementById("fileInput").title = "";
        document.getElementById("fileInput").value = "";

        fileModal.show();
    });

    let fileInput = document.getElementById("fileInput");
    // var selectedFile = fileInput.files[0];

    // Get the file input field and label element
    const label = fileInput.nextElementSibling;

    // Set the label text to the selected file name
    fileInput.addEventListener('change', () => {
        const fileName = Array.from(fileInput.files).map(file => file.name).join(', ');
        label.innerText = fileName;
    });

    document.getElementById("addGeoJsonMenu").addEventListener("click", function() {
        let fileInput = document.getElementById("fileInput");

        // console.log(fileInput.files);
        if (fileInput.files.length === 0) {
            alert.style.display = "";
            // alert.innertext = "Wählen Sie erst eine Datei aus";
            translate(undefined, undefined, undefined, alert, undefined, undefined);

        } else {

            for (let element of handleFiles(fileInput)) {
                globalList.push(element);
            }

            // Close the modal
            fileModal.hide();
        }
    });


    // if (fileElem) {
    //     // Listener, um auf change event zu reagieren und die Daten lesen zu können
    //     fileElem.addEventListener("change", function() {
    //         globalList = handleFiles();
    //     }, false);
    // }

    // Daten der Datei einlesen
    function handleFiles(fileElem) {

        const fileList = fileElem.files; /* now you can work with the file list */

        // loadAnimationGeoJSON();

        for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
            const file = fileList[i];
            console.log(file.name);

            let array = file.name.split(".");

            nameGeoJSon = array[0];

            // Check if the file is an geojson, otherwise get Info
            if (file.type && !file.type.startsWith('application/geo')) {
                console.log('File is not an GeoJSON.', file.type, file);

                let modal = new bootstrap.Modal(document.getElementById("modal"));
                let modalHeader = document.getElementById("ModalLabel");
                // modalHeader.innerText = "Achtung";

                let modalBody = document.getElementById("modalBody");
                // modalBody.innerText = " Die Daten, welche Sie hinzufügen möchten, sind keine GeoJSON Dateien. Bitte laden Sie nur GeoJSON.";

                translate(modalHeader, modalBody, undefined, undefined);

                modal.show();

            } else {

                // GeoJSON validation
                // Die Datei wird über einen Reader eingelesen und der Szene hinzugefügt
                const reader = new FileReader();
                reader.addEventListener('load', (event) => {

                    let errors = geojsonhint.hint(event.target.result);

                    // console.log(errors);

                    if (errors.length === 0) {

                        addLayerGeoJson(nameGeoJSon, ID, file);

                    } else {

                        let my_modal = new bootstrap.Modal(document.getElementById("modal"));
                        let modalBody = document.getElementById("modalBody");
                        let modalHeader = document.getElementById("ModalLabel");
                        let innertext = JSON.stringify(errors);
                        innertext = innertext.replace("[{", "");
                        innertext = innertext.replace("}]", "");
                        innertext = innertext.replace(/},{/gm, "");

                        // modalBody.innerText = " Das GeoJSON, welches Sie hinzufügen wollen, besitzt Fehler: " + innertext;

                        translate(modalHeader, modalBody, innertext);

                        my_modal.show();
                        // stopLoadAnimationGeoJSON();
                    }

                });

                reader.readAsBinaryString(file);
            }
        }

        return fileList;

        // // Check if the file is an geojson, otherwise get Info
        // if (file.type && !file.type.startsWith('application/geo')) {
        //     console.log('File is not an GeoJSON.', file.type, file);

        //     let my_modal = new bootstrap.Modal(document.getElementById("modal_wrong_format"));
        //     my_modal.show();

        // } else {

        //     // GeoJSON validation
        //     // Die Datei wird über einen Reader eingelesen und der Szene hinzugefügt
        //     const reader = new FileReader();
        //     reader.addEventListener('load', (event) => {

        //         let nameGeoJSon;

        //         let errors = geojsonhint.hint(event.target.result);

        //         // console.log(errors);

        //         if (errors.length == 0) {

        //             let promise = Cesium.GeoJsonDataSource.load(JSON.parse(event.target.result), {
        //                 clampToGround: true,
        //                 name: "external GeoJSON data" + ID++
        //             });

        //             promise
        //                 .then(function(dataSource) {
        //                     // viewer.dataSources.add(dataSource);

        //                     nameGeoJSon = dataSource.name;

        //                     // var my_modal = new bootstrap.Modal(document.getElementById("modal_load_data"));
        //                     // my_modal.show();

        //                 });

        //             // let promiseBoolean = viewer.flyTo(promise);

        //             // ist der promise onFulfilled wird die anonyme innere funktion aufgerufen und der wert message des promise in der Funktion verwendet
        //             // promiseBoolean.then(function(Message) {
        //             //     // when true stop animation
        //             //     if (Message) {
        //             //         stopLoadAnimationGeoJSON();
        //             //     }

        //             // });


        //         } else {

        //             var my_modal = new bootstrap.Modal(document.getElementById("modal_wrong_geojson"));
        //             var body = document.getElementById("modal_body_wronggeojson");
        //             var innertext = JSON.stringify(errors);
        //             innertext = innertext.replace("[{", "");
        //             innertext = innertext.replace("}]", "");
        //             innertext = innertext.replace(/},{/gm, "");

        //             body.innerText = " Das GeoJSON, welches Sie hinzufügen wollen, besitzt Fehler: " + innertext;
        //             my_modal.show();
        //             stopLoadAnimation();
        //         }

        //     });

        //     reader.readAsBinaryString(file);
        // }
        // }
    }
}


function addLayerGeoJson(nameGeoJSon, ID, file) {

    let section_4 = document.getElementById("section_4");
    section_4.style.display = "block";

    let section4Text = document.getElementById("section_4_text");
    section4Text.style.display = "inline-block";

    // Create the new <a> tag element
    const newLink = document.createElement("a");

    // Set the attributes for the new <a> tag
    newLink.className = "dropdown-item layermenu";
    newLink.title = file.name;
    newLink.setAttribute("data-fileLayerGeoJson", file.name);
    console.log(typeof file);
    // newLink.setAttribute("data-fileGeojson", file);
    newLink.setAttribute("data-LayersGeoJson", nameGeoJSon);
    // newLink.setAttribute("data-layerTitle", layer_title);

    // Create the <img> and <span> tags to go inside the <a> tag
    const newImg = document.createElement("img");
    newImg.className = "img_layers";
    newImg.src = "../Icons/WMS.png";

    const newSpan = document.createElement("span");
    newSpan.className = "title";
    newSpan.textContent = nameGeoJSon;

    // Loop through the number of sections and create the section names
    // Create numbers from 6 up to 20 for external ID of WMS and set iterated ID to img ID

    //get number ID from last layer element
    let layerItemsElements = document.querySelectorAll("[id^='layer_item']");

    let layerItemsElement = layerItemsElements[layerItemsElements.length - 1];

    let oldcount = layerItemsElement.id[layerItemsElement.id.length - 1];

    ID = oldcount;

    ++ID;

    let layerImgName = "layer_img_" + ID;
    let layerItemName = "layer_item_" + ID;

    newLink.id = layerItemName;
    newImg.id = layerImgName;

    // Add the <img> and <span> tags to the <a> tag
    newLink.appendChild(newImg);
    newLink.appendChild(newSpan);

    // newDIVSection.appendChild(newLink);

    // Add the new <a> tag to the <div> element with ID "section_4"
    section_4.appendChild(newLink);

    let modalAddLayermenu = new bootstrap.Modal(document.getElementById("modal"));

    let modalHeader = document.getElementById("ModalLabel");
    modalHeader.innerText = "Information";

    let modalBody = document.getElementById("modalBody");
    // modalBody.innerText = "Ihre GeoJSON daten sind dem Menü als Layer hinzugefügt worden.";

    translate(modalHeader, modalBody, null, undefined, null);

    modalAddLayermenu.show();

    markActiveSelectedLayers();
    StopCloseMenu();
}

function popover() {

    $('#wms-text').popover({
        trigger: 'hover'
    });

    $('#exampleDataList').popover({
        trigger: 'hover'
    });
}

function handleExternalServices(node, value_name_wms, value_url_wms) {

    let imageryLayer;

    console.log(value_url_wms);
    console.log(value_name_wms);

    // Create WMSImageryProvider
    let wms_provider = new Cesium.WebMapServiceImageryProvider({
        url: value_url_wms,
        layers: value_name_wms,
        parameters: {
            format: 'image/png',
            transparent: true
        }
    });

    if (node) {
        node.children[0].addEventListener("click", function(event) {

            // Even though the wms_provider variable is overwritten each time handleExternalServices() is called for a different node, the event listener 
            // function that was created for a particular node still has access to the wms_provider variable that was created when handleExternalServices() was called for that node, 
            // because of how JavaScript's function scoping works.
            // Jede node hat durch die innere funktion die Varialbe wms_provider im scope, auf das sie zugreifen kann
            // When the event listener function is created, it "closes over" the wms_provider variable in the scope where it was defined
            // When a function is created, it forms a closure, which contains the function itself and any variables that were in scope at the time of creation. These variables are still accessible to the function even if they are no longer in scope outside of the closure.

            // When the node has the active class, the referencing wms_prover for the node gets added
            if (event.target.classList.contains('active')) {

                imageryLayer = viewer.imageryLayers.addImageryProvider(wms_provider);

                // viewer.imageryLayers.add(esriLayer);
                console.log("initial added ESRI imagery");
            } else {
                // when the node dont has activ class the wms gets removed
                viewer.imageryLayers.remove(imageryLayer);
                console.log("ESRI contains already. The ESRI layer gets deleted.");
            }
        });
    }
}

function handleExternalGeodata(node) {

    // console.log(node.dataset.filegeojson);

    // console.log(typeof node.dataset.filegeojson);

    let geoJSONdataSource;

    // const fileSelect = document.getElementById("locale_data_button"),
    //     fileElem = document.getElementById("locale_data_input");

    // fileSelect.addEventListener("click", function() {
    //     if (fileElem) {
    //         fileElem.click();
    //     }
    // });

    if (node) {
        // Listener, um auf change event zu reagieren und die Daten lesen zu können
        // fileElem.addEventListener("change", handleFiles, false);
        node.children[0].addEventListener("click", function(event) {
            if (event.target.classList.contains('active')) {

                addGeoJSONLayerMap(node.dataset.filelayergeojson);

            } else {

                viewer.dataSources.remove(geoJSONdataSource);

                // Explicitly render a new frame
                viewer.scene.requestRender();

            }

        });

    }

    let ID = 0;

    // Daten der Datei einlesen
    function addGeoJSONLayerMap(layerGeoJSONName) {

        // start loading animation eacht time
        loadAnimationGeoJSON();

        for (let i = 0, numFiles = globalList.length; i < numFiles; i++) {
            const file = globalList[i];

            // GeoJSON validation
            // Die Datei wird über einen Reader eingelesen und der Szene hinzugefügt
            const reader = new FileReader();
            reader.addEventListener('load', (event) => {

                let promise = Cesium.GeoJsonDataSource.load(JSON.parse(event.target.result), {
                    clampToGround: true
                });

                promise
                    .then(function(dataSource) {

                        dataSource.name = layerGeoJSONName;

                        geoJSONdataSource = dataSource;

                        viewer.dataSources.add(dataSource);

                        // // Explicitly render a new frame
                        // viewer.scene.requestRender();

                        let my_modal = new bootstrap.Modal(document.getElementById("modal_load_data"));
                        my_modal.show();

                        // // add a listener function to the loadingEvent
                        // dataSource.loadingEvent.addEventListener(function(isLoading) {
                        //     console.log('loadingEvent fired');
                        //     console.log('Data source loading state changed:', isLoading);
                        //     stopLoadAnimationGeoJSON();
                        // });

                    });

                let promiseBoolean = viewer.flyTo(promise);

                // ist der promise onFulfilled wird die anonyme innere funktion aufgerufen und der wert message des promise in der Funktion verwendet
                promiseBoolean.then(function(Message) {
                    // when true stop animation
                    console.log(Message);
                    if (Message) {
                        stopLoadAnimationGeoJSON();
                    }

                });

            });

            // When the layerGeoJSONName of the clicked img tag is the same as in the fileliste then read data of file 
            if (file.name === layerGeoJSONName) {
                reader.readAsBinaryString(file);
            }
        }
    }
}

function MutationObserverDOM() {

    // Select the element you want to watch for changes
    const targetNode = document.getElementById('section_4');

    // Create a new observer object
    const observer = new MutationObserver(function(mutationsList) {
        for (let mutation of mutationsList) {
            // check for type of childlist mutation
            // only when nodes are added functions should be executed mutation.addedNodes.length > 0!
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // A new child element has been added to the targetNode
                console.log('New element created!');
                // console.log(mutation.target.lastChild);
                // Create the layerdelete button
                createLayerdeleteExternalData();
                // if dataset attribute layerwms then add layer WMS
                if (mutation.target.lastChild.dataset.layerswms) {

                    let layerWMS = mutation.target.lastChild.dataset.layerswms
                    let URLWMS = mutation.target.lastChild.dataset.urlwms
                    handleExternalServices(mutation.target.lastChild, layerWMS, URLWMS);

                } else {

                    handleExternalGeodata(mutation.target.lastChild);

                }

            }
        }
    });

    // Start observing the targetNode for new changes
    observer.observe(targetNode, { childList: true });

}

function add_external_service() {

    let htmlcollection_layer;
    let ID, value_url_wms;

    let alerts = document.getElementsByClassName("alert");

    let noWMSURL = document.getElementById("noWMSURL");
    let noWMSURLreco = document.getElementById("noURLRecognised");
    let errorRequest = document.getElementById("errorRequest");
    let noRequestSend = document.getElementById("noRequestSend");
    let noWMSSelected = document.getElementById("noWMSelected");
    let noWMSQueryed = document.getElementById("noWMSQueryed");
    let success = document.getElementById("success");

    let wmsURL = document.getElementById("wms-text");
    // delete url initial one time on onload of website
    wmsURL.value = "";

    document.getElementById("external_service").addEventListener('click', () => {
        var my_modal = new bootstrap.Modal(document.getElementById("modal_load_service"));
        my_modal.show();
        let option_list_wms = document.getElementById("datalistOptions");

        console.log(wmsURL.value);

        // check if wms list has children
        if (option_list_wms.children.length !== 0) {
            // Show wms list, when it has children
            document.getElementById("wms_list").style.display = "";
        } else {
            // dont show wms list, when it has no children
            document.getElementById("wms_list").style.display = "none";
            if (wmsURL.value && !wmsURL.value.startsWith('https://'))
            // delete wms URL if not start with http
                wmsURL.value = "";
        }

        // wenn das Feld ausgewählt, Feld leeren
        document.getElementById("exampleDataList").value = "";
        popover();

        // Initial Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
        for (let alert of alerts) {
            alert.style.display = "none";
        }

    });

    // document.getElementById("wms-text").addEventListener('input', () => {

    //     let option_list_wms = document.getElementById("datalistOptions");
    //     // // Gesamte Liste leeren 
    //     // while (option_list_wms.firstChild) {
    //     //     option_list_wms.removeChild(option_list_wms.lastChild);
    //     // }
    //     // option_list_wms.innerHTML = "";

    // });

    document.getElementById("anfrage_button_wms").addEventListener('click', () => {
        // var value_name_wms = document.getElementById("wms-name").value;
        value_url_wms = document.getElementById("wms-text").value;

        if (value_url_wms == "") {

            // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
            for (let alert of alerts) {
                alert.style.display = "none";
            }

            noWMSURL.style.display = "";
            // alert.innerHTML = "<strong>Achtung!</strong>Geben Sie erst eine URL des WMS an!";

            translate(undefined, undefined, undefined, noWMSURL, undefined);

        } else {

            // bei anfragen das layerfeld aufklappen
            document.getElementById("wms_list").style.display = "";
            // Feld leeren
            document.getElementById("exampleDataList").value = "";

            // Start the loading animation
            startLoadingAnimationWMS();

            // initiales leeren der Auswahlliste der Layer des WMS
            let datalist_options = document.getElementById("datalistOptions");
            while (datalist_options.firstChild) {
                datalist_options.removeChild(datalist_options.lastChild);
            }
            // datalist_options.innerHTML = "";

            let xhttp = new XMLHttpRequest();
            // console.log(xhttp);
            xhttp.onload = function() {
                if (this.readyState == 4 && this.status == 200) {
                    // Typical action to be performed when the document is ready:
                    // console.log(xhttp.responseText);
                    let response_text = xhttp.responseXML;

                    console.log(response_text);
                    // xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;
                    // console.log(response_text.getElementsByTagName("Layer"));

                    if (response_text) {

                        htmlcollection_layer = response_text.getElementsByTagName("Layer");

                        console.log(htmlcollection_layer);

                        for (let element_layer of htmlcollection_layer) {

                            // // Attribute vorhanden, das Attribut "queryable" ist vorhanden (Layer im WMS) und das erste Element hat den Nodenamen "Name" und den Wert 1
                            // // Der WMS unterstütz die getFeatureInfo
                            // if (element_layer.attributes[0] && element_layer.attributes[0].name === "queryable" &&
                            //     element_layer.attributes[0].nodeValue === 1 &&
                            //     element_layer.firstElementChild.nodeName === "Name") {
                            //     for (let child of element_layer.children) {
                            //         // console.log(child);
                            //         if (child.nodeName === "Title") {
                            //             let option = document.createElement("option");
                            //             option.value = child.textContent;
                            //             // console.log(child);
                            //             // Add the name of the WMS as a dataset attribute to the option the user can choose in list
                            //             option.setAttribute("data-LayersWms", child.previousElementSibling.textContent);
                            //             document.getElementById("datalistOptions").appendChild(option);
                            //         }
                            //     }
                            // } else if (element_layer.firstElementChild.nodeName === "Name") {

                            let hasName = false;
                            let hasTitle = false;
                            let hasBoundingBox = false;
                            let titleWMS, nameWMS, abstract;

                            // Der WMS unterstütz nicht die getFeatureInfo
                            for (let child of element_layer.children) {
                                // console.log(child);

                                if (child.nodeName === "Name") {
                                    hasName = true;
                                    nameWMS = child.textContent;
                                } else if (child.nodeName === "Title") {
                                    hasTitle = true;
                                    // set title of the wms
                                    titleWMS = child.textContent;
                                } else if (child.nodeName === "BoundingBox") {
                                    hasBoundingBox = true;
                                } else if (child.nodeName === "Abstract") {
                                    abstract = child.textContent;
                                }

                            }

                            if (hasName && hasTitle && hasBoundingBox) {
                                let option = document.createElement("option");
                                // console.log(child);
                                option.value = titleWMS;
                                option.setAttribute("data-LayersWms", nameWMS);
                                option.setAttribute("data-LayersWmsAbstract", abstract);
                                document.getElementById("datalistOptions").appendChild(option);
                            }
                            //}
                        }

                        // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
                        for (let alert of alerts) {
                            alert.style.display = "none";
                        }

                        success.style.display = "";
                        // success.innerHTML = "Die Abfrage der Layer des WMS war erfolgreich.";
                        translate(undefined, undefined, undefined, success, undefined);

                    } else {

                        // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
                        for (let alert of alerts) {
                            alert.style.display = "none";
                        }

                        noWMSURLreco.style.display = "";
                        // noWMSURLreco.innerHTML = "<strong>Achtung!</strong>Keine URL erkannt, bitte nochmal versuchen.";
                        translate(undefined, undefined, undefined, noWMSURLreco, undefined);

                    }

                } else {
                    console.log(this.status);
                    // alert("Fehler in dem Request, bitte nochmal versuchen");

                    // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
                    for (let alert of alerts) {
                        alert.style.display = "none";
                    }

                    errorRequest.style.display = "";
                    // errorRequest.innerHTML = "<strong>Achtung!</strong>Fehler in dem Request, bitte nochmal versuchen.";
                    translate(undefined, undefined, undefined, errorRequest, undefined);

                }

                // stop the loading animation for all cases onload
                stopLoadingAnimationWMS();
            };
            // Force the response to be parsed as XML
            xhttp.overrideMimeType('text/xml');

            // Bei Fehler, only triggers if the request couldn't be made at all
            xhttp.onerror = function() {

                // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
                for (let alert of alerts) {
                    alert.style.display = "none";
                }

                noRequestSend.style.display = "";
                // noRequestSend.innerHTML = "<strong>Achtung!</strong> Request konnte nicht abgesetzt werden, bitte nochmal versuchen.";

                translate(undefined, undefined, undefined, noRequestSend, undefined);
                // stop the loading animation for onerror
                stopLoadingAnimationWMS();
            };

            // anhängen der requestparameter des WMS GetCapabilities requestes
            xhttp.open("GET", value_url_wms + "?REQUEST=GetCapabilities&SERVICE=WMS");
            xhttp.send();
        }

    });

    document.getElementById("ok_button_wms").addEventListener('click', () => {
        let layer_title = document.getElementById("exampleDataList").value;
        console.log(layer_title);

        let value_name_wms, abstractWMS;
        let okbtn = document.getElementById("ok_button_wms");

        // when no layer in the collection and try add layer to menu
        if (!htmlcollection_layer) {

            // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
            for (let alert of alerts) {
                alert.style.display = "none";
            }

            noWMSQueryed.style.display = "";
            // noWMSQueryed.innerHTML = "<strong>Achtung!</strong>Bitte zuerst den WMS anfragen und dann auf 'Zum Menü hinzufügen' klicken.";

            translate(undefined, undefined, undefined, noWMSQueryed, undefined);

            // when layer not selected
        } else if (layer_title.length === 0) {

            // when the attribute can be found it will be set not to close the modal to show error message
            if (okbtn.getAttribute("data-dismiss")) {
                okbtn.setAttribute("data-dismiss", "");
            }

            // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
            for (let alert of alerts) {
                alert.style.display = "none";
            }

            // show alert message
            noWMSSelected.style.display = "";
            // noWMSSelected.innerHTML = "<strong>Achtung!</strong>Bitte zuerst den WMS auswählen und dann auf 'Zum Menü hinzufügen' klicken.";
            // success.style.display = "none";
            translate(undefined, undefined, undefined, noWMSSelected, undefined);

        } else {

            // get choosen title to compare with list to set value_name_wms
            let titleWMS = document.getElementById("exampleDataList").value;

            // get datalist options
            let datalistOptions = document.getElementById("datalistOptions");

            // wenn der value des ausgewählten elements gleich dem aus der liste, dann setzt die value_name var des wms um diesen später abzufragen
            for (let option of datalistOptions.children) {
                if (option.value === titleWMS) {
                    value_name_wms = option.dataset.layerswms;
                    abstractWMS = option.dataset.layerswmsabstract;
                }
            }

            // for (let element_layer of htmlcollection_layer) {
            //     // console.log(element_layer.firstElementChild.nodeName);

            //     if (element_layer.attributes[0] && element_layer.attributes[0].name == "queryable" && element_layer.firstElementChild.nodeName == "Name") {
            //         for (let child of element_layer.children) {
            //             // console.log(child);
            //             if (child.nodeName == "Title" && child.textContent == layer_title) {

            //                 value_name_wms = child.previousElementSibling.textContent;

            //                 // value_name_wms_array.push(value_name_wms);

            //             }
            //         }
            //     }
            // }

            // // when the layer was selected, close modal
            okbtn.setAttribute("data-dismiss", "modal");

            addWMSLayer(value_name_wms, value_url_wms, layer_title, ID, abstractWMS);

        }
    });

}

function addWMSLayer(value_name_wms, value_url_wms, layer_title, ID, abstract) {

    let section_4 = document.getElementById("section_4");
    section_4.style.display = "block";

    let section4Text = document.getElementById("section_4_text");
    section4Text.style.display = "inline-block";

    // Create the new <a> tag element
    const newLink = document.createElement("a");

    // Set the attributes for the new <a> tag
    newLink.className = "dropdown-item layermenu";
    newLink.title = abstract;
    newLink.setAttribute("data-urlWms", value_url_wms);
    newLink.setAttribute("data-LayersWms", value_name_wms);
    // newLink.setAttribute("data-layerTitle", layer_title);
    // Create the <img> and <span> tags to go inside the <a> tag
    const newImg = document.createElement("img");
    newImg.className = "img_layers";
    newImg.src = "../Icons/WMS.png";

    const newSpan = document.createElement("span");
    newSpan.className = "title";
    newSpan.textContent = layer_title;

    //get number ID from last layer element
    let layerItemsElements = document.querySelectorAll("[id^='layer_item']");

    let layerItemsElement = layerItemsElements[layerItemsElements.length - 1];

    let oldcount = layerItemsElement.id[layerItemsElement.id.length - 1];

    ID = oldcount;

    ++ID;

    let layerImgName = "layer_img_" + ID;
    let layerItemName = "layer_item_" + ID;

    newLink.id = layerItemName;
    newImg.id = layerImgName;

    // Add the <img> and <span> tags to the <a> tag
    newLink.appendChild(newImg);
    newLink.appendChild(newSpan);

    // newDIVSection.appendChild(newLink);
    // Add the new <a> tag to the <div> element with ID "section_4"
    section_4.appendChild(newLink);

    // const layermenu = document.getElementById("layermenue_dropdown");
    // layermenu.appendChild(newDIVText);
    // layermenu.appendChild(newDIVSection);
    markActiveSelectedLayers();
    StopCloseMenu();
}

function handleKeyPress(event) {

    if (event.keyCode === 27 || event.code === "Escape") {
        // the user pressed the Esc key
        // add your code here to handle the Esc key press
        let array_entities = [];
        // löschen der Werte aus dem Array!

        for (let teil of viewer.entities.values) {
            if (teil.id.includes("polyline_distance_")) {
                array_entities.push(teil);
                console.log("polyline");
            } else if (teil.id.includes("distance_label_")) {
                array_entities.push(teil);
                console.log("label");
            } else if (teil.id.includes("distance_marker_")) {
                array_entities.push(teil);
                console.log("marker");
            }
        }

        // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
        for (let entity of array_entities) {
            viewer.entities.remove(entity);
        }

        // Explicitly render a new frame
        viewer.scene.requestRender();
    }
}

function measureFunctions() {

    let measure_height_button = document.getElementById("measure_height_button_toolbar");
    let measure_distance_button = document.getElementById("measure_distance_button_toolbar");

    let height_id = 0;
    let label_id = 0;

    let handler_height, handler_distance;

    let distance_id = 0;
    let marker_id = 0;

    let total_distance = 0;

    // Declare the function reference variable
    let handleKeyDownRef;

    let myToast = new bootstrap.Toast(document.getElementById("myToast"));
    let bodyToast = document.getElementById("toastBody");

    function measureHeight() {

        if (handler_height) {
            handler_height = handler_height && handler_height.destroy();
            measure_height_button.style = "";

            console.log("ausschalten");

            if (handler_distance) {
                console.log("handler distance aktiv");
            } else {
                // Neues setzen der Funktion als Input Action
                viewer.screenSpaceEventHandler.setInputAction(get_featureinfo(), Cesium.ScreenSpaceEventType.LEFT_CLICK);

            }

        } else {

            console.log("einschalten");

            let modal_height = new bootstrap.Modal(document.getElementById("modalMeasure"));

            let modalHeader = document.getElementById("ModalLabelMeasure");
            let div_body = document.getElementById("modalBodyMeasurePoint");

            if (handler_distance) {

                // modalHeader.innerText = "Achtung";
                // div_body.innerText = "Es können nicht beide Messfunktionen gleichzeitig verwendet werden, schalten Sie eine aus!";

                translate(modalHeader, div_body, undefined, undefined, undefined, handler_distance);

            } else {

                // modalHeader.innerText = "Information";
                // div_body.innerText = "Sie können mit der linken Maustaste Punkte auf der Karte setzen. Mit einem Klick der rechten Maustaste in der Karte löschen Sie alle gezeichneten Höhenpunkte aus der Karte.";

                translate(modalHeader, div_body, undefined, undefined, undefined);
            }

            modal_height.show();

            // Der Click Handler wird zertört, damit keine Klicks in der Karte mehr als Attributtabelle auftauchen
            handler_karte_click = handler_karte_click && handler_karte_click.destroy();

            measure_height_button.style = "background-color: rgb(0, 255, 106);"

            handler_height = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

            handler_height.setInputAction(
                function(click) {

                    var cartesian = viewer.scene.pickPosition(click.position);

                    if (viewer.scene.pickPositionSupported && Cesium.defined(cartesian)) {
                        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                        var longitude = Cesium.Math.toDegrees(cartographic.longitude);
                        var latitude = Cesium.Math.toDegrees(cartographic.latitude);
                        var altitude = cartographic.height;
                        var altitudeString = Math.round(altitude).toString();

                        // Define the start and end positions of the polyline
                        var startPosition = cartesian;
                        var endPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude + 2);

                        // Create a new polyline entity and add it to the viewer
                        viewer.entities.add({
                            name: "Polyline",
                            polyline: {
                                positions: [endPosition, startPosition],
                                material: new Cesium.PolylineArrowMaterialProperty(),
                                width: 10,
                                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 2000.0)
                            },
                            id: 'point_height_marker' + height_id++
                        });

                        viewer.entities.add({
                            name: "Point height label",
                            position: Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude + 2.1),
                            label: {
                                text: altitudeString + " Meter",
                                font: "bold 30px 'Helvetica Neue', Helvetica, Arial, sans-serif", // use a custom font for the label
                                // pixelOffset: new Cesium.Cartesian2(0, -35),
                                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                                scale: 1.0,
                                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 2000.0),
                                scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 2000, 0.1)
                            },
                            id: 'height_label_' + label_id++
                        });

                    }

                    // Explicitly render a new frame
                    // Dies ist nötig, da sonst die neuen Elemeten im Bild nicht erscheinen
                    viewer.scene.requestRender();

                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            handler_height.setInputAction(
                function() {

                    var array_entities = [];

                    for (let teil of viewer.entities.values) {
                        if (teil.id.includes("point_height_marker")) {
                            array_entities.push(teil);
                            console.log("height");
                        } else if (teil.id.includes("height_label_")) {
                            array_entities.push(teil);
                            console.log("label");
                        }
                    }

                    // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
                    for (let entity of array_entities) {
                        viewer.entities.remove(entity);
                    }

                    // Explicitly render a new frame
                    viewer.scene.requestRender();

                }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        }
    }

    function measureDistance() {

        let array_cartesians_3 = [];

        if (handler_distance) {
            handler_distance = handler_distance && handler_distance.destroy();
            // remove eventlistener for esc and deleting the measured lines
            if (handleKeyDownRef) {
                document.removeEventListener("keydown", handleKeyDownRef);
                console.log("removed");
            }
            measure_distance_button.style = "";

            myToast.hide();
            total_distance = 0;

            console.log("ausschalten lines");

            if (handler_height) {
                console.log("handler height aktiv");
            } else {
                // Neues setzen der Funktion als Input Action
                viewer.screenSpaceEventHandler.setInputAction(get_featureinfo(), Cesium.ScreenSpaceEventType.LEFT_CLICK);
            }

        } else {

            let modal_distance = new bootstrap.Modal(document.getElementById("modalMeasureLine"));

            let modalHeader = document.getElementById("ModalLabelMeasureLine");
            let div_body = document.getElementById("modalBodyMeasureLine");

            console.log("einschalten");

            if (handler_height) {
                // modalHeader.innerText = "Achtung";
                // div_body.innerText = "Es können nicht beide Messfunktionen gleichzeitig verwendet werden, schalten Sie eine aus!";

                translate(modalHeader, div_body, undefined, undefined, undefined, handler_height);

            } else {

                // modalHeader.innerText = "Information";
                // div_body.innerText = "Sie können mit der linken Maustaste Punkte auf der Karte setzen. Mit einem Klick der rechten " +
                //     "Maustaste in der Karte können sie die Messung beenden. Mit der 'Esc' Taste löschen Sie alle Punkte";

                translate(modalHeader, div_body, undefined, undefined, undefined);
            }

            modal_distance.show();

            // Der Click Handler wird zertört, damit keine Klicks in der Karte mehr als Attributtabelle auftauchen
            handler_karte_click = handler_karte_click && handler_karte_click.destroy();

            measure_distance_button.style = "background-color: rgb(0, 255, 106);"
            handler_distance = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

            handler_distance.setInputAction(
                function() {

                    // Delete all points in the array and set distance to 0
                    array_cartesians_3 = [];
                    total_distance = 0;

                }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

            handler_distance.setInputAction(
                function(click) {

                    let cartesian = viewer.scene.pickPosition(click.position);

                    if (Cesium.defined(cartesian)) {

                        console.log(array_cartesians_3);

                        array_cartesians_3.push(cartesian);

                        // Neues Array aus den letzten beiden Punkten wird erstellt
                        let array_coord = array_cartesians_3.slice(-2);
                        // let cartographic = Cesium.Cartographic.fromCartesian(array_coord[0]);
                        // let longitude = Cesium.Math.toDegrees(cartographic.longitude);
                        // let latitude = Cesium.Math.toDegrees(cartographic.latitude);

                        if (array_coord.length === 1) {

                            // points.add({
                            //     position: array_coord[0],
                            //     color: Cesium.Color.CYAN,
                            //     disableDepthTestDistance: Number.POSITIVE_INFINITY,
                            //     distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 5000.0),
                            //     pixelSize: 8,
                            //     id: 'distance_marker_' + marker_id++
                            // });

                            // console.log(array_coord.length);

                            // Bild ist von https://fonts.google.com/icons?icon.query=location
                            viewer.entities.add({
                                name: "Polyline marker",
                                position: array_coord[0],
                                point: {
                                    // image: "./Icons/PunktMeasureLine.png",
                                    // Darstellung auch auf Gebäuden, auf clamptoground kann verzichtet werden
                                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 4000.0),
                                    scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 4000, 0.1),
                                    outlineColor: Cesium.Color.BLACK,
                                    outlineWidth: 1,
                                    pixelSize: 8,
                                    disableDepthTestDistance: Number.POSITIVE_INFINITY // disable depth testing for the point
                                },
                                id: 'distance_marker_' + marker_id++
                            });

                            bodyToast.textContent = "Bitte wählen Sie noch einen Punkt, um die Messung zu starten.";

                            translateToast(bodyToast, 0, 0);

                            // Wählen Sie das <small>-Element aus
                            const toastTime = document.querySelector('#toastTime');

                            // Aktualisieren Sie den Inhalt des <small>-Tags
                            toastTime.textContent = 0 + ' min ago';

                            myToast.show();

                            // Explicitly render a new frame
                            viewer.scene.requestRender();

                        } else {

                            // let cartographic2 = Cesium.Cartographic.fromCartesian(array_coord[1]);
                            // let longitude2 = Cesium.Math.toDegrees(cartographic2.longitude);
                            // let latitude2 = Cesium.Math.toDegrees(cartographic2.latitude);

                            viewer.entities.add({
                                name: "Polyline",
                                polyline: {
                                    // clampToGround: true,
                                    positions: array_coord,
                                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 5000.0),
                                    width: 5,
                                    depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
                                        color: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.5),
                                        outlineColor: Cesium.Color.DEEPSKYBLUE,
                                        outlineWidth: 2
                                    }),
                                    material: new Cesium.PolylineOutlineMaterialProperty({
                                        color: Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.5),
                                        outlineColor: Cesium.Color.DEEPSKYBLUE,
                                        outlineWidth: 2
                                    }),
                                },
                                id: 'polyline_distance_' + distance_id++
                            });

                            // points.get(0).show = true;

                            // points.add({
                            //     position: array_coord[1],
                            //     color: Cesium.Color.CYAN,
                            //     disableDepthTestDistance: Number.POSITIVE_INFINITY,
                            //     distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 5000.0),
                            //     pixelSize: 8,
                            //     id: 'distance_marker_' + marker_id++
                            // });

                            // Bild ist von https://fonts.google.com/icons?icon.query=location
                            viewer.entities.add({
                                name: "Polyline marker",
                                position: array_coord[1],
                                point: {
                                    // image: "./Icons/PunktMeasureLine.png",
                                    // Darstellung auch auf Gebäuden, auf clamptoground kann verzichtet werden
                                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 4000.0),
                                    scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 4000, 0.1),
                                    outlineColor: Cesium.Color.BLACK,
                                    outlineWidth: 1,
                                    pixelSize: 8,
                                    disableDepthTestDistance: Number.POSITIVE_INFINITY // disable depth testing for the point
                                },
                                id: 'distance_marker_' + marker_id++
                            });

                            // Explicitly render a new frame
                            viewer.scene.requestRender();

                            // Der Mittelpunkt wird aus den Beiden Punkten berechnet
                            let result = new Cesium.Cartesian3();
                            Cesium.Cartesian3.midpoint(array_coord[0], array_coord[1], result);

                            // Die Distanz wird aus den beiden Punkten berechnet
                            let distance = Cesium.Cartesian3.distance(array_coord[0], array_coord[1]);

                            total_distance = total_distance + distance;

                            // function to set time and the distances
                            setToast(distance, total_distance, bodyToast, myToast);

                            // let my_modal = new bootstrap.Modal(document.getElementById("modal_distance"));
                            // let body = document.getElementById("content_body_distance");
                            // body.innerText = "Die gesamte gemessene Strecke beträgt: " + total_distance + "Meter.";

                            // my_modal.show();

                            // // Eigene Entity für das Label hinzufügen
                            // viewer.entities.add({
                            //     name: "Polyline label",
                            //     position: result,
                            //     label: {
                            //         // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                            //         text: "Total " + total_distance.toFixed(3).toString() + " m",
                            //         eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -25.0),
                            //         scale: 0.70,
                            //         translucencyByDistance: new Cesium.NearFarScalar(0, 0.9, 5000, 0.0),
                            //         fillColor: Cesium.Color.MAROON
                            //     },
                            //     id: 'distance_label_' + label_id++

                            // });

                        }

                        // console.log(viewer.entities.values);
                    }

                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            // Declare the anonyoums function which will be called
            function handleKeyDown(event) {
                // call function
                handleKeyPress(event);
                // delete array with linepoints
                array_cartesians_3 = [];
                // delete the total lenght
                total_distance = 0;
            }

            // Set the function reference variable to the function
            handleKeyDownRef = handleKeyDown;

            // Add event listener using the function which is in the let
            document.addEventListener("keydown", handleKeyDownRef);

            // when a keydown event happens 
            // document.addEventListener("keydown", function(event) {
            //     handleKeyPress(event, array_cartesians_3, total_distance);
            // });
        }

        // return count++;
    }

    document.getElementById("measure_height_button_toolbar").addEventListener('click', measureHeight);

    document.getElementById("measure_distance_button_toolbar").addEventListener('click', measureDistance);

}

function setToast(distance, total_distance, bodyToast, myToast) {

    if (distance > 1000 && total_distance > 1000) {
        // Wenn die Distanz und total distance größer als 1000 Meter ist, umrechnen in Kilometer
        bodyToast.innerText = "Distanz: " + (distance / 1000).toFixed(3) + " Kilometer \n Gesamtdistanz des Linienzugs: " + (total_distance / 1000).toFixed(3) + " Kilometer";
        translateToast(bodyToast, distance, total_distance);
    } else if (total_distance > 1000) {
        // Wenn die total distance größer als 1000 Meter ist, umrechnen in Kilometer
        // bodyToast.innerText = "Distanz: " + distance.toFixed(3) + " Meter \n Gesamtdistanz des Linienzugs: " + (total_distance / 1000).toFixed(3) + " Kilometer";
        translateToast(bodyToast, distance, total_distance);
    } else {
        // Wenn die Distanz kleiner oder gleich 1000 Meter ist, in Metern belassen
        // bodyToast.innerText = "Distanz: " + distance.toFixed(3) + " Meter \n Gesamtdistanz des Linienzugs: " + total_distance.toFixed(3) + " Meter";
        translateToast(bodyToast, distance, total_distance);
    }

    // Call function to set and start the update of the time in the toast
    let startTime = new Date();
    updateToastTime(startTime);

    // show the toast
    myToast.show();
}

// Funktion zum Aktualisieren des Inhalts des <small>-Tags
function updateToastTime(startTime) {

    // delete intervall
    clearToastInterval();

    // Wählen Sie das <small>-Element aus
    const toastTime = document.querySelector('#toastTime');

    // Holen Sie sich die aktuelle Zeit und berechnen Sie die vergangene Zeit in Minuten
    const now = new Date();
    const minsAgo = Math.floor((now - startTime) / 60000);

    // Aktualisieren Sie den Inhalt des <small>-Tags
    toastTime.textContent = minsAgo + ' min ago';

    // Schedule the next update in one minute
    const intervalId = setInterval(function() {
        updateToastTime(startTime);
    }, 60000);

    // Store the interval ID on the toastTime element
    toastTime.dataset.intervalId = intervalId;
}

// Function to clear the interval of toast
function clearToastInterval() {
    const toastTime = document.querySelector('#toastTime');
    const intervalId = toastTime.dataset.intervalId;
    if (intervalId)
        clearInterval(intervalId);
}

function popover_tour() {

    const toolbar = document.querySelector("div.cesium-viewer-toolbar");

    // toolbar.childNodes[3].id = "homebutton";
    toolbar.childNodes[4].id = "homebutton";
    toolbar.childNodes[5].id = "sceneModePickerBtn";
    toolbar.childNodes[6].children[0].id = "help_button";

    const fullscreen = document.getElementsByClassName("cesium-button cesium-fullscreenButton");

    fullscreen[0].id = "fullscreen";

    // Verwendet wird für die Hilfetour "Bootstrap Tourist"

    /* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    */

    document.getElementById("btnB").addEventListener("click", () => {

        // Start the tour - note, no call to .init() is required
        let tour = setLanguageHelpTour();

        tour.restart();
    });

    document.getElementById("help_tour").addEventListener("click", () => {

        let tour = setLanguageHelpTour();
        tour.restart();
    });
}

function setLanguageHelpTour() {

    // get all img tags with the lang class
    const imagTags = document.querySelectorAll('img.eng, img.thai, img.ger');
    let helptour;

    // Loop through the img tags
    for (const imgTag of imagTags) {
        // Get the language class of the img tag
        const lang = imgTag.classList[0];

        // Check if the img tag has the "active-flag" class
        if (imgTag.classList.contains('active-flag')) {
            // Do something with the img tag based on its language class
            console.log(lang);
            if (lang === 'ger') {
                helptour = new Tour({
                    framework: 'bootstrap4', // or "bootstrap3" depending on your version of bootstrap
                    name: "tour",
                    backdrop: true,
                    localization: buttonTextGer,
                    steps: tour_steps_ger
                });
            } else if (lang === 'eng') {
                helptour = new Tour({
                    framework: 'bootstrap4', // or "bootstrap3" depending on your version of bootstrap
                    name: "tour",
                    backdrop: true,
                    localization: buttonTextEng,
                    steps: tour_steps_eng
                });
            } else if (lang === 'thai') {
                helptour = new Tour({
                    framework: 'bootstrap4', // or "bootstrap3" depending on your version of bootstrap
                    name: "tour",
                    backdrop: true,
                    localization: buttonTextThai,
                    steps: tour_steps_th
                });
            }
        }
    }

    return helptour;
}

function ShowClickMarker(click) {

    // Get the click position in the map
    var windowPosition = new Cesium.Cartesian2(click.position.x, click.position.y);
    var clickPosition = viewer.camera.pickEllipsoid(windowPosition, viewer.scene.globe.ellipsoid);

    // Only show the click animation if the click is on the globe
    if (clickPosition) {
        // Create a new div element for the click animation
        var clickAnimation = document.createElement('div');
        clickAnimation.classList.add('click-animation');
        clickAnimation.style.left = click.position.x - 15 + 'px';
        clickAnimation.style.top = click.position.y + 38 + 'px';

        // Add the click animation to the DOM
        document.body.appendChild(clickAnimation);
    }

    // Remove the click animation after a delay
    setTimeout(function() {
        if (clickAnimation)
            clickAnimation.parentNode.removeChild(clickAnimation);
    }, 850);
}

function get_featureinfo() {

    let info_id = 0;

    // Leider war es nicht möglich über die Standardfunktionen den selection_indicator und die Infobox so auszuschalten
    // das nach einem Klick beim Messen auch keine Infobox mehr erscheint
    // Daher wurde eine neue Infobox erstellt, welche ordnungsgemäß funktioniert

    // inital wird die Input action entfernt, um die initalen Infofelder und den selector nicht zu verwenden
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // var infoBox_one = document.getElementsByClassName("cesium-infoBox cesium-infoBox-bodyless")[0];
    // if (infoBox_one) {
    //     console.log("check");
    //     infoBox_one.hidden = true;
    // }

    // Neue Inputaction
    handler_karte_click = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

    let infoboxcontainer = document.getElementsByClassName("cesium-viewer-infoBoxContainer")[0];
    // var selectionindicator_container = document.getElementsByClassName("cesium-viewer-selectionIndicatorContainer")[0];

    // Neue Infobox
    let infobox_karte = new Cesium.InfoBox(infoboxcontainer);

    // set eventlistner for close click on infobox
    infobox_karte.viewModel.closeClicked.addEventListener(() => {
        // close infobox
        closeInfoBox(infobox_karte);
    });

    // Neuer Selection Indicator
    // var selection_indicator = new Cesium.SelectionIndicator(selectionindicator_container, viewer.scene);

    // var selection_indicator_view = new Cesium.SelectionIndicatorViewModel(viewer.scene, selection_indicator, selectionindicator_container);

    handler_karte_click.setInputAction(
        function(click) {

            // Show blue marker on click on map
            ShowClickMarker(click);

            let cartographic;
            let longitude;
            let latitude;

            let cartesian = viewer.scene.pickPosition(click.position);
            if (cartesian) {
                cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                longitude = Cesium.Math.toDegrees(cartographic.longitude);
                latitude = Cesium.Math.toDegrees(cartographic.latitude);
            }

            // Entities anklicken
            let picked_entity = viewer.scene.pick(click.position);

            let table = document.createElement("table");
            //zum schöner machen die Class 
            table.className = "cesium-infoBox-defaultTable";

            // add Longitude and Latitude once to the table for every click
            addLongLattoTable(longitude, latitude, table, click);

            let loadingAnimation = loadingInfoTable(table);

            // loadingAnimation.row.style.display = "table-row";
            // // loadingAnimation.row.classList.add("hide");
            // loadingAnimation.animation.style.display = "block";

            // Add the css from the main html to the iframe html documents head to activate animation in the info Table
            // Get the content document of the infobox_karte frame
            let infoboxDoc = infobox_karte.frame.contentDocument;

            // Check if the link tag already exists in the head
            let existingLinkTag = infoboxDoc.querySelector('head link[href="./CSS/styleInfoTable.css"]');
            if (!existingLinkTag) {
                // Create a new link tag
                let newLinkTag = infoboxDoc.createElement('link');
                newLinkTag.rel = 'stylesheet';
                newLinkTag.type = 'text/css';
                newLinkTag.href = './CSS/styleInfoTable.css';

                // Add the new link tag to the head
                infoboxDoc.head.appendChild(newLinkTag);
            } else {
                console.log('Link already exists in the head of infobox_karte.frame.contentDocument');
            }

            // document.getElementById("loading-row").style.display = "table-row";

            // bei jedem click wird eine neue Zeile und tD erstellt
            let tr = document.createElement('tr'); //Zeile
            let tD = document.createElement('td'); //Datenzelle linksbündig und regular
            let tD2 = document.createElement('td'); //Datenzelle linksbündig und regular

            // document.getElementById("loadingrow").classList.remove("hide");

            // Prüfen, ob bereits entitites der infomarker bestehen und falls ja löschen!
            // Add marker for better UX
            info_id = addMarkerClickInfo(cartesian, info_id);

            infobox_karte.viewModel.showInfo = true;
            // update table due to modify table
            infobox_karte.viewModel.description = table.outerHTML;

            // let loadingRow = document.getElementsByClassName("loadingRow");
            // console.log(loadingRow);

            if (!Cesium.defined(picked_entity)) {
                console.log('No features picked.');

                // dont show loading animation 
                loadingAnimation.row.style.display = "none";
                // loadingAnimation.row.classList.add("hide");
                loadingAnimation.animation.style.display = "none";
                // loadingAnimation.animation.classList.add("hide");

                // update description table
                infobox_karte.viewModel.description = table.outerHTML;

                // let tD = document.createElement('td'); //Überschriftenzelle center und fett dargestellt

                // tD.innerHTML = "Test";

                // tr.appendChild(tD);
                // table.appendChild(tr);

                // infobox_karte.viewModel.description = table.outerHTML;

            } else {

                // show loading animation due to data loaded
                loadingAnimation.row.style.display = "contents";
                //loadingAnimation.row.classList.remove("hide");
                loadingAnimation.animation.style.display = "block";
                // loadingAnimation.animation.classList.remove("hide");

                // Tabellenbeschreibung als HTML
                infobox_karte.viewModel.description = table.outerHTML;

                if (picked_entity.id instanceof Cesium.Entity) {

                    let entity = picked_entity.id;
                    // infobox_karte.viewModel.showInfo = true;

                    // console.log(typeof entity.label);
                    if (entity) {
                        // Wenn es sich um ein Label handelt, dann soll auch das Attribut mit angegeben werden
                        if (entity.label) {

                            // setzen des Tabellennamens
                            // infobox_karte.viewModel.titleText = entity.name;

                            if (entity.name == "Point height label") {
                                tD.innerHTML = "Höhe an dem Punkt";
                                tD2.innerHTML = entity.label.text._value;
                            } else {
                                tD.innerHTML = "Distanz der Strecke";
                                tD2.innerHTML = entity.label.text._value;
                            }

                            tr.appendChild(tD);
                            tr.appendChild(tD2);
                            table.appendChild(tr);

                            infobox_karte.viewModel.description = table.outerHTML;

                            // document.getElementById("loading-row").classList.add("hide");

                        } else {

                            if (entity.id.includes("geolocate_point_")) {

                                // tD.innerHTML = "Ort";
                                // tD2.innerHTML = entity.name;

                                // replace the generated long and lat fo revery click with the coords from the clicked entity
                                table = getFeaturesEntity(entity, table);
                                // // add Ort and enttiy name as TD
                                // tr.appendChild(tD);
                                // tr.appendChild(tD2);
                                // table.appendChild(tr);

                                infobox_karte.viewModel.description = table.outerHTML;

                                // infobox_karte.viewModel.titleText = entity.name;
                            } else if (entity.id.includes("distance_marker_") || entity.id.includes("point_height_marker") || entity.id.includes("polyline_distance_") || entity.id.includes("searchadress_point_")) {

                                // replace the generated long and lat fo revery click with the coords from the clicked entity
                                table = getFeaturesEntity(entity, table);

                                // tD.innerHTML = "Objekt";
                                // tD2.innerHTML = entity.name;

                                // tr.appendChild(tD);
                                // tr.appendChild(tD2);
                                // table.appendChild(tr);

                                infobox_karte.viewModel.description = table.outerHTML;

                            } else if (entity.id.includes("point_info_marker")) {

                                console.log(entity.id);

                                // replace the generated long and lat fo revery click with the coords from the clicked entity
                                table = getFeaturesEntity(entity, table);

                                // tD.innerHTML = "Adresse";
                                // tD2.innerHTML = entity.name;

                                // tr.appendChild(tD);
                                // tr.appendChild(tD2);
                                // table.appendChild(tr);

                                infobox_karte.viewModel.description = table.outerHTML;

                            } else {

                                // OSM Builings are entitites
                                // input string
                                let inputString = entity.description.getValue(Cesium.JulianDate.now());

                                inputString = inputString.replaceAll('<th>', '<td>');
                                inputString = inputString.replaceAll('</th>', '</td>');

                                // TODO
                                // translateInfoTable(inputString);

                                // Convert string to HTML document object
                                let parser = new DOMParser();
                                let doc = parser.parseFromString(inputString, 'text/html');

                                let tableRows = doc.querySelectorAll('tr');

                                for (let i = 0; i < tableRows.length; i++) {
                                    if (tableRows[i]) {
                                        table.appendChild(tableRows[i]);
                                    }
                                }

                                loadingAnimation.row.style.display = "none";
                                // loadingAnimation.row.classList.add("hide");
                                loadingAnimation.animation.style.display = "none";
                                // loadingAnimation.animation.classList.add("hide");

                                infobox_karte.viewModel.description = table.outerHTML;
                            }
                        }
                    }

                    // infobox_karte.viewModel.closeClicked.addEventListener(() => {

                    //     // Prüfen, ob bereits entitites der infomarker bestehen und falls ja löschen!
                    //     closeInfoBox(infobox_karte);
                    // });

                }
            }

            // Gebäude ancklicken
            // An entity object which will hold info about the currently selected feature for infobox display
            // var selectedEntity = new Cesium.Entity();

            // // Pick a new feature
            // var pickedFeature = viewer.scene.pick(click.position);

            // if (!Cesium.defined(pickedFeature)) {
            //     console.log('No features picked.');
            // } else {

            //     // Prüfen, ob bereits entitites der infomarker bestehen und falls ja löschen!
            //     info_id = addMarkerClickInfo(cartesian, info_id);

            //     if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
            //         infobox_karte.viewModel.showInfo = true;

            //         // //Set feature infobox description
            //         // if (!Cesium.defined(pickedFeature.getProperty('ObjectId'))) {
            //         //     featureName = pickedFeature.getProperty('gml_id');
            //         // } else {
            //         //     featureName = pickedFeature.getProperty('ObjectId');
            //         // }
            //         // //var featureName = pickedFeature.getProperty('name');
            //         // selectedEntity.name = featureName;
            //         // viewer.selectedEntity = selectedEntity;

            //         var propertyNames = pickedFeature.getPropertyNames();
            //         var length = propertyNames.length;

            //         // var table_citygml = document.createElement("table");
            //         // //zum schöner machen die Class 
            //         // table_citygml.className = "cesium-infoBox-defaultTable";

            //         //Dynamisches erstellen der Tabelle mit den jeweilgen Metadaten über die gesamtanzahl der Attribute bei jedem Klick
            //         for (var i = 0; i < length; i++) {
            //             propertyName = propertyNames[i];
            //             if (pickedFeature.getProperty(propertyName) != null) {
            //                 //alert(propertyName + ': ' + pickedFeature.getProperty(propertyName));

            //                 var tr = document.createElement('tr'); //Zeile
            //                 var th = document.createElement('th'); //Überschriftenzelle center und fett dargestellt
            //                 var td = document.createElement('td'); //Datenzelle linksbündig und regular

            //                 th.innerHTML = propertyName;
            //                 td.innerHTML = pickedFeature.getProperty(propertyName);

            //                 tr.appendChild(th);
            //                 tr.appendChild(td);
            //                 table.appendChild(tr);
            //             }
            //         }

            //         infobox_karte.viewModel.description = table.outerHTML;
            //         // setzen des Tabellennamens
            //         // infobox_karte.viewModel.titleText = "Kartenabfrage CityGML";

            //         //     //Holen des div Tags, der Tabelle enthalten soll 
            //         //     var div = document.getElementById("infotabelle");

            //         //     //Hinzufügen der tabelle dynamisch an das div Tag
            //         //     if (div.childNodes.length < 1) {
            //         //         div.appendChild(table);
            //         //     } else {
            //         //         // Entfernen des ersten Kindknotens (index 0)
            //         //         div.removeChild(div.childNodes[0]);
            //         //         div.appendChild(table);
            //         //     }

            //         infobox_karte.viewModel.closeClicked.addEventListener(() => {

            //             // Prüfen, ob bereits entitites der infomarker bestehen und falls ja löschen!
            //             closeInfoBox(entity);
            //         });

            //     }
            // }

            //Die Beschreibung der Entität als HTML angegeben, diese erfolgt hier dynamisch, stellt die Tabelle dar
            // selectedEntity.description = document.getElementById("infotabelle").innerHTML;

            const pickRay = viewer.camera.getPickRay(click.position);
            const featuresPromise = viewer.imageryLayers.pickImageryLayerFeatures(pickRay, viewer.scene);
            if (!Cesium.defined(featuresPromise)) {

                console.log('No features picked.');

                loadingAnimation.row.style.display = "none";
                //loadingAnimation.row.classList.add("hide");
                loadingAnimation.animation.style.display = "none";
                //loadingAnimation.animation.classList.add("hide");

                infobox_karte.viewModel.description = table.outerHTML;

            } else {

                loadingAnimation.row.style.display = "contents";
                // loadingAnimation.row.classList.remove("hide");
                loadingAnimation.animation.style.display = "block";
                // loadingAnimation.animation.classList.remove("hide");

                // Tabellenbeschreibung als HTML
                infobox_karte.viewModel.description = table.outerHTML;

                Promise.resolve(featuresPromise).then(function(features) {

                    // This function is called asynchronously when the list if picked features is available.

                    if (features.length > 0) {

                        for (let element of features) {
                            // console.log(element.imageryLayer.imageryProvider._layers);

                            if (element.description && element.data.geometryType === "esriGeometryPolygon") {
                                let count = Object.keys(element.properties).length;

                                // input string
                                let inputString = element.description;

                                // Convert string to HTML document object
                                let parser = new DOMParser();
                                let doc = parser.parseFromString(inputString, 'text/html');

                                let tableRows = doc.querySelectorAll('tr');

                                for (let i = 0; i < count; i++) {
                                    if (tableRows[i]) {

                                        // trElement.appendChild(thElement);
                                        // tr.appendChild(tdElement);
                                        table.appendChild(tableRows[i]);
                                    }
                                }

                                // console.log(table.outerHTML);
                                // Nur das erste Element aus der langen Liste soll angezeigt werden, daher break nach dem ersten Element
                                break;

                            } else {

                                // WMS Data
                                // input string
                                let inputString = element.description;

                                // Convert string to HTML document object
                                let parser = new DOMParser();
                                let doc = parser.parseFromString(inputString, 'text/html');

                                let tableRows = doc.querySelectorAll('tr');

                                for (let i = 0; i < tableRows.length; i++) {
                                    if (tableRows[i]) {
                                        console.log(tableRows[i]);
                                        table.appendChild(tableRows[i]);
                                    }
                                }
                            }

                            // infobox_karte.viewModel.description = table.outerHTML;

                        }

                        // when all features are queryed, dont show the loading animation
                        loadingAnimation.row.style.display = "none";
                        // // loadingAnimation.row.classList.add("hide");
                        loadingAnimation.animation.style.display = "none";
                        // // loadingAnimation.animation.classList.add("hide");

                        // Tabellenbeschreibung als HTML
                        infobox_karte.viewModel.description = table.outerHTML;

                    }

                    // when no features are queryed, dont show the loading animation
                    loadingAnimation.row.style.display = "none";
                    // // loadingAnimation.row.classList.add("hide");
                    loadingAnimation.animation.style.display = "none";
                    // // loadingAnimation.animation.classList.add("hide");

                    // Tabellenbeschreibung als HTML
                    infobox_karte.viewModel.description = table.outerHTML;

                });

            }

            // setzen des Tabellennamens
            infobox_karte.viewModel.titleText = "Abfrageergebnisse";

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

function getFeaturesEntity(entity, table) {

    if (entity.position) {
        let posEntity = entity.position.getValue(Cesium.JulianDate.now());

        let cartographic = Cesium.Cartographic.fromCartesian(posEntity);
        let longitude = Cesium.Math.toDegrees(cartographic.longitude);
        let latitude = Cesium.Math.toDegrees(cartographic.latitude);

        // safe values from point in array
        let arr = ["Longitude", longitude.toFixed(5), "Latitude", latitude.toFixed(5), "Objekt", entity.name];
        let counter = 1;

        for (let i = 0; i < arr.length; i += 2) {
            let tr = document.createElement('tr'); //Zeile
            let tD = document.createElement('td');
            let tD2 = document.createElement('td');
            tD.innerHTML = arr[i];
            tD2.innerHTML = arr[i + 1];

            tr.appendChild(tD);
            tr.appendChild(tD2);
            table.appendChild(tr);
            table.replaceChild(tr, table.children[counter++]);
            // console.log(table.children[counter++]);
        }
    } else {
        // If position is not defined, add a row to the table with "undefined" values
        let tr = document.createElement('tr');
        let tD = document.createElement('td');
        let tD2 = document.createElement('td');
        tD.innerHTML = "Longitude";
        tD2.innerHTML = "undefined";

        tr.appendChild(tD);
        tr.appendChild(tD2);
        table.appendChild(tr);
        table.replaceChild(tr, table.children[1]);

        tr = document.createElement('tr');
        tD = document.createElement('td');
        tD2 = document.createElement('td');
        tD.innerHTML = "Latitude";
        tD2.innerHTML = "undefined";

        tr.appendChild(tD);
        tr.appendChild(tD2);
        table.appendChild(tr);
        table.replaceChild(tr, table.children[2]);

        tr = document.createElement('tr');
        tD = document.createElement('td');
        tD2 = document.createElement('td');
        tD.innerHTML = "Objekt";
        tD2.innerHTML = entity.name;

        tr.appendChild(tD);
        tr.appendChild(tD2);
        table.appendChild(tr);
        table.replaceChild(tr, table.children[3]);
    }

    return table;
}

function addLongLattoTable(longitude, latitude, table, click) {

    if (longitude && latitude) {
        let arr = ["Longitude", longitude.toFixed(5), "Latitude", latitude.toFixed(5)];

        for (let i = 0; i < arr.length; i += 2) {
            let tr = document.createElement('tr'); //Zeile
            let tD = document.createElement('td');
            let tD2 = document.createElement('td');
            tD.innerHTML = arr[i];
            tD2.innerHTML = arr[i + 1];

            tr.appendChild(tD);
            tr.appendChild(tD2);
            table.appendChild(tr);
        }

    } else {

        // Get the click position in the map
        var windowPosition = new Cesium.Cartesian2(click.position.x, click.position.y);
        var clickPosition = viewer.camera.pickEllipsoid(windowPosition, viewer.scene.globe.ellipsoid);

        if (!clickPosition) {
            // Add row no data selected
            let noDataRow = table.insertRow(0);

            noDataRow.innerText = "No data here.";
        }

    }
}

function closeInfoBox(infoBox) {

    let array_entities = [];
    // löschen der Werte aus dem Array!
    for (let teil of viewer.entities.values) {
        if (teil.id.includes("point_info_marker")) {
            array_entities.push(teil);
            console.log("info point");
        }
    }

    // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
    for (let entity of array_entities) {
        console.log("info point removed");
        viewer.entities.remove(entity);
    }

    // Explicitly render a new frame
    viewer.scene.requestRender();

    infoBox.viewModel.showInfo = false;
}

function addMarkerClickInfo(cartesian, info_id) {
    // let array_entities = [];
    // löschen der Werte aus dem Array!
    for (let teil of viewer.entities.values) {
        if (teil.id.includes("point_info_marker")) {
            // array_entities.push(teil);
            viewer.entities.remove(teil);
        }
    }

    // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
    // for (let entity of array_entities) {
    //     console.log("info point removed");
    //     viewer.entities.remove(entity);
    // }

    if (cartesian) {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let longitude = Cesium.Math.toDegrees(cartographic.longitude);
        let latitude = Cesium.Math.toDegrees(cartographic.latitude);
        let altitude = cartographic.height;

        viewer.entities.add({
            name: "Point info marker",
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude),
            billboard: {
                image: "./Icons/info-marker.svg",
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 2000.0),
                scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 2000, 0.6),

                // Darstellung auch auf Gebäuden, auf clamptoground kann verzichtet werden
                // Damit das billboard nicht im boden versinkt, wird pixeloffset verwendet
                pixelOffset: new Cesium.Cartesian2(0, -20),
                disableDepthTestDistance: Number.POSITIVE_INFINITY // disable depth testing for the point
            },
            id: 'point_info_marker' + info_id++
        });

        // Explicitly render a new frame für info marker
        viewer.scene.requestRender();
    }

    return info_id;
}