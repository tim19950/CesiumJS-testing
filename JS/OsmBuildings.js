import { translateModal } from "./translate.js";
import { viewer } from './javaScript.js';

let cartesian_array = [];
let globalArray = [];

export default class OsmBuildings {

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

                    // translate the modal
                    translateModal(modalHeader, modalBody, undefined, undefined, buttonOK);

                    modal.show();
                } else {
                    console.log("ShowBuildings");
                    this.ShowBuildings();
                }
            } else {
                console.log("DontShowBuildings");
                this.DontShowBuildings();

            }
        });
    }

    /*
        Function: DontShowBuildings
        Description: Removes the buildings data sources from the viewer, clears related arrays, and removes the cameraChangedListener.
        Input Parameters: None
        Returns: None
    */
    DontShowBuildings() {
        viewer.camera.changed.removeEventListener(() => this.cameraChangedListener());

        for (let i = 0; i < viewer.dataSources.length; i++) {
            let datasource = viewer.dataSources.get(i);
            if (datasource.name && datasource.name.startsWith("Buildings") && datasource.show === true) {
                for (let datasource of globalArray) {
                    viewer.dataSources.remove(datasource);
                }
                globalArray = [];
                cartesian_array = [];
            }
        }
        viewer.scene.requestRender();
        console.log('Camera listener removed!');
    }

    /*
        Function: ShowBuildings
        Description: Displays the buildings data sources on the viewer and adds the cameraChangedListener.
        Input Parameters: None
        Returns: None
    */
    ShowBuildings() {
        viewer.scene.requestRender();
        viewer.camera.percentageChanged = 1;
        viewer.camera.changed.addEventListener(() => this.cameraChangedListener());
        console.log("Buildings einschalten");
    }

    cameraChangedListener() {
        // console.log('Camera changed!');

        // Call the fetchURL function to add geodata
        this.fetchURL();
    }

    // GeoJSON Buildings OSM

    // var height, promise_geojson, tilexy, vergleich;
    // var cartesian_array = [];

    // var webmercatortiling = new Cesium.WebMercatorTilingScheme();

    // Die Funktion fetchURL wird jede Sekunde aufgerufen
    // setInterval(fetchURL, 1000);
    // setInterval(check_height, 1000);

    // Funktion zum fetchen der URL der OSM Gebäudedaten
    // Führt außerdem das rendern der empfangenen Daten durch
    fetchURL() {

        let promise_geojson, tilexy, vergleich, addedpromise;

        let webmercatortiling = new Cesium.WebMercatorTilingScheme();

        // Höhe abfragen
        let height = viewer.camera.positionCartographic.height * (0.001).toFixed(1);
        // Kachelschema erzeugen für Level 15 aus der Position der Kamera
        let cartesian = new Cesium.Cartesian2();
        tilexy = webmercatortiling.positionToTileXY(
            viewer.camera.positionCartographic,
            15,
            cartesian
        );

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
                .then(function (dataSource) {

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

                            //  Extrude the polygon based on the height attribute
                            //  height - damit die gebäude im gelände nicht schweben
                            entity.polygon.height = -5;

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
    }


}