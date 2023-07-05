import { toggleActiveImgItem, viewer } from './javaScript.js';
import Terrain from './Terrain.js';
import OsmBuildings from './OsmBuildings.js';
import { translateModal, translateToastHeight, translateToast, translateInfoTable, translateInfoTableTitle, translateArrayInput } from './translate.js';
import ImageryLayers from './ImageryLayer.js';
import ExternalGeoJson from './ExternalGeoJson.js';
import ExternalServiceWms from './ExternalServiceWms.js';
import MutationObserverDom from './MutationObserver.js';
import { loadingInfoTable } from './loadAnimations.js';

const imageryLayers = new ImageryLayers();
const osmBuildings = new OsmBuildings();
const terrain = new Terrain(osmBuildings);

const externalDataGeoJson = new ExternalGeoJson();
externalDataGeoJson.addExternalGeoJson();
const externalServiceWms = new ExternalServiceWms();
externalServiceWms.addExternalServiceWms();
// generate MutationObserver
const mutationObserver = new MutationObserverDom(externalDataGeoJson, externalServiceWms);
mutationObserver.MutationObserverDOM();

let handlerKarteClick, handlerHeight, handlerDistance;
let totalDistance = 0;
let tempArrayPoints = [];
let heightID = 0;
let distanceID = 0;
let markerID = 0;

// Define the Map class
export default class Map {
    constructor() {
        // Set the function reference variable to the function
        this.handleKeyDownRef = null;
    }

    handlingImagery(osmlayer, esrilayer) {
        let layerESRIImg = document.getElementById("layer_img_2");
        // remove the eventlistener for toggle the active Layers state
        layerESRIImg.removeEventListener("click", toggleActiveImgItem);
        imageryLayers.handlingEsriLayer(esrilayer);

        let layerOSMImg = document.getElementById("layer_img_1");
        // remove the eventlistener for toggle the active Layers state
        layerOSMImg.removeEventListener("click", toggleActiveImgItem);
        imageryLayers.handlingOSMmap(osmlayer);
    }

    handlingTerrain(worldTerrain, EllipsoidTerrainProvider) {
        terrain.checkTerrainBuildings(worldTerrain, EllipsoidTerrainProvider);

        let EllisiodTerrainImg = document.getElementById("layer_img_4");

        // remove eventlistener, terrain can not be deactivated
        EllisiodTerrainImg.removeEventListener("click", toggleActiveImgItem);
        EllisiodTerrainImg.addEventListener("click", (event) => {
            terrain.ChangeTerrainEllipsoidWGS84(event, EllipsoidTerrainProvider);
        });

        let layerVRWorldTerrainImg = document.getElementById("layer_img_5");

        // remove eventlistener, terrain can not be deactivated
        layerVRWorldTerrainImg.removeEventListener("click", toggleActiveImgItem);
        layerVRWorldTerrainImg.addEventListener("click", (event) => {
            terrain.ChangeTerrainVRWorld(event, worldTerrain);
        });
    }

    handlingOSMBuildings() {
        let layerOSMBuildingsimg = document.getElementById("layer_img_3");

        // Arrow functions inherit the this value from their surrounding scope.
        // which automatically binds the class context to this
        // so call this.ShowBuildings();

        layerOSMBuildingsimg.addEventListener("click", (event) => {

            console.log(event.target.classList);

            if (event.target.classList.contains('active')) {
                let VRWorldTerrainImg = document.getElementById("layer_img_5");
                if (VRWorldTerrainImg.classList.contains('active')) {
                    // Display a modal with inforamtion that the buildings use much ressource with Terrain(RAM etc.)
                    let modal = new bootstrap.Modal(document.querySelectorAll("[id^='modal_osm_buildings_clamping']")[0]);
                    let modalHeader = document.getElementById("exampleModalLabel");
                    let modalBody = document.getElementById("modal_body_osm_buildings_clamping");
                    let buttonOK = document.getElementById("ok_button_osm_buildings_terrain");
                    let newID = "modal_osm_buildings_clamping";
                    document.querySelectorAll("[id^='modal_osm_buildings_clamping']")[0].id = newID;
                    // modalBody.innerText = "Für die Aktiverung des Geländes mit eingeschalteten Gebäuden werden aus Performancegründen keine Gebäude auf dem Gelände dargestellt. Daher werden die Gebäude nur auf dem WGS84 Ellipsiod dargestellt und visualiert.";

                    console.log("a");
                    modalBody.innerHTML = "Wenn die Gebäude auf dem Gelände dargestellt werden, wird eine höhere Rechnerleistung benötigt.";
                    // translate the modal
                    // translateModal(modalHeader, modalBody, undefined, undefined, buttonOK);

                    modal.show();
                } else {
                    console.log("ShowBuildings");
                    osmBuildings.ShowBuildings();
                }
            } else {
                console.log("DontShowBuildings");
                osmBuildings.DontShowBuildings();

            }
        });
    }

    geolocate() {

        let geolocation_button = document.getElementById("geolocate_button_toolbar");

        // geolocation_button.addEventListener('click', getLocation);
        // Use an arrow function for the event listener
        geolocation_button.addEventListener('click', () => {
            getLocation();
        });

        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                // Modal Abfrage Geoloation not supported

                let modal = new bootstrap.Modal(document.getElementById("modal"));
                let div_body = document.getElementById("modalBody");

                div_body.innerText = "Die Abfrage der Geolocation ist in diesem Browser nicht unterstützt.";

                // translateModal(undefined, div_body, undefined, undefined);

                modal.show();
            }
        };

        const showPosition = async (position) => {

            geolocation_button.style = "background-color: rgb(0, 255, 106);"

            console.log("Latitude: " + position.coords.latitude +
                "Longitude: " + position.coords.longitude);

            // create a cartesian coord for elippsiod terrain
            let cartesian = Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude);

            // use await to wait for result of function 
            // update coordinate if terrain is used
            cartesian = await this.checkForTerrainAndCalcCartesian(cartesian, position.coords.longitude, position.coords.latitude);

            // let VRWorldTerrainImg = document.getElementById("layer_img_5");
            // if (VRWorldTerrainImg.classList.contains('active')) {
            //     // calulate height of entity postion first
            //     let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            //     // let heightfromglobe = viewer.scene.globe.getHeight(cartographic);
            //     // Get the terrain height at the coordinate
            //     await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [cartographic]).then(function(samples) {
            //         let height = samples[0].height;
            //         // console.log(height);
            //         // create a cartesian coord for Cesium terrain
            //         cartesian = Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude, height);
            //         // add_marker(cartesian);
            //         // Do something with the height value here
            //     });

            // }

            add_marker(cartesian);

            // 1000 meter abstand zu dem Punkt to fly to
            let cartesianWithHeight = Cesium.Cartesian3.fromDegrees(position.coords.longitude, position.coords.latitude, 1000);

            // let cartesianWithHeight = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);

            viewer.camera.flyTo({
                destination: cartesianWithHeight,
                complete: change_backgroundcolor_normal
            });

        };

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
            let locationEntity = viewer.entities.add({
                name: "My Location",
                position: cartesian_three,
                description: "An marker with my current location",
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

            return locationEntity;
        }
    }

    async checkForTerrainAndCalcCartesian(cartesian, longitude, latitude) {

        let VRWorldTerrainImg = document.getElementById("layer_img_5");

        if (VRWorldTerrainImg.classList.contains('active')) {
            // calulate height of entity postion first
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            // let heightfromglobe = viewer.scene.globe.getHeight(cartographic);
            // Get the terrain height at the coordinate
            await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [cartographic]).then(function (samples) {
                let height = samples[0].height;
                // console.log(height);
                // create a cartesian coord for Cesium terrain
                cartesian = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
                // add_marker(cartesian2);
                // Do something with the height value here
            });

        }

        return cartesian;
    }

    geocodieren() {

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
            timeout = setTimeout(async function () {
                var geocoder_search_url_replaced = geocoder_search_url.replace("{query}", query);

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

    clearGeocodes() {
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

    chooseGeocode() {

        let point_id = 0;

        let liste = document.getElementById("liste");
        if (document.body.contains(document.getElementById("liste"))) {
            liste.onclick = async e => {
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

                // console.log(elementClicked.getAttribute('data-name'));

                if (elementClicked.getAttribute('data-name')) {

                    let name_adress = elementClicked.getAttribute('data-name');

                    // setzen des namens in die Suchleiste bei Auswahl
                    document.getElementById("input_geocode").value = name_adress;

                    // let cartographic_position = Cesium.Cartographic.fromDegrees(parseFloat(elementClicked.getAttribute('data-longitude')),
                    //     parseFloat(elementClicked.getAttribute('data-latitude')));

                    // let cartesian_position = Cesium.Cartographic.toCartesian(cartographic_position);

                    // create a cartesian coord for elippsiod terrain
                    let cartesian = Cesium.Cartesian3.fromDegrees(parseFloat(elementClicked.getAttribute('data-longitude')),
                        parseFloat(elementClicked.getAttribute('data-latitude')));

                    let longitude = parseFloat(elementClicked.getAttribute('data-longitude'));
                    let latitude = parseFloat(elementClicked.getAttribute('data-latitude'));

                    // use await to wait for result of function 
                    // update coordinate if terrain is used
                    cartesian = await this.checkForTerrainAndCalcCartesian(cartesian, longitude, latitude);

                    // Bild ist von https://fonts.google.com/icons?icon.query=location
                    let entity = viewer.entities.add({
                        name: name_adress,
                        position: cartesian,
                        description: "The adress you searched",
                        billboard: {
                            image: "./Icons/search-address-pin.svg",
                            scale: 0.5,
                            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 4000.0),
                            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                            // pixelOffset: new Cesium.Cartesian2(0, -15),
                            scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 4000, 0.1)
                        },
                        id: 'searchadress_point_' + point_id++
                    });

                    let cartographic = Cesium.Cartographic.fromCartesian(entity.position.getValue(0));
                    let longitudeEntity = Cesium.Math.toDegrees(cartographic.longitude);
                    let latitudeEntitiy = Cesium.Math.toDegrees(cartographic.latitude);
                    // 1000 meter distance to the entity
                    let altitude = cartographic.height + 1000;

                    let cartesianWithHeight = Cesium.Cartesian3.fromDegrees(longitudeEntity, latitudeEntitiy, altitude);

                    viewer.camera.flyTo({
                        destination: cartesianWithHeight
                    })
                }
            }
        }

    }

    handleKeyPress(event) {

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

    measureFunctions() {

        let measure_height_button = document.getElementById("measure_height_button_toolbar");
        let measure_distance_button = document.getElementById("measure_distance_button_toolbar");

        // Declare the function reference variable
        // let handleKeyDownRef;

        let myToast = new bootstrap.Toast(document.getElementById("myToast"));
        let bodyToast = document.getElementById("toastBody");

        document.getElementById("measure_height_button_toolbar").addEventListener('click', () => {
            this.measureHeight(measure_height_button, myToast, bodyToast);
        });

        document.getElementById("measure_distance_button_toolbar").addEventListener('click', () => {
            this.measureDistance(measure_distance_button, myToast, bodyToast);
        });

    }

    measureHeight(measure_height_button, myToast, bodyToast) {

        if (handlerHeight) {
            handlerHeight = handlerHeight && handlerHeight.destroy();
            measure_height_button.style = "";

            console.log("ausschalten");

            myToast.hide();

            if (handlerDistance) {
                console.log("handler distance aktiv");
            } else {
                // Neues setzen der Funktion als Input Action
                viewer.screenSpaceEventHandler.setInputAction(this.getFeatureInfo(), Cesium.ScreenSpaceEventType.LEFT_CLICK);
            }

        } else {

            console.log("einschalten");

            let modal_height = new bootstrap.Modal(document.getElementById("modalMeasure"));

            let modalHeader = document.getElementById("ModalLabelMeasure");
            let div_body = document.getElementById("modalBodyMeasurePoint");

            if (handlerDistance) {

                myToast.hide();

                modalHeader.innerText = "Achtung";
                div_body.innerText = "Es können nicht beide Messfunktionen gleichzeitig verwendet werden, schalten Sie eine aus!";

                // translateModal(modalHeader, div_body, undefined, undefined, undefined, handlerDistance);

            } else {

                modalHeader.innerText = "Information";
                div_body.innerText = "Sie können mit der linken Maustaste Punkte auf der Karte setzen. Mit einem Klick der rechten Maustaste in der Karte löschen Sie alle gezeichneten Höhenpunkte aus der Karte.";

                // translateModal(modalHeader, div_body, undefined, undefined, undefined);
            }

            modal_height.show();

            console.log(handlerKarteClick);

            // Der Click Handler wird zertört, damit keine Klicks in der Karte mehr als Attributtabelle auftauchen
            handlerKarteClick = handlerKarteClick && handlerKarteClick.destroy();

            measure_height_button.style = "background-color: rgb(0, 255, 106);"

            handlerHeight = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

            handlerHeight.setInputAction(
                async (click) => {

                    // delete the previous drawn points
                    for (let teil of viewer.entities.values) {
                        if (teil.id.includes("point_height_marker")) {
                            viewer.entities.remove(teil);
                            console.log("height removed");
                        }
                    }

                    let cartesian = viewer.scene.pickPosition(click.position);

                    if (viewer.scene.pickPositionSupported && Cesium.defined(cartesian)) {

                        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                        let altitudeString;

                        // calc new height due to terrain and negativ values
                        await Cesium.sampleTerrain(viewer.terrainProvider, 13, [cartographic]).then(function (samples) {
                            let heightTerrain = samples[0].height;
                            // console.log(heightTerrain);
                            altitudeString = Math.round(heightTerrain).toString();
                        });

                        // Create a new polyline entity and add it to the viewer
                        viewer.entities.add({
                            name: "Height point",
                            position: cartesian,
                            description: "Your measured Point with the ID" + ++heightID,
                            point: {
                                color: Cesium.Color.fromCssColorString('#ff0000'),
                                pixelSize: 8,
                                // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 6000.0),
                                // scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 6000, 0.1),
                                outlineColor: Cesium.Color.fromCssColorString('#000000'),
                                outlineWidth: 1,
                                disableDepthTestDistance: Number.POSITIVE_INFINITY // disable depth testing for the point
                            },
                            id: 'point_height_marker' + heightID
                        });

                        // bodyToast.textContent = "Bitte wählen Sie noch einen Punkt, um die Messung zu starten.";

                        // // Wählen Sie das <small>-Element aus
                        // const toastTime = document.querySelector('#toastTime');

                        // // Aktualisieren Sie den Inhalt des <small>-Tags
                        // toastTime.textContent = 0 + ' min ago';

                        // function to set time and the height of toast and set the time
                        this.setToastHeight(altitudeString, bodyToast, myToast);
                    }

                    // Explicitly render a new frame
                    // Dies ist nötig, da sonst die neuen Elemeten im Bild nicht erscheinen
                    viewer.scene.requestRender();

                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            handlerHeight.setInputAction(
                function () {

                    let array_entities = [];

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

    measureDistance(measure_distance_button, myToast, bodyToast) {

        if (handlerDistance) {
            handlerDistance = handlerDistance && handlerDistance.destroy();
            // remove eventlistener for esc and deleting the measured lines
            if (this.handleKeyDownRef) {
                document.removeEventListener("keydown", this.handleKeyDownRef);
                console.log("removed");
            }
            measure_distance_button.style = "";

            myToast.hide();
            // Delete the points and the distance when tool turned off
            tempArrayPoints = [];
            totalDistance = 0;

            console.log("ausschalten lines");

            if (handlerHeight) {
                console.log("handler height aktiv");
            } else {
                // Neues setzen der Funktion als Input Action
                viewer.screenSpaceEventHandler.setInputAction(this.getFeatureInfo(), Cesium.ScreenSpaceEventType.LEFT_CLICK);
            }

        } else {

            let modal_distance = new bootstrap.Modal(document.getElementById("modalMeasureLine"));

            let modalHeader = document.getElementById("ModalLabelMeasureLine");
            let div_body = document.getElementById("modalBodyMeasureLine");

            console.log("einschalten");

            if (handlerHeight) {
                modalHeader.innerText = "Achtung";
                div_body.innerText = "Es können nicht beide Messfunktionen gleichzeitig verwendet werden, schalten Sie eine aus!";

                // translateModal(modalHeader, div_body, undefined, undefined, undefined, handlerHeight);

            } else {

                modalHeader.innerText = "Information";
                div_body.innerText = "Sie können mit der linken Maustaste Punkte auf der Karte setzen. Mit einem Klick der rechten " +
                "Maustaste in der Karte können sie die Messung beenden. Mit der 'Esc' Taste löschen Sie alle Punkte";

                // translateModal(modalHeader, div_body, undefined, undefined, undefined);
            }

            modal_distance.show();

            // Der Click Handler wird zertört, damit keine Klicks in der Karte mehr als Attributtabelle auftauchen
            handlerKarteClick = handlerKarteClick && handlerKarteClick.destroy();

            measure_distance_button.style = "background-color: rgb(0, 255, 106);"
            handlerDistance = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

            handlerDistance.setInputAction(
                function () {

                    // Delete all points in the array and set distance to 0
                    tempArrayPoints = [];
                    totalDistance = 0;

                }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

            handlerDistance.setInputAction(
                (click) => {

                    let cartesian = viewer.scene.pickPosition(click.position);

                    if (Cesium.defined(cartesian)) {

                        tempArrayPoints.push(cartesian);

                        // Neues Array aus den letzten beiden Punkten wird erstellt
                        let array_coord = tempArrayPoints.slice(-2);

                        if (array_coord.length === 1) {

                            // Bild ist von https://fonts.google.com/icons?icon.query=location
                            viewer.entities.add({
                                name: "Polyline point",
                                position: array_coord[0],
                                description: "Line point from polyline",
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
                                id: 'distance_marker_' + markerID++
                            });

                            bodyToast.textContent = "Bitte wählen Sie noch einen Punkt, um die Messung zu starten.";

                            // translateToast(bodyToast, 0, 0);

                            // Wählen Sie das <small>-Element aus
                            const toastTime = document.querySelector('#toastTime');

                            // Aktualisieren Sie den Inhalt des <small>-Tags
                            toastTime.textContent = 0 + ' min ago';

                            myToast.show();

                            // Explicitly render a new frame
                            viewer.scene.requestRender();

                        } else {

                            viewer.entities.add({
                                name: "Measured polyline",
                                description: "Polyline withe the ID " + ++distanceID,
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
                                id: 'polyline_distance_' + distanceID
                            });

                            // Bild ist von https://fonts.google.com/icons?icon.query=location
                            viewer.entities.add({
                                name: "Polyline marker",
                                description: "Line point from polyline",
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
                                id: 'distance_marker_' + markerID++
                            });

                            // Explicitly render a new frame
                            viewer.scene.requestRender();

                            // Der Mittelpunkt wird aus den Beiden Punkten berechnet
                            let result = new Cesium.Cartesian3();
                            Cesium.Cartesian3.midpoint(array_coord[0], array_coord[1], result);

                            // Die Distanz wird aus den beiden Punkten berechnet
                            let distance = Cesium.Cartesian3.distance(array_coord[0], array_coord[1]);

                            totalDistance = totalDistance + distance;

                            // function to set time and the distances
                            this.setToastDistance(distance, totalDistance, bodyToast, myToast);

                        }

                        // console.log(viewer.entities.values);
                    }

                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            // Declare the anonyoums function which will be calle

            // Set the function reference variable to the function
            // handleKeyDownRef = this.handleKeyDown();

            this.handleKeyDownRef = (event) => {
                this.handleKeyDown(event);
            }

            // Add event listener using the function which is in the handleKeyDownRef reference
            document.addEventListener("keydown", this.handleKeyDownRef);

        }
    }

    handleKeyDown(event) {
        // call function
        this.handleKeyPress(event);
        // delete array with linepoints
        tempArrayPoints = [];
        // delete the total lenght
        totalDistance = 0;
    }

    setToastHeight(height, bodyToast, toast) {

        // translateToastHeight(bodyToast, height);

        bodyToast.textContent = "Die ellipsoidische Höhe (WGS84) des Punktes beträgt: " + height + " meter.";

        // Call function to set and start the update of the time in the toast
        let startTime = new Date();
        this.updateToastTime(startTime);

        toast.show();
    }

    setToastDistance(distance, total_distance, bodyToast, myToast) {

        if (distance > 1000 && total_distance > 1000) {
            // Wenn die Distanz und total distance größer als 1000 Meter ist, umrechnen in Kilometer
            bodyToast.innerText = "Distanz: " + (distance / 1000).toFixed(3) + " Kilometer \n Gesamtdistanz des Linienzugs: " + (total_distance / 1000).toFixed(3) + " Kilometer";
            // translateToast(bodyToast, distance, total_distance);
        } else if (total_distance > 1000) {
            // Wenn die total distance größer als 1000 Meter ist, umrechnen in Kilometer
            bodyToast.innerText = "Distanz: " + distance.toFixed(3) + " Meter \n Gesamtdistanz des Linienzugs: " + (total_distance / 1000).toFixed(3) + " Kilometer";
            // translateToast(bodyToast, distance, total_distance);
        } else {
            // Wenn die Distanz kleiner oder gleich 1000 Meter ist, in Metern belassen
            bodyToast.innerText = "Distanz: " + distance.toFixed(3) + " Meter \n Gesamtdistanz des Linienzugs: " + total_distance.toFixed(3) + " Meter";
            // translateToast(bodyToast, distance, total_distance);
        }

        // Call function to set and start the update of the time in the toast
        let startTime = new Date();
        this.updateToastTime(startTime);

        // show the toast
        myToast.show();
    }

    // Funktion zum Aktualisieren des Inhalts des <small>-Tags
    updateToastTime(startTime) {

        // delete intervall
        this.clearToastInterval();

        // Wählen Sie das <small>-Element aus
        const toastTime = document.querySelector('#toastTime');

        // Holen Sie sich die aktuelle Zeit und berechnen Sie die vergangene Zeit in Minuten
        const now = new Date();
        const minsAgo = Math.floor((now - startTime) / 60000);

        // Aktualisieren Sie den Inhalt des <small>-Tags
        toastTime.textContent = minsAgo + ' min ago';

        // Schedule the next update in one minute
        const intervalId = setInterval(() => {
            this.updateToastTime(startTime);
        }, 60000);

        // Store the interval ID on the toastTime element
        toastTime.dataset.intervalId = intervalId;
    }

    // Function to clear the interval of toast
    clearToastInterval() {
        const toastTime = document.querySelector('#toastTime');
        const intervalId = toastTime.dataset.intervalId;
        if (intervalId)
            clearInterval(intervalId);
    }

    getFeatureInfo() {

        let infoID = 0;

        // Leider war es nicht möglich über die Standardfunktionen den selection_indicator und die Infobox so auszuschalten
        // das nach einem Klick beim Messen auch keine Infobox mehr erscheint
        // Daher wurde eine neue Infobox erstellt, welche ordnungsgemäß funktioniert

        // inital wird die Input action entfernt, um die initalen Infofelder und den selector nicht zu verwenden
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // Neue Inputaction
        handlerKarteClick = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

        let infoboxcontainer = document.getElementsByClassName("cesium-viewer-infoBoxContainer")[0];
        // var selectionindicator_container = document.getElementsByClassName("cesium-viewer-selectionIndicatorContainer")[0];

        // Neue Infobox
        let infobox_karte = new Cesium.InfoBox(infoboxcontainer);

        // set eventlistner for close click on infobox
        infobox_karte.viewModel.closeClicked.addEventListener(() => {
            // close infobox
            this.closeInfoBox(infobox_karte);
        });

        // Neuer Selection Indicator
        // var selection_indicator = new Cesium.SelectionIndicator(selectionindicator_container, viewer.scene);

        // var selection_indicator_view = new Cesium.SelectionIndicatorViewModel(viewer.scene, selection_indicator, selectionindicator_container);

        handlerKarteClick.setInputAction(
            async (click) => {

                // Show blue marker on click on map
                this.ShowClickMarker(click);

                let table = document.createElement("table");
                //zum schöner machen die Class 
                table.className = "cesium-infoBox-defaultTable";

                let cartesian = viewer.scene.pickPosition(click.position);

                // Prüfen, ob bereits entitites der infomarker bestehen und falls ja löschen!
                // Add marker for better UX
                if (cartesian) {
                    let object = this.addMarkerClickInfo(cartesian, infoID);
                    infoID = object.infoID;
                }

                let loadingAnimation = loadingInfoTable(table);

                // add Longitude and Latitude once to the table for every click
                await this.addLongLattoTable(cartesian, table, click, infobox_karte);

                // Entities anklicken
                let picked_entity = viewer.scene.pick(click.position);

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

                        // console.log(typeof entity.label);
                        if (entity && typeof entity.id === 'string') {

                            if (entity.id.includes("geolocate_point_") || entity.id.includes("distance_marker_") ||
                                entity.id.includes("point_height_marker") || entity.id.includes("polyline_distance_") ||
                                entity.id.includes("searchadress_point_") || entity.id.includes("point_info_marker")) {

                                if (entity.position) {
                                    // Code to execute if the entity position is defined to place marker on entity 
                                    let positionEntity = entity.position.getValue(Cesium.JulianDate.now());

                                    let object = this.addMarkerClickInfo(positionEntity, infoID);
                                    infoID = object.infoID;
                                    let createdEntity = object.Entity;
                                    // based on the entity set height to show marker on top of the object
                                    if (entity.id.includes("geolocate_point_")) {
                                        // set the billboard marker on top of the entity object
                                        createdEntity.billboard.pixelOffset = new Cesium.Cartesian2(0, -45);
                                    } else if (entity.id.includes("searchadress_point_")) {
                                        // set the billboard marker on top of the entity object
                                        createdEntity.billboard.pixelOffset = new Cesium.Cartesian2(0, -30);
                                    }
                                    // set long and lat and other attrbibutes for clicked entity with an position
                                    table = await this.getFeaturesEntity(entity, table, infobox_karte);
                                } else {
                                    // for lines or polygons etc.
                                    table = await this.getFeaturesEntity(entity, table, infobox_karte);
                                }

                                infobox_karte.viewModel.description = table.outerHTML;

                            } else {

                                if (entity.position) {
                                    // Code to execute if the entity position is defined to place marker at entity
                                    // only if entity point or someting with an position 
                                    let positionEntity = entity.position.getValue(Cesium.JulianDate.now());
                                    let object = this.addMarkerClickInfo(positionEntity, infoID);
                                    infoID = object.infoID;
                                    let createdEntity = object.Entity;
                                    // set the billboard marker on top of the entity object
                                    createdEntity.billboard.pixelOffset = new Cesium.Cartesian2(0, -64);
                                }

                                // OSM Builings are entitites
                                // input string
                                let inputString = entity.description.getValue(Cesium.JulianDate.now());
                               
                                inputString = inputString.replaceAll('<th>', '<td>');
                                inputString = inputString.replaceAll('</th>', '</td>');

                                // // setzen des Tabellennamens
                                // infobox_karte.viewModel.titleText = translateInfoTableTitle();

                                // await translateInfoTable(inputString).then(function (newinputString) {
                                //     inputString = newinputString; 
                                // });

                                // Convert string to HTML document object
                                let parser = new DOMParser();
                                let doc = parser.parseFromString(inputString, 'text/html');

                                let tableRows = doc.querySelectorAll('tr');

                                for (let i = 0; i < tableRows.length; i++) {
                                    if (tableRows[i]) {
                                        // console.log(tableRows[i]);
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
                }

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

                    Promise.resolve(featuresPromise).then(async function (features) {

                        // This function is called asynchronously when the list if picked features is available.

                        if (features.length > 0) {

                            for (let element of features) {
                                // console.log(element.imageryLayer.imageryProvider._layers);

                                if (element.description && element.data.geometryType === "esriGeometryPolygon") {
                                    let count = Object.keys(element.properties).length;

                                    // input string
                                    let inputString = element.description;

                                    // // setzen des Tabellennamens
                                    // infobox_karte.viewModel.titleText = translateInfoTableTitle();

                                    // await translateInfoTable(inputString).then(function (newinputString) {
                                    //     inputString = newinputString;
                                    // });

                                    // console.log(inputString);

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

                                    // translateInfoTable(table.outerHTML, infobox_karte);

                                    // console.log(table.outerHTML);
                                    // Nur das erste Element aus der langen Liste soll angezeigt werden, daher break nach dem ersten Element
                                    break;

                                } else {

                                    // WMS Data
                                    // input string
                                    let inputString = element.description;

                                    // // setzen des Tabellennamens
                                    // infobox_karte.viewModel.titleText = translateInfoTableTitle();

                                    // await translateInfoTable(inputString).then(function (newinputString) {
                                    //     inputString = newinputString;
                                    // });

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

                                // translateInfoTable(table.outerHTML, infobox_karte);

                                // infobox_karte.viewModel.description = table.outerHTML;

                            }

                            // when all features are queryed, dont show the loading animation
                            loadingAnimation.row.style.display = "none";
                            // // loadingAnimation.row.classList.add("hide");
                            loadingAnimation.animation.style.display = "none";
                            // // loadingAnimation.animation.classList.add("hide");

                            // translateInfoTable(table.outerHTML);

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

            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    async getFeaturesEntity(entity, table, infoboxKarte) {

        let posEntity, cartographic, longitude, latitude, altitude, altitudeString;

        console.log(entity.description);

        if (entity.position) {
            posEntity = entity.position.getValue(Cesium.JulianDate.now());
            cartographic = Cesium.Cartographic.fromCartesian(posEntity);
            longitude = Cesium.Math.toDegrees(cartographic.longitude);
            latitude = Cesium.Math.toDegrees(cartographic.latitude);
            altitude = cartographic.height;
            altitudeString = Math.round(altitude).toString();

            // safe values from point in array
            let arr = ["Längengrad", longitude.toFixed(5) + " °", "Breitengrad", latitude.toFixed(5) + " °", "Höhe (WGS84)", altitudeString + " meter", "Beschreibung", entity.description];
            let counter = 1;

            // let result = arr.join(', ');

            // // setzen des Tabellennamens
            // infoboxKarte.viewModel.titleText = translateInfoTableTitle();

            // await translateArrayInput(result).then(function (arrayText) {
            //     arr = arrayText;
            // });

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

            let arr2 = ["Objekt", entity.name, "Beschreibung", entity.description];
            let counter = 1;

            // console.log(entity.name);

            // let result = arr2.join(', ');

            // // setzen des Tabellennamens
            // infoboxKarte.viewModel.titleText = translateInfoTableTitle();

            // await translateArrayInput(result).then(function (arrayText) {
            //     arr2 = arrayText;
            // });

            for (let i = 0; i < arr2.length; i += 2) {
                let tr = document.createElement('tr'); //Zeile
                let tD = document.createElement('td');
                let tD2 = document.createElement('td');
                tD.innerHTML = arr2[i];
                tD2.innerHTML = arr2[i + 1];

                tr.appendChild(tD);
                tr.appendChild(tD2);
                table.appendChild(tr);
                // table.replaceChild(tr, table.children[counter++]);
                // console.log(table.children[counter++]);
            }
        }

        return table;
    }

    async addLongLattoTable(cartesian, table, click, infoboxKarte) {

        if (cartesian) {

            let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            // let altitude = cartographic.height;
            // let altitudeWGS84 = viewer.scene.globe.getHeight(cartographic);
            // let altitudeString = Math.round(altitudeWGS84).toString();

            let altitudeString;

            // calc height of point on terrain due to cartographic.height negativ values
            await Cesium.sampleTerrain(viewer.terrainProvider, 13, [cartographic]).then(function (samples) {
                let heightTerrain = samples[0].height;
                altitudeString = Math.round(heightTerrain).toString();
            });

            let arr = ["Längengrad", longitude.toFixed(5) + " °", "Breitengrad", latitude.toFixed(5) + " °", "Höhe (WGS84)", altitudeString + " meter"];

            // let result = arr.join(', ');

            // // setzen des Tabellennamens
            // infoboxKarte.viewModel.titleText = translateInfoTableTitle();

            // await translateArrayInput(result).then(function (arrayText) {
            //     arr = arrayText;
            // });

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

            // setzen des Tabellennamens
            // infoboxKarte.viewModel.titleText = translateInfoTableTitle();

            if (!clickPosition) {
                // Add row no data selected
                let noDataRow = table.insertRow(0);

                noDataRow.innerText = "Keine Daten an diesen Punkt.";
            }

        }

        infoboxKarte.viewModel.titleText = "Abfrage";
    }

    closeInfoBox(infoBox) {

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

    addMarkerClickInfo(cartesian, info_id) {

        // let array_entities = [];
        // löschen der Werte aus dem Array!
        for (let teil of viewer.entities.values) {
            if (teil.id.includes("point_info_marker")) {
                // array_entities.push(teil);
                // console.log(teil.id);
                viewer.entities.remove(teil);
            }
        }

        // Zwischengespeicherte Entities in Array, um diese zu löschen. viewer.entities.values funktioniert nicht!!
        // for (let entity of array_entities) {
        //     console.log("info point removed");
        //     viewer.entities.remove(entity);
        // }

        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let longitude = Cesium.Math.toDegrees(cartographic.longitude);
        let latitude = Cesium.Math.toDegrees(cartographic.latitude);
        let altitude = cartographic.height;
        // let altitude = viewer.scene.globe.getHeight(cartographic);

        let entity = viewer.entities.add({
            name: "Point info marker",
            position: Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude),
            description: "Infomarker um Informationen abzurufen",
            billboard: {
                image: "./Icons/output-onlinejpgtools.jpg",
                //uri: "./glb/infopointGLB.glb",
                // scale: 25,
                //allowPicking: false,
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 4000.0),
                scaleByDistance: new Cesium.NearFarScalar(0, 1.0, 2000, 0.6),
                heightReference: Cesium.HeightReference.NONE,
                // Darstellung auch auf Gebäuden, auf clamptoground kann verzichtet werden
                // Damit das billboard nicht im boden versinkt, wird pixeloffset verwendet
                pixelOffset: new Cesium.Cartesian2(0, -20),
                disableDepthTestDistance: Number.POSITIVE_INFINITY // disable depth testing for the point
            },
            id: 'point_info_marker' + info_id++
        });

        // Explicitly render a new frame für info marker
        viewer.scene.requestRender();

        return { infoID: info_id, Entity: entity };
    }

    ShowClickMarker(click) {

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
        setTimeout(function () {
            if (clickAnimation)
                clickAnimation.parentNode.removeChild(clickAnimation);
        }, 850);
    }
}
