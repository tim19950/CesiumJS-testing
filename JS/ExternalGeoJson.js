import { loadAnimationGeoJSON, stopLoadAnimationGeoJSON } from './loadAnimations.js';
import { markActiveSelectedLayers, StopCloseMenu, viewer } from "./javaScript.js";
import { translateModal, translateArrayInput } from './translate.js';

let globalList = [];

export default class ExternalGeoJson {

    addExternalGeoJson() {

        // Observer einmal aufrufen reicht, da ansonsten zweimal aufgerufen
        // MutationObserverDOM();
        // bla

        const fileSelect = document.getElementById("locale_data_button");

        let fileModal = new bootstrap.Modal(document.getElementById("fileModal"));
        // let modalAddLayermenu = new bootstrap.Modal(document.getElementById("modal"));

        let alertnoGeoJSON = document.getElementById("noGeoJSONSelected");
        let alertGeoJSONExistsAlready = document.getElementById("GeoJSONExistsAlready");
        let addGeojsonBtn = document.getElementById("addGeoJsonMenu");

        fileSelect.addEventListener("click", function () {

            // Initial Alertmeldung nicht sichtbar stellen
            alertnoGeoJSON.style.display = "none";
            alertGeoJSONExistsAlready.style.display = "none";

            document.getElementsByClassName("custom-file-label")[0].innerText = "Keine Datei...";
            // let label = document.getElementsByClassName("custom-file-label")[0];

            // translateModal(undefined, undefined, undefined, undefined, undefined, undefined, label);

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
            let fileName = Array.from(fileInput.files).map(file => file.name).join(', ');
            label.innerText = fileName;
        });

        document.getElementById("addGeoJsonMenu").addEventListener("click", async () => {
            let fileInput = document.getElementById("fileInput");

            // console.log(fileInput.files);
            if (fileInput.files.length === 0) {
                alertnoGeoJSON.style.display = "";
                addGeojsonBtn.setAttribute("data-dismiss", "");

                alertnoGeoJSON.innerHTML = "<strong>Achtung!</strong> Wählen Sie erst eine Datei aus";
                // translateModal(undefined, undefined, undefined, alertnoGeoJSON, undefined, undefined);

            } else {

                // Update the original fileList with the updatedFiles array
                // let fileList = await this.translateFileList(fileInput);

                let fileList = fileInput.files;

                // check if there are existing GeoJSON Layers compared with the new adding ones
                let bool = this.checkForDublicateGeoJSonMenu(fileList, alertGeoJSONExistsAlready, addGeojsonBtn, alertnoGeoJSON, fileModal);

                // only execute adding GeoJSON Layer if the GeoJSON is not found in the menu
                if (!bool) {
                    // addGeojsonBtn.setAttribute("data-dismiss", "");
                    // Close the modal
                    fileModal.hide();

                    for (let element of this.handleFiles(fileList)) {
                        // only if no element selected found in the globallist, push into globallist
                        // so the GeoJson is not rendered twice, only once
                        // global list is used for load the layers when clicked
                        if (!globalList.find(file => file.name === element.name)) {
                            globalList.push(element);
                            console.log(globalList)
                        }
                    }
                }

            }
        });
    }

    async translateFileList(fileInput) {

        let fileList = fileInput.files; /* now you can work with the file list */
        let updatedFiles = []; // Create a new array to store the updated files

        for (let i = 0; i < fileList.length; i++) {
            let file = fileList[i];
            let arr = [file.name];

            let result = arr.join(', ');

            await translateArrayInput(result).then(function (arrayText) {
                arr = arrayText;
                // console.log(arr);
            });

            let translatedFileName = arr[0];
            // console.log(translatedFileName);
            let updatedFile = new File([file], translatedFileName);
            // console.log(updatedFile);
            updatedFiles.push(updatedFile); // Add the updated file to the new array
        }

        fileList = updatedFiles; // Update the original fileList with the updatedFiles array
        return fileList;
    }

    // Daten der Datei einlesen
    handleFiles(fileList) {

        // let fileList = fileElem.files; /* now you can work with the file list */

        // loadAnimationGeoJSON();

        for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
            let file = fileList[i];
            // console.log(file.name);

            let array = file.name.split(".");

            let nameGeoJSon = array[0];
            // console.log(nameGeoJSon);

            // Check if the file is an geojson, otherwise get Info
            if (file.type && !file.type.startsWith('application/geo')) {
                console.log('File is not an GeoJSON.', file.type, file);

                // let errorNoGeoJsonalert = document.getElementById("noGeoJSON");

                // errorNoGeoJsonalert.innerHTML = "<strong>Achtung!</strong>Die Daten, welche Sie hinzufügen möchten, sind keine GeoJSON Dateien. Bitte laden Sie nur GeoJSON.";

                let modal = new bootstrap.Modal(document.getElementById("modal"));
                let modalHeader = document.getElementById("ModalLabel");
                modalHeader.innerText = "Achtung";

                let modalBody = document.getElementById("modalBody");
                modalBody.innerText = "Die Daten, welche Sie hinzufügen möchten, sind keine GeoJSON Dateien. Bitte laden Sie nur GeoJSON.";

                // translateModal(modalHeader, modalBody, undefined, undefined);

                modal.show();

            } else {

                // GeoJSON validation
                // Die Datei wird über einen Reader eingelesen und der Szene hinzugefügt
                // this.FileListener = () => {
                //     this.cameraChangedListener();
                // };
                // viewer.camera.changed.addEventListener(this.FileListener);
                const reader = new FileReader();
                reader.readAsBinaryString(file);
                reader.addEventListener('load', (event) => {

                    let errors = geojsonhint.hint(event.target.result);

                    if (errors.length === 0) {

                        // console.log("add geojonsLayer");
                        this.addLayerGeoJson(nameGeoJSon, file);

                    } else {

                        let my_modal = new bootstrap.Modal(document.getElementById("modal"));
                        let modalBody = document.getElementById("modalBody");
                        let modalHeader = document.getElementById("ModalLabel");
                        let innertext = JSON.stringify(errors);
                        innertext = innertext.replace("[{", "");
                        innertext = innertext.replace("}]", "");
                        innertext = innertext.replace(/},{/gm, "");

                        modalBody.innerText = "Das GeoJSON, welches Sie hinzufügen wollen, besitzt Fehler: " + innertext;

                        // translateModal(modalHeader, modalBody, innertext);

                        my_modal.show();
                        // stopLoadAnimationGeoJSON();
                    }

                });
            }
        }

        return fileList;
    }

    checkForDublicateGeoJSonMenu(fileList, alertGeoJSONExistsAlready, addGeojsonBtn, alertnoGeoJSON, fileModal) {
        let section4Layers = document.getElementById("section_4").children;

        let boolTest = false;

        for (let i = 0; i < section4Layers.length; i++) {
            let layer = section4Layers[i];
            let layerFile = layer.dataset.filelayergeojson;

            for (let j = 0; j < fileList.length; j++) {
                let file = fileList[j];

                console.log(file.name);
                console.log(layerFile);

                if (layerFile === file.name) {
                    console.log(`The dataset attribute filelayergeojson of layer ${i + 1} matches file ${j + 1} in the fileInput`);
                    alertGeoJSONExistsAlready.style.display = "";
                    alertGeoJSONExistsAlready.innerHTML = "<strong>Achtung!</strong> Eine oder meherer ausgewählte Dateien existieren bereits im Menü";
                    // translateModal(undefined, undefined, undefined, alertGeoJSONExistsAlready, undefined, undefined);
                    // console.log("file.name === file.name");
                    // addGeojsonBtn.setAttribute("data-dismiss", "");
                    // fileModal.show();
                    boolTest = true;
                    // set alertno GeoJson to display none
                    alertnoGeoJSON.style.display = "none";
                } else {
                    // addGeojsonBtn.setAttribute("data-dismiss", "modal");
                    // boolTest = false;
                    console.log("nope");

                }
            }
        }

        return boolTest;
    }

    async addLayerGeoJson(nameGeoJSon, file) {

        let section_4 = document.getElementById("section_4");
        section_4.style.display = "block";

        let section4Text = document.getElementById("section_4_text");
        section4Text.style.display = "inline-block";

        // let arr = [nameGeoJSon, file.name];

        // let result = arr.join(', ');

        // await translateArrayInput(result).then(function (arrayText) {
        //     arr = arrayText;
        // });

        // nameGeoJSon = arr[0];
        // let fileName = arr[1];

        // Create the new <a> tag element
        const newLink = document.createElement("a");

        // Set the attributes for the new <a> tag
        newLink.className = "dropdown-item layermenu";
        newLink.title = file.name;
        newLink.setAttribute("data-fileLayerGeoJson", file.name);

        // newLink.setAttribute("data-fileGeojson", file);
        newLink.setAttribute("data-LayersGeoJson", nameGeoJSon);
        // newLink.setAttribute("data-layerTitle", layer_title);

        // Create the <img> and <span> tags to go inside the <a> tag
        const newImg = document.createElement("img");
        newImg.className = "img_layers"; 
        newImg.setAttribute("src", "https://tim19950.github.io/CesiumJS-testing/Icons/GeoJSON.png")
        // newImg.src = "https://tim19950.github.io/CesiumJS-testing/Icons/GeoJSON.png";

        const newSpan = document.createElement("span");
        newSpan.className = "title";
        newSpan.textContent = nameGeoJSon;

        // Loop through the number of sections and create the section names
        // Create numbers from 6 up to 20 for external ID of WMS and set iterated ID to img ID

        //get number ID from last layer element
        let layerItemsElements = document.querySelectorAll("[id^='layer_item']");

        let layerItemsElement = layerItemsElements[layerItemsElements.length - 1];

        let oldcount = layerItemsElement.id[layerItemsElement.id.length - 1];

        let ID = oldcount;

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
        modalBody.innerText = "Ihre GeoJSON daten sind dem Menü als Layer hinzugefügt worden.";

        // translateModal(modalHeader, modalBody, null, undefined, null);

        // only show one modal at a time
        if (!document.getElementById("modal").classList.contains("show")) {
            // The modal is not currently being displayed, so show it
            modalAddLayermenu.show();
        }

        markActiveSelectedLayers();
        StopCloseMenu();

        // return fileName;
    }

    handleExternalGeoJson(node) {

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
            node.children[0].addEventListener("click", function (event) {
                if (event.target.classList.contains('active')) {

                    addGeoJSONLayerMap(node.dataset.filelayergeojson);

                } else {

                    viewer.dataSources.remove(geoJSONdataSource);

                    // Explicitly render a new frame
                    viewer.scene.requestRender();

                }

            });

        }

        // Daten der Datei einlesen
        function addGeoJSONLayerMap(layerGeoJSONName) {

            // start loading animation each time
            loadAnimationGeoJSON();

            for (let i = 0, numFiles = globalList.length; i < numFiles; i++) {
                const file = globalList[i];

                // GeoJSON validation
                // Die Datei wird über einen Reader eingelesen und der Szene hinzugefügt
                const reader = new FileReader();
                reader.addEventListener('load', (event) => {

                    // Extract the credit property from the feature collection
                    const creditText = JSON.parse(event.target.result).features[0].properties.credit;

                    let promise = Cesium.GeoJsonDataSource.load(JSON.parse(event.target.result), {
                        clampToGround: true,
                        markerSymbol: '?',
                        credit: creditText
                    });

                    promise
                        .then(function (dataSource) {

                            // set the name of the datasource to remove when delete all
                            dataSource.name = layerGeoJSONName;
                            // set to remove when clicked again on img
                            geoJSONdataSource = dataSource;

                            dataSource.entities.values.forEach(function (entity) {
                                // Generate a unique ID for each entity
                                let entityId = Cesium.createGuid();
                                entity.properties = {
                                    id: entityId
                                };
                            });

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
                    promiseBoolean.then(function (Message) {
                        // when true stop animation
                        console.log(Message);
                        if (Message) {
                            stopLoadAnimationGeoJSON();
                        }

                    });

                });

                // When the layerGeoJSONName of the clicked img tag is the same as in the filelist then read data of file 
                if (file.name === layerGeoJSONName) {
                    reader.readAsBinaryString(file);
                }
            }
        }
    }

    // Method to empty the globalList array
    clearGlobalList() {
        globalList.length = 0;
        // globalList = [];
    }

}