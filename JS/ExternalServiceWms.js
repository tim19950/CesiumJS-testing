import { startLoadingAnimationWMS, stopLoadingAnimationWMS } from "./loadAnimations.js";
import { markActiveSelectedLayers, StopCloseMenu, viewer } from "./javaScript.js";
import { translateModal, translateArrayInput } from './translate.js';

export default class ExternalServiceWms {

    addExternalServiceWms() {
        // blub

        let htmlcollectionLayer, contactOrganisation;
        let valueUrlWms;

        let alerts = document.getElementsByClassName("alert");

        let errorWMSRequest = document.getElementById("WMSError");
        
        let successWMSRequest = document.getElementById("success");

        let wmsURL = document.getElementById("wms-text");
        // delete url initial one time on onload of website
        wmsURL.value = "";

        document.getElementById("external_service").addEventListener('click', () => {
            var modalLoadService = new bootstrap.Modal(document.getElementById("modal_load_service"));
            modalLoadService.show();
            let optionListWMS = document.getElementById("datalistOptions");

            console.log(wmsURL.value);

            // check if wms list has children
            if (optionListWMS.children.length !== 0) {
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
            // popover();

            // Initial Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
            for (let alert of alerts) {
                alert.style.display = "none";
            }

        });

        document.getElementById("anfrage_button_wms").addEventListener('click', () => {
            // var value_name_wms = document.getElementById("wms-name").value;
            valueUrlWms = document.getElementById("wms-text").value;

            if (valueUrlWms == "") {

                // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
                for (let alert of alerts) {
                    alert.style.display = "none";
                }

                errorWMSRequest.style.display = "";
                errorWMSRequest.innerHTML = "<strong>Achtung!</strong>Geben Sie erst eine URL des WMS an!";

                // translateModal(undefined, undefined, undefined, noWMSURL, undefined);

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

                let xhttp = new XMLHttpRequest();

                // anhängen der requestparameter des WMS GetCapabilities requestes
                xhttp.open("GET", valueUrlWms + "?REQUEST=GetCapabilities&SERVICE=WMS");
                xhttp.send();

                xhttp.onload = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        // Typical action to be performed when the document is ready:
                        let response_text = xhttp.responseXML;

                        // console.log(response_text);

                        if (response_text) {

                            contactOrganisation = response_text.querySelector("ContactOrganization").textContent;

                            htmlcollectionLayer = response_text.getElementsByTagName("Layer");

                            let HTMLCollectionCRS = response_text.getElementsByTagName("CRS");

                            let WMSHasCRSWGS84 = false;

                            // check if there is the CRS84 supported by the WMS, otherwise not working
                            for (let CRSElement of HTMLCollectionCRS){
                                if (CRSElement.textContent === "CRS:84"){
                                    // console.log(CRSElement.textContent);
                                    WMSHasCRSWGS84 = true;
                                }
                            }

                            let parentNodeBoundingBox;
                            let parentNodehasBoundingBox = false;

                            // iterate over the layer tags
                            for (let element_layer of htmlcollectionLayer) {

                                let hasLayerName = false;
                                let hasTitle = false;
                                let hasBoundingBox = false;
                                let layerTitle, layerName, layerAbstract, layerLegendURL, layerBoundingBox;

                                // safe the boundingBox from the parents element
                                for (let child of element_layer.children) {
                                    if (child.nodeName === "EX_GeographicBoundingBox" && !parentNodehasBoundingBox) {
                                        parentNodeBoundingBox = child.children[0].textContent + "\n" + child.children[1].textContent + "\n" + child.children[2].textContent + "\n" + child.children[3].textContent;
                                        // console.log(parentNodeBoundingBox);
                                        parentNodehasBoundingBox = true;
                                    }
                                }
                                
                                // iterate over the children from every layer tag
                                // set the title, name etc. for every layer later to the options list
                                for (let child of element_layer.children) {
                                    const { nodeName, textContent } = child;
                                    switch (nodeName) {
                                        case "Name":
                                            hasLayerName = true;
                                            layerName = textContent;
                                            break;
                                        case "Title":
                                            hasTitle = true;
                                            layerTitle = textContent;
                                            break;
                                        case "EX_GeographicBoundingBox":
                                            // layerBoudingBox = textContent;
                                            layerBoundingBox = child.children[0].textContent + "\n" + child.children[1].textContent + "\n" + child.children[2].textContent + "\n" + child.children[3].textContent;
                                            hasBoundingBox = true;
                                            break;
                                        case "Abstract":
                                            layerAbstract = textContent;
                                            break;
                                        case "Style":
                                            const xlingAttribut = child.querySelector("OnlineResource").getAttribute("xlink:href");
                                            if (xlingAttribut) {
                                                layerLegendURL = xlingAttribut;
                                            }
                                            break;
                                    }
                                }

                                // console.log(layerBoudingBox);
                                // console.log(hasBoundingBox);

                                // if the layer tag in the xml has a layername an title tag and an boundingbox
                                // then add an option element to the list of options
                                if (hasLayerName && hasTitle && WMSHasCRSWGS84 && (hasBoundingBox || parentNodehasBoundingBox)) {
                                    // console.log(layerBoudingBox);
                                    let option = document.createElement("option");
                                    
                                    if (layerTitle) {
                                        option.value = layerTitle;
                                    } else {
                                        console.log(element_layer.querySelector("Name"));
                                        // if the title element is empty for the layer, then use the Name as title of the layer tag 
                                        const NameElement = element_layer.querySelector("Name");

                                        if (NameElement) {
                                            option.value = NameElement.textContent;
                                        }
                                    }
                                    // set dataset attributes for eyers layer in the list
                                    option.setAttribute("data-LayersWms", layerName);
                                    option.setAttribute("data-LayersWmsAbstract", layerAbstract);
                                    // check if layer boundingbox is defined, otherwise use parents one
                                    if(hasBoundingBox){
                                        option.setAttribute("data-LayersWmsGeographicBoundingBox", layerBoundingBox);
                                    } else {
                                        option.setAttribute("data-LayersWmsGeographicBoundingBox", parentNodeBoundingBox);
                                    }

                                    // Check if the href doesn't start with "http://" or "https://"
                                    // then it must be a relative link
                                    if (layerLegendURL && !layerLegendURL.startsWith("http://") && !layerLegendURL.startsWith("https://")) {
                                        // Add your desired string in front of the href
                                        // const queryString = layerLegendURL.split('?')[1];
                                        // console.log(queryString);
                                        layerLegendURL = valueUrlWms + "?" + layerLegendURL;
                                        console.log(layerLegendURL);
                                    }
                                    option.setAttribute("data-LayersWmsLengendURL", layerLegendURL);
                                    document.getElementById("datalistOptions").appendChild(option);
                                }

                            }

                            // check if the WMS dont has the WGS84, then give an info to user
                            if (!WMSHasCRSWGS84) {
                                // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
                                for (let alert of alerts) {
                                    alert.style.display = "none";
                                }

                                errorWMSRequest.style.display = "";
                                errorWMSRequest.innerHTML = "<strong>Achtung!</strong>Der WMS unterstützt kein WGS84, daher kann dieser nicht visualisiert werden.";
                            } else {

                                // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
                                for (let alert of alerts) {
                                    alert.style.display = "none";
                                }

                                successWMSRequest.style.display = "";
                                successWMSRequest.innerHTML = "Die Abfrage der Layer des WMS war erfolgreich.";
                            // translateModal(undefined, undefined, undefined, success, undefined);
                            }

                        } else {

                            // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
                            for (let alert of alerts) {
                                alert.style.display = "none";
                            }

                            errorWMSRequest.style.display = "";
                            errorWMSRequest.innerHTML = "<strong>Achtung!</strong>Keine URL erkannt, bitte nochmal versuchen.";
                            // translateModal(undefined, undefined, undefined, noWMSURLreco, undefined);

                        }

                    } else {
                        console.log(this.status);

                        // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
                        for (let alert of alerts) {
                            alert.style.display = "none";
                        }

                        errorWMSRequest.style.display = "";
                        errorWMSRequest.innerHTML = "<strong>Achtung!</strong>Fehler in dem Request, bitte nochmal versuchen.";
                        // translateModal(undefined, undefined, undefined, errorRequest, undefined);

                    }

                    // stop the loading animation for all cases onload
                    stopLoadingAnimationWMS();
                };
                // Force the response to be parsed as XML
                xhttp.overrideMimeType('text/xml');

                // Bei Fehler, only triggers if the request couldn't be made at all
                xhttp.onerror = function () {

                    // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
                    for (let alert of alerts) {
                        alert.style.display = "none";
                    }

                    errorWMSRequest.style.display = "";
                    errorWMSRequest.innerHTML = "<strong>Achtung!</strong> Request konnte nicht abgesetzt werden, bitte nochmal versuchen.";

                    // translateModal(undefined, undefined, undefined, noRequestSend, undefined);
                    // stop the loading animation for onerror
                    stopLoadingAnimationWMS();
                };
            }

        });

        document.getElementById("ok_button_wms").addEventListener('click', () => {
            let layer_title = document.getElementById("exampleDataList").value;
            console.log(layer_title);

            let value_name_wms, abstractWMS, wmsLegendURL, wmsLayerBoundingBox;
            let okbtn = document.getElementById("ok_button_wms");

            // when no layer in the collection and try add layer to menu
            if (!htmlcollectionLayer) {

                // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
                for (let alert of alerts) {
                    alert.style.display = "none";
                }

                // when the attribute can be found it will be set not to close the modal to show error message
                if (okbtn.getAttribute("data-dismiss")) {
                    okbtn.setAttribute("data-dismiss", "");
                }

                errorWMSRequest.style.display = "";
                errorWMSRequest.innerHTML = "<strong>Achtung!</strong>Bitte zuerst den WMS anfragen und dann auf 'Zum Menü hinzufügen' klicken.";

                // translateModal(undefined, undefined, undefined, noWMSQueryed, undefined);

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
                errorWMSRequest.style.display = "";
                errorWMSRequest.innerHTML = "<strong>Achtung!</strong>Bitte zuerst den WMS auswählen und dann auf 'Zum Menü hinzufügen' klicken.";
                // success.style.display = "none";
                // translateModal(undefined, undefined, undefined, noWMSSelected, undefined);

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
                        wmsLegendURL = option.dataset.layerswmslengendurl;
                        wmsLayerBoundingBox = option.dataset.layerswmsgeographicboundingbox;
                    }
                }

                // check if there are existing WMS Layers compared with the new adding ones
                let bool = this.checkForDublicateWMSLayer(titleWMS, errorWMSRequest, okbtn);

                // only execute adding WMS Layer if the WMS is not found in the menu
                if (!bool) {
                    // when the layer was added, close modal
                    okbtn.setAttribute("data-dismiss", "modal");

                    this.addWMSLayer(value_name_wms, valueUrlWms, layer_title, abstractWMS, wmsLegendURL, contactOrganisation, wmsLayerBoundingBox);
                }
                // when the layer was added, close modal
                // okbtn.setAttribute("data-dismiss", "modal");

            }
        });

    }

    checkForDublicateWMSLayer(WMSTitle, alertWMSexists, okButtom) {

        let section4Layers = document.getElementById("section_4").children;

        let boolTest = false;

        for (let i = 0; i < section4Layers.length; i++) {
            let layer = section4Layers[i];
            let layertitle = layer.dataset.layertitle;

            if (layertitle === WMSTitle) {

                alertWMSexists.style.display = "";
                alertWMSexists.innerHTML = "<strong>Achtung!</strong>Der ausgewählte WMS ist bereits in dem Layermenu vorhaden.";
                // translateModal(undefined, undefined, undefined, alertWMSexists, undefined, undefined);
                console.log("WMS vorhaden in menu");
                okButtom.setAttribute("data-dismiss", "");
                boolTest = true;
            }

            // for (let j = 0; j < fileInput.files.length; j++) {
            //     let file = fileInput.files[j];

            //     if (layerFile === file.name) {
            //         console.log(`The dataset attribute filelayergeojson of layer ${i + 1} matches file ${j + 1} in the fileInput`);
            //         alertGeoJSONExistsAlready.style.display = "";
            //         translate(undefined, undefined, undefined, alertGeoJSONExistsAlready, undefined, undefined);
            //         // console.log("file.name === file.name");
            //         addGeojsonBtn.setAttribute("data-dismiss", "");
            //         boolTest = true;

            //     } else {
            //         // addGeojsonBtn.setAttribute("data-dismiss", "modal");
            //         // boolTest = false;

            //     }
            // }
        }

        return boolTest;

    }

    async fetchWMSLegend(wmslegendURL, layerLegendText) {

        // Create a <details> element and set its summary text
        const wmsLegendDetails = document.createElement("details");
        const wmsLegendDetailsSummary = document.createElement("summary");
        
        wmsLegendDetailsSummary.innerText = layerLegendText;
        wmsLegendDetails.className = "dropdown-item layermenu WMSLegend-details";
        wmsLegendDetails.setAttribute("data-LayersWmsLegend", "WMS Legend");

        // create an a tag for link of wmslegendURL
        const aTag = document.createElement("a");
        aTag.href = wmslegendURL;
        aTag.target = "_blank";

        // Create an <img> element and fetch the image URL
        const imgTag = document.createElement("img");
        fetch(wmslegendURL)
            .then(response => response.blob())
            .then(imageBlob => {
                const imageUrl = URL.createObjectURL(imageBlob);
                imgTag.src = imageUrl;
                imgTag.className = "WMSLegend-img";
                // imgTag.setAttribute("data-LayersWmsLegendURL", imageUrl);
            })
            .catch(error => {
                console.error('Error fetching image:', error);
            });

        // Add the <img> element to the <details> element
        wmsLegendDetails.appendChild(wmsLegendDetailsSummary);
        aTag.appendChild(imgTag);
        wmsLegendDetails.appendChild(aTag);

        // Add the <details> element to the document
        const section_4 = document.getElementById("section_4");
        section_4.appendChild(wmsLegendDetails);

        // displayImage();
    }

    async addWMSLayer(value_name_wms, value_url_wms, layer_title, abstract, wmslegendURL, contactOrganisation, boundingbox) {

        let section_4 = document.getElementById("section_4");
        section_4.style.display = "block";

        let section4Text = document.getElementById("section_4_text");
        section4Text.style.display = "inline-block";

        // translate the layer title and the abstract for the layermenu depending on the choosen language
        // let arr = [layer_title, abstract];
        // let result = arr.join(', ');

        // await translateArrayInput(result).then(function (arrayText) {
        //     arr = arrayText;
        // });

        // layer_title = arr[0];
        // console.log(layer_title);
        // abstract = arr[1];

        // Create the new <a> tag element
        const newLink = document.createElement("a");

        // Set the attributes for the new <a> tag
        newLink.className = "dropdown-item layermenu";
        newLink.title = abstract;
        newLink.setAttribute("data-urlWms", value_url_wms);
        newLink.setAttribute("data-LayersWms", value_name_wms);
        newLink.setAttribute("data-layerTitle", layer_title);
        newLink.setAttribute("data-contactOrganisation", contactOrganisation);
        newLink.setAttribute("data-Boundingbox", boundingbox);
        // Create the <img> and <span> tags to go inside the <a> tag
        let newImg = document.createElement("img");
        newImg.className = "img_layers";
        newImg.setAttribute("src", "https://tim19950.github.io/CesiumJS-testing/Icons/WMS.png")
        // newImg.src = "https://tim19950.github.io/CesiumJS-testing//Icons/WMS.png";

        const newSpan = document.createElement("span");
        newSpan.className = "title";
        newSpan.textContent = layer_title;

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

        let container = document.createElement("div");
        container.classList.add("slider-container");
       
        // Create a label element
        const opacityLabelSlider = document.createElement("label");
        opacityLabelSlider.className = "slider-label";
        opacityLabelSlider.htmlFor = "sliderWMSLayer";
        // opacityLabelSlider.textContent = "Sichtbarkeit: " + opacitySlider.value * 100 + "%";

        // Create the opacity slider
        const opacitySlider = document.createElement("input");
        opacitySlider.className = "wms-slider";
        opacitySlider.id = "sliderLayer" + ID;
        opacitySlider.name = "sliderWMSLayer";
        opacitySlider.type = "range";
        opacitySlider.min = 0;
        opacitySlider.max = 1;
        opacitySlider.step = 0.01;
        opacitySlider.value = 0.7; // Initial opacity value

        // Set initial opacity value
        newLink.setAttribute("data-opacityLayer", opacitySlider.value);

        let textLabel = "Sichtbarkeit: " + (opacitySlider.value * 100).toFixed(0) + "%";

        // translate legendstrings first word
        // second word title layer already translated
        // let array = ["Legende ", textLabel];
        // let resultarr = array.join(', ');

        // await translateArrayInput(resultarr).then(function (arrayText) {
        //     array = arrayText;
        // });

        // let LegendString = array[0] + layer_title;
        let LegendString = "Legende " + layer_title;

        opacityLabelSlider.textContent = textLabel;

        // Add the label before the slider
        container.appendChild(opacityLabelSlider);

        // Add the opacity slider to the <a> tag
        container.appendChild(opacitySlider);

        newLink.appendChild(container);

        // Add the new <a> tag to the <div> element with ID "section_4"
        section_4.appendChild(newLink);

        this.fetchWMSLegend(wmslegendURL, LegendString);

        // const layermenu = document.getElementById("layermenue_dropdown");
        // layermenu.appendChild(newDIVText);
        // layermenu.appendChild(newDIVSection);
        markActiveSelectedLayers();
        StopCloseMenu();
    }

    handleExternalServices(node, value_name_wms, value_url_wms) {

        let imageryLayer, opacitySlider, SliderLabel;

        // Create WMSImageryProvider
        let wms_provider = new Cesium.WebMapServiceImageryProvider({
            url: value_url_wms,
            layers: value_name_wms,
            credit: "WMS Data provided by " + node.dataset.contactorganisation.toString(),
            parameters: {
                format: 'image/png',
                transparent: true
            }
        });

        if (node) {
            node.children[0].addEventListener("click", function (event) {

                // Even though the wms_provider variable is overwritten each time handleExternalServices() is called for a different node, the event listener 
                // function that was created for a particular node still has access to the wms_provider variable that was created when handleExternalServices() was called for that node, 
                // because of how JavaScript's function scoping works.
                // Jede node hat durch die innere funktion die Varialbe wms_provider im scope, auf das sie zugreifen kann
                // When the event listener function is created, it "closes over" the wms_provider variable in the scope where it was defined
                // When a function is created, it forms a closure, which contains the function itself and any variables that were in scope at the time of creation. These variables are still accessible to the function even if they are no longer in scope outside of the closure.

                // When the node has the active class, the referencing wms_prover for the node gets added
                if (event.target.classList.contains('active')) {

                    // create coordinates from string
                    let coordinates = node.dataset.boundingbox.trim().split('\n').map(parseFloat);

                    // Create the rectangle
                    const rectangle = Cesium.Rectangle.fromDegrees(
                        coordinates[0], // west
                        coordinates[2], // south
                        coordinates[1], // east
                        coordinates[3]  // north
                    );

                    imageryLayer = new Cesium.ImageryLayer(wms_provider, {
                        alpha: node.dataset.opacitylayer
                    });
                    viewer.imageryLayers.add(imageryLayer);

                    viewer.camera.flyTo({
                        destination: rectangle
                    });

                    opacitySlider = node.children[2].children.namedItem("sliderWMSLayer");

                    opacitySlider.classList.add("show");

                    SliderLabel = node.children[2].children[0];

                    SliderLabel.classList.add("show");
                    
                    // Add an event listener to handle changes in the slider value
                    opacitySlider.addEventListener("input", function () {
                        // set opacity of layer
                        imageryLayer.alpha = opacitySlider.value;
                        // set opacity of the data attribute to load layer with that value when clicked again
                        node.setAttribute("data-opacityLayer", opacitySlider.value);
                        // explicitly render a new frame
                        viewer.scene.requestRender();
                        // let array = ["Sichtbarkeit: "];
                        // let resultarr = array.join(', ');

                        // translateArrayInput(resultarr).then(function (arrayText) {
                        //     // array = arrayText;
                        //     // set the textContent
                        //     SliderLabel.textContent = arrayText[0] + (opacitySlider.value * 100).toFixed(0) + "%";
                        // });

                        // set the textContent
                        SliderLabel.textContent = "Sichtbarkeit: " + (opacitySlider.value * 100).toFixed(0) + "%";
                       
                    });

                    // imageryLayer = viewer.imageryLayers.addImageryProvider(wms_provider);
                    // viewer.imageryLayers.add(esriLayer);
                    console.log("initial added WMS");
                } else {
                    // when the node dont has activ class the wms gets removed
                    viewer.imageryLayers.remove(imageryLayer);
                    console.log("WMS contains already. The WMS layer gets deleted.");

                    opacitySlider.classList.remove("show");
                    SliderLabel.classList.remove("show");
                }
            });
        }
    }

}