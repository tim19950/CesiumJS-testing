import { startLoadingAnimationWMS, stopLoadingAnimationWMS } from "./loadAnimations.js";
import { markActiveSelectedLayers, StopCloseMenu, viewer } from "./javaScript.js";
import { translateModal, translateArrayInput } from './translate.js';

export default class ExternalServiceWms {

    addExternalServiceWms() {

        let htmlcollection_layer, contactOrganisation;
        let value_url_wms;

        let alerts = document.getElementsByClassName("alert");

        let noWMSURL = document.getElementById("noWMSURL");
        let noWMSURLreco = document.getElementById("noURLRecognised");
        let errorRequest = document.getElementById("errorRequest");
        let noRequestSend = document.getElementById("noRequestSend");
        let noWMSSelected = document.getElementById("noWMSelected");
        let noWMSQueryed = document.getElementById("noWMSQueryed");
        let WMSexistsMenu = document.getElementById("WMSExistsMenu");
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
            // popover();

            // Initial Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
            for (let alert of alerts) {
                alert.style.display = "none";
            }

        });

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

                translateModal(undefined, undefined, undefined, noWMSURL, undefined);

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
                xhttp.open("GET", value_url_wms + "?REQUEST=GetCapabilities&SERVICE=WMS");
                xhttp.send();

                xhttp.onload = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        // Typical action to be performed when the document is ready:
                        let response_text = xhttp.responseXML;

                        console.log(response_text);

                        if (response_text) {

                            contactOrganisation = response_text.querySelector("ContactOrganization").textContent;

                            htmlcollection_layer = response_text.getElementsByTagName("Layer");

                            console.log(htmlcollection_layer);

                            for (let element_layer of htmlcollection_layer) {

                                let hasLayerName = false;
                                let hasTitle = false;
                                let hasBoundingBox = false;
                                let layerTitle, layerName, layerAbstract, layerLegendURL;

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
                                        case "BoundingBox":
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

                                // if the layer tag in the xml has a layername an title tag and an boundingbox
                                // then add an option element to the list of options
                                if (hasLayerName && hasTitle && hasBoundingBox) {
                                    let option = document.createElement("option");
                                    // console.log(child);
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
                                    option.setAttribute("data-LayersWms", layerName);
                                    option.setAttribute("data-LayersWmsAbstract", layerAbstract);

                                    // Check if the href doesn't start with "http://" or "https://"
                                    // then it must be a relative link
                                    if (layerLegendURL && !layerLegendURL.startsWith("http://") && !layerLegendURL.startsWith("https://")) {
                                        // Add your desired string in front of the href
                                        // const queryString = layerLegendURL.split('?')[1];
                                        // console.log(queryString);
                                        layerLegendURL = value_url_wms + "?" + layerLegendURL;
                                        console.log(layerLegendURL);
                                    }
                                    option.setAttribute("data-LayersWmsLengendURL", layerLegendURL);
                                    document.getElementById("datalistOptions").appendChild(option);
                                }

                            }

                            // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
                            for (let alert of alerts) {
                                alert.style.display = "none";
                            }

                            success.style.display = "";
                            // success.innerHTML = "Die Abfrage der Layer des WMS war erfolgreich.";
                            translateModal(undefined, undefined, undefined, success, undefined);

                        } else {

                            // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
                            for (let alert of alerts) {
                                alert.style.display = "none";
                            }

                            noWMSURLreco.style.display = "";
                            // noWMSURLreco.innerHTML = "<strong>Achtung!</strong>Keine URL erkannt, bitte nochmal versuchen.";
                            translateModal(undefined, undefined, undefined, noWMSURLreco, undefined);

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
                        translateModal(undefined, undefined, undefined, errorRequest, undefined);

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

                    noRequestSend.style.display = "";
                    // noRequestSend.innerHTML = "<strong>Achtung!</strong> Request konnte nicht abgesetzt werden, bitte nochmal versuchen.";

                    translateModal(undefined, undefined, undefined, noRequestSend, undefined);
                    // stop the loading animation for onerror
                    stopLoadingAnimationWMS();
                };
            }

        });

        document.getElementById("ok_button_wms").addEventListener('click', () => {
            let layer_title = document.getElementById("exampleDataList").value;
            console.log(layer_title);

            let value_name_wms, abstractWMS, wmsLegendURL;
            let okbtn = document.getElementById("ok_button_wms");

            // when no layer in the collection and try add layer to menu
            if (!htmlcollection_layer) {

                // Alertmeldungen und sucessmeldung nicht sichtbar stellen des WMS modals
                for (let alert of alerts) {
                    alert.style.display = "none";
                }

                // when the attribute can be found it will be set not to close the modal to show error message
                if (okbtn.getAttribute("data-dismiss")) {
                    okbtn.setAttribute("data-dismiss", "");
                }

                noWMSQueryed.style.display = "";
                // noWMSQueryed.innerHTML = "<strong>Achtung!</strong>Bitte zuerst den WMS anfragen und dann auf 'Zum Menü hinzufügen' klicken.";

                translateModal(undefined, undefined, undefined, noWMSQueryed, undefined);

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
                translateModal(undefined, undefined, undefined, noWMSSelected, undefined);

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
                    }
                }

                // check if there are existing WMS Layers compared with the new adding ones
                let bool = this.checkForDublicateWMSLayer(titleWMS, WMSexistsMenu, okbtn);

                // only execute adding WMS Layer if the WMS is not found in the menu
                if (!bool) {
                    // when the layer was added, close modal
                    okbtn.setAttribute("data-dismiss", "modal");

                    this.addWMSLayer(value_name_wms, value_url_wms, layer_title, abstractWMS, wmsLegendURL, contactOrganisation);
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
                translateModal(undefined, undefined, undefined, alertWMSexists, undefined, undefined);
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

    async addWMSLayer(value_name_wms, value_url_wms, layer_title, abstract, wmslegendURL, contactOrganisation) {

        let section_4 = document.getElementById("section_4");
        section_4.style.display = "block";

        let section4Text = document.getElementById("section_4_text");
        section4Text.style.display = "inline-block";

        // translate the layer title and the abstract for the layermenu depending on the choosen language
        let arr = [layer_title, abstract];
        let result = arr.join(', ');

        await translateArrayInput(result).then(function (arrayText) {
            arr = arrayText;
        });

        layer_title = arr[0];
        console.log(layer_title);
        abstract = arr[1];

        // Create the new <a> tag element
        const newLink = document.createElement("a");

        // Set the attributes for the new <a> tag
        newLink.className = "dropdown-item layermenu";
        newLink.title = abstract;
        newLink.setAttribute("data-urlWms", value_url_wms);
        newLink.setAttribute("data-LayersWms", value_name_wms);
        newLink.setAttribute("data-layerTitle", layer_title);
        newLink.setAttribute("data-contactOrganisation", contactOrganisation);
        // Create the <img> and <span> tags to go inside the <a> tag
        const newImg = document.createElement("img");
        newImg.className = "img_layers";
        newImg.src = "../CesiumJS-testing/Icons/WMS.png";

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

        // newDIVSection.appendChild(newLink);
        // Add the new <a> tag to the <div> element with ID "section_4"
        section_4.appendChild(newLink);

        // Create the opacity slider
        const opacitySlider = document.createElement("input");
        opacitySlider.className = "dropdown-item layermenu slider";
        opacitySlider.id = "sliderLayer " + ID;
        opacitySlider.name = "sliderWMSLayer";
        opacitySlider.type = "range";
        opacitySlider.min = 0;
        opacitySlider.max = 1;
        opacitySlider.step = 0.1;
        opacitySlider.value = 0.7; // Initial opacity value

        // Set initial opacity value
        newLink.setAttribute("data-opacityLayer", opacitySlider.value);

        // Add the opacity slider to the <a> tag
        newLink.appendChild(opacitySlider);

        // Create a label element
        const opacityLabelSlider = document.createElement("label");
        opacityLabelSlider.className = "dropdown-item layermenu slider label";
        // opacityLabelSlider.textContent = "Sichtbarkeit: " + opacitySlider.value * 100 + "%";
        let textLabel = "Sichtbarkeit: " + opacitySlider.value * 100 + "%";

        // Add the label after the slider
        newLink.appendChild(opacityLabelSlider);

        // translate legendstrings first word
        // second word title layer already translated
        let array = ["Legende ", textLabel];
        let resultarr = array.join(', ');

        await translateArrayInput(resultarr).then(function (arrayText) {
            array = arrayText;
        });

        let LegendString = array[0] + layer_title;

        opacityLabelSlider.textContent = array[1];

        this.fetchWMSLegend(wmslegendURL, LegendString);

        // const layermenu = document.getElementById("layermenue_dropdown");
        // layermenu.appendChild(newDIVText);
        // layermenu.appendChild(newDIVSection);
        markActiveSelectedLayers();
        StopCloseMenu();
    }

    handleExternalServices(node, value_name_wms, value_url_wms) {

        let imageryLayer;

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

                    // console.log(node.children);

                    imageryLayer = new Cesium.ImageryLayer(wms_provider, {
                        alpha: node.dataset.opacitylayer
                    });
                    viewer.imageryLayers.add(imageryLayer);

                    const opacitySlider = node.children.namedItem("sliderWMSLayer");

                    const LayerSlider = node.children[3];
                    
                    // Add an event listener to handle changes in the slider value
                    opacitySlider.addEventListener("input", async function () {
                        // set opacity of layer
                        imageryLayer.alpha = opacitySlider.value;
                        // set opacity of the data attribute to load layer with that value when clicked again
                        node.setAttribute("data-opacityLayer", opacitySlider.value);
                        // explicitly render a new frame
                        viewer.scene.requestRender();
                        let array = ["Sichtbarkeit " + opacitySlider.value * 100 + "%"];
                        let resultarr = array.join(', ');

                        await translateArrayInput(resultarr).then(function (arrayText) {
                            array = arrayText;
                        });

                        LayerSlider.textContent = array[0];
                    });

                    // imageryLayer = viewer.imageryLayers.addImageryProvider(wms_provider);
                    // viewer.imageryLayers.add(esriLayer);
                    console.log("initial added WMS");
                } else {
                    // when the node dont has activ class the wms gets removed
                    viewer.imageryLayers.remove(imageryLayer);
                    console.log("WMS contains already. The WMS layer gets deleted.");
                }
            });
        }
    }

}