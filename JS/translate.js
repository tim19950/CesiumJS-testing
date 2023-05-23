let translator = new Translator({
    // filesLocation: '/CesiumJS-testing/json'
        filesLocation: '/json'
});

// This will fetch "/json/de.json" and "/json/en.json"
translator.fetch(['ger', 'eng', 'thai']).then((languages) => {

    // console.log(languages);
    // You now have both languages available to you
    // translator.translatePageTo('de');
});

// translate the static website according to the language clicked
for (let img of document.querySelectorAll(".lang-switch img")) {
    img.addEventListener('click', (evt) => {
        // console.log(evt.target.dataset.lang);
        translator.translatePageTo(evt.target.dataset.lang);
    });
}

export function translateButtonTitle(language, button) {

    let translator = new Translator();

    translator.add("ger", {
        measureHeightButton: {
            title: "Höhen messen"
        },
        measureDistanceButton: {
            title: "Strecken messen"
        },
        geolocateButton: {
            title: "Positionsbestimmung"
        },
        ExternenDatenLöschen: {
            title: "Alle externen Layer löschen"
        },
        layerMenuButton: {
            title: "Layermenü"
        },
        homezoomButton: {
            title: "Initiale Kartenausrichtung"
        },
        sceneModePickerButton3D: {
            title: "3-D Ansicht"
        },
        sceneModePickerButton2D: {
            title: "2-D Ansicht"
        },
        sceneModePickerButtonColumbusView: {
            title: "Columbus Ansicht"
        },
        helpButton: {
            title: "Bedienungshilfe"
        },
        vollbildButton: {
            title: "Vollbild"
        }
    });

    translator.add("eng", {
        measureHeightButton: {
            title: "Measure heights"
        },
        measureDistanceButton: {
            title: "Measure distance"
        },
        geolocateButton: {
            title: "Geolocate yourself"
        },
        ExternenDatenLöschen: {
            title: "Delete all external layers"
        },
        layerMenuButton: {
            title: "Layermenu"
        },
        homezoomButton: {
            title: "Initial map orientation"
        },
        sceneModePickerButton3D: {
            title: "3-D view"
        },
        sceneModePickerButton2D: {
            title: "2-D view"
        },
        sceneModePickerButtonColumbusView: {
            title: "Columbus view"
        },
        helpButton: {
            title: "Operating manual"
        },
        vollbildButton: {
            title: "Fullscreen"
        }
    });

    translator.add("thai", {
        measureHeightButton: {
            title: "วัดความสูง"
        },
        measureDistanceButton: {
            title: "วัดระยะทาง"
        },
        geolocateButton: {
            title: "ระบุตําแหน่งทางภูมิศาสตร์ด้วยตัวคุณเอง"
        },
        ExternenDatenLöschen: {
            title: "ลบเลเยอร์ภายนอกทั้งหมด"
        },
        layerMenuButton: {
            title: "เมนูเลเยอร์"
        },
        homezoomButton: {
            title: "การวางแนวแผนที่เริ่มต้น"
        },
        sceneModePickerButton3D: {
            title: "มุมมอง 3 มิติ"
        },
        sceneModePickerButton2D: {
            title: "มุมมอง 2 มิติ"
        },
        sceneModePickerButtonColumbusView: {
            title: "มุมมองโคลัมบัส"
        },
        helpButton: {
            title: "คู่มือการใช้งาน"
        },
        vollbildButton: {
            title: "เต็มหน้าจอ"
        }
    });

    if (button) {
        switch (button.id) {
            case "measure_height_button_toolbar":
                button.title = __('measureHeightButton.title', language);
                break;
            case "measure_distance_button_toolbar":
                button.title = __('measureDistanceButton.title', language);
                break;
            case "geolocate_button_toolbar":
                button.title = __('geolocateButton.title', language);
                break;
            case "menu_btn":
                button.title = __('layerMenuButton.title', language);
                break;
            case "homebutton":
                button.title = __('homezoomButton.title', language);
                break;
            case "3D":
                button.title = __('sceneModePickerButton3D.title', language);
                break;
            case "2D":
                button.title = __('sceneModePickerButton2D.title', language);
                break;
            case "Columbus-view":
                button.title = __('sceneModePickerButtonColumbusView.title', language);
                break;
            case "help_button":
                button.title = __('helpButton.title', language);
                break;
            case "fullscreen":
                button.title = __('vollbildButton.title', language);
                break;
            case "layer_delete_button":
                button.title = __('ExternenDatenLöschen.title', language);
                break;
        }
    }
}

export function translateToastHeight(toastBody, height) {

    let translator = new Translator();

    translator.add("ger", {
        toastMessageheight: {
            textContent: "Die ellipsoidische Höhe (WGS84) des Punktes beträgt: " + height + " meter."
        }
    });

    translator.add("eng", {
        toastMessageheight: {
            textContent: "The ellipsoidal height (WGS84) of the point is: " + height + " meters."
        }
    });

    translator.add("thai", {
        toastMessageheight: {
            textContent: "ความสูงบนวงแหวนโลก (WGS84) ของจุดนี้คือ: " + height + " เมตร"
        }
    });

    // Get all img tags
    const imagTags = document.querySelectorAll('img.eng, img.thai, img.ger');

    // Loop through the img tags
    for (const imgTag of imagTags) {
        // Get the language class of the img tag
        const lang = imgTag.classList[0];

        // Check if the img tag has the "active-flag" class which id added when clicked before
        if (imgTag.classList.contains('active-flag')) {
            // Do something with the img tag based on its language class
            updateToastText(lang);
        }
    }

    function updateToastText(language) {
        if (toastBody) {
            switch (toastBody.id) {
                case "toastBody":
                    toastBody.textContent = __('toastMessageheight.textContent', language);
                    break;
            }
        }
    }
}


export function translateToast(toastBody, distance, total_distance) {

    let translator = new Translator();

    translator.add("ger", {
        toastMessage: {
            textContent: "Bitte wählen Sie noch einen Punkt, um die Messung zu starten."
        },
        toastMessagedistanceOver1000andTotalDistanceOver1000: {
            innerText: "Distanz: " + (distance / 1000).toFixed(3) + " Kilometer \n Gesamtdistanz des Linienzugs: " + (total_distance / 1000).toFixed(3) + " Kilometer"
        },
        toastMessageTotalDistanceOver1000: {
            innerText: "Distanz: " + distance.toFixed(3) + " Meter \n Gesamtdistanz des Linienzugs: " + (total_distance / 1000).toFixed(3) + " Kilometer"
        },
        toastMessagedistanceBelow1000: {
            innerText: "Distanz: " + distance.toFixed(3) + " Meter \n Gesamtdistanz des Linienzugs: " + total_distance.toFixed(3) + " Meter"
        }
    });

    translator.add("eng", {
        toastMessage: {
            textContent: "Please select another point to start the measurement."
        },
        toastMessagedistanceOver1000andTotalDistanceOver1000: {
            innerText: "Distance: " + (distance / 1000).toFixed(3) + " kilometers \n Total distance of the line: " + (total_distance / 1000).toFixed(3) + " kilometers"
        },
        toastMessageTotalDistanceOver1000: {
            innerText: "Distance: " + distance.toFixed(3) + " meters \n Total distance of the line: " + (total_distance / 1000).toFixed(3) + " kilometers"
        },
        toastMessagedistanceBelow1000: {
            innerText: "Distance: " + distance.toFixed(3) + " meters \n Total distance of the line: " + total_distance.toFixed(3) + " meters"
        }
    });

    translator.add("thai", {
        toastMessage: {
            textContent: "กรุณาเลือกจุดอีกตัวเพื่อเริ่มต้นการวัด"
        },
        toastMessagedistanceOver1000andTotalDistanceOver1000: {
            innerText: "ระยะทาง: " + (distance / 1000).toFixed(3) + " กิโลเมตร \n ระยะทางรวมของเส้น: " + (total_distance / 1000).toFixed(3) + " กิโลเมตร"
        },
        toastMessageTotalDistanceOver1000: {
            innerText: "ระยะทาง: " + distance.toFixed(3) + " เมตร \n ระยะทางรวมของเส้น: " + (total_distance / 1000).toFixed(3) + " กิโลเมตร"
        },
        toastMessagedistanceBelow1000: {
            innerText: "ระยะทาง: " + distance.toFixed(3) + " เมตร \n ระยะทางรวมของเส้น: " + total_distance.toFixed(3) + " เมตร"
        }
    });

    // Get all img tags
    const imagTags = document.querySelectorAll('img.eng, img.thai, img.ger');

    // Loop through the img tags
    for (const imgTag of imagTags) {
        // Get the language class of the img tag
        const lang = imgTag.classList[0];

        // Check if the img tag has the "active-flag" class which id added when clicked before
        if (imgTag.classList.contains('active-flag')) {
            // Do something with the img tag based on its language class
            updateToastText(lang);
        }
    }

    function updateToastText(language) {
        if (toastBody) {
            switch (toastBody.id) {
                case "toastBody":
                    if (distance !== 0) {
                        console.log("Fds");
                        if (distance > 1000 && total_distance > 1000) {
                            console.log("b");
                            // Wenn die Distanz und total distance größer als 1000 Meter ist, umrechnen in Kilometer
                            toastBody.innerText = __('toastMessagedistanceOver1000andTotalDistanceOver1000.innerText', language);
                            break;
                        } else if (total_distance > 1000) {
                            toastBody.innerText = __('toastMessageTotalDistanceOver1000.innerText', language);
                            break;
                        } else {
                            toastBody.innerText = __('toastMessagedistanceBelow1000.innerText', language);
                            break;
                        }
                    } else {
                        console.log("a");
                        toastBody.textContent = __('toastMessage.textContent', language);
                        break;
                    }
            }
        }
    }
}

export function translateInfoTable(inputString) {

    // Get all img tags
    const imagTags = document.querySelectorAll('img.eng, img.thai, img.ger');

    // Loop through the img tags
    for (const imgTag of imagTags) {
        // Get the language class of the img tag
        const lang = imgTag.classList[0];

        // Check if the img tag has the "active-flag" class which id added when clicked before
        if (imgTag.classList.contains('active-flag')) {
            // get the lang att of the tag
            // use extra attribute for translation
            // let language = imgTag.dataset.lang;
            // Do something with the img tag based on its language class
            translateInfoTabeFetch(language, inputString);
        }
    }

    function translateInfoTabeFetch(language, inputString) {

        const subscriptionKey = 'b0d258d39a144c728fcf93c30b15ce49';
        const endpoint = 'https://api.cognitive.microsofttranslator.com';
        const location = "southeastasia";

        // console.log(inputString);

        const translateText = async () => {
            const url = `${endpoint}/translate?api-version=3.0&from=en&to=` +language;
            const body = [{ Text: 'Hello, what is your name?' }];

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Ocp-Apim-Subscription-Key': subscriptionKey,
                        'Content-Type': 'application/json; charset=UTF-8',
                        'Ocp-Apim-Subscription-Region': location,
                    },
                    body: JSON.stringify(body),
                });

                const data = await response.json();
                const translation = data[0].translations[0].text;
                console.log(`Translated text: ${translation}`);
            } catch (error) {
                console.error('Translation error:', error);
            }
        };

        translateText();


        // translate('Ik spreek Engels', { to: language }).then(res => {
        //     console.log(res.text);
        //     //=> I speak English
        //     console.log(res.from.language.iso);
        //     //=> nl
        // }).catch(err => {
        //     console.error(err);
        // });

        //TODO implement translation for infotable with API
    }
}

// function to translate according to the dynamic events in JS happening
export function translateModal(modalHeader, modalBody, errorMessage, alert, button, handler, label) {

    let translator = new Translator();

    translator.add("ger", {
        buttonOK: {
            innerText: "Okay, fortfahren"
        },
        modalHeaderTerrain: {
            innerText: "Information"
        },
        modalHeaderWrongGeojson: {
            innerText: "Achtung"
        },
        modalBodyTerrain: {
            innerText: "Wenn die Gebäude auf dem Gelände dargestellt werden, wird eine höhere Rechnerleistung benötigt."
        },
        modalBodyDeleteData: {
            innerText: "Möchten Sie wirklich alle externen Geodaten aus der Szene und dem Layermenü entfernen?"
        },
        modalBodyWrongFormat: {
            innerText: "Die Daten, welche Sie hinzufügen möchten, sind keine GeoJSON Dateien. Bitte laden Sie nur GeoJSON."
        },
        modalBodyaddedGeoJSON: {
            innerText: "Ihre GeoJSON daten sind dem Menü als Layer hinzugefügt worden."
        },
        modalBodyLoadGeoJSON: {
            innerText: "Ihre Daten werden nun von der Anwendung geladen und gerendert. Bitte warten Sie einen Augenblick."
        },
        alertMessage: {
            innerText: "Das Laden der GeoJSON Datei war erfolgreich."
        },
        modalBodyBothMesureFunction: {
            innerText: "Es können nicht beide Messfunktionen gleichzeitig verwendet werden, schalten Sie eine aus!"
        },
        modalBodyMeasurePoints: {
            innerText: "Sie können mit der linken Maustaste Punkte auf der Karte setzen. Mit einem Klick der rechten Maustaste in der Karte löschen Sie alle gezeichneten Höhenpunkte aus der Karte."
        },
        modalBodyMeasureLine: {
            innerText: "Sie können mit der linken Maustaste Punkte auf der Karte setzen. Mit einem Klick der rechten Maustaste in der Karte können sie die Messung beenden. Mit der 'Esc' Taste löschen Sie alle Linien."
        },
        fileSelected: {
            innerText: "Keine Datei ausgewählt"
        },
        geoJSONAddnoFile: {
            innerText: "Wählen Sie erst eine Datei aus"
        },
        geoJSONAddExists: {
            innerText: "Eine oder meherer ausgewählte Dateien existieren bereits im Menü."
        },
        alertWMSNoURL: {
            innerHTML: "<strong>Achtung!</strong>Geben Sie erst eine URL des WMS an!"
        },
        alertNoWMSURLrecognided: {
            innerHTML: "<strong>Achtung!</strong>Keine URL erkannt, bitte nochmal versuchen."
        },
        alerterrorRequest: {
            innerHTML: "<strong>Achtung!</strong>Fehler in dem Request, bitte nochmal versuchen."
        },
        alertNoRequestSend: {
            innerHTML: "<strong>Achtung!</strong>Request konnte nicht abgesetzt werden, bitte nochmal versuchen."
        },
        alertNoWMSQueryed: {
            innerHTML: "<strong>Achtung!</strong>Bitte zuerst den WMS anfragen und dann auf 'Zum Menü hinzufügen' klicken."
        },
        alertNoWMSSelected: {
            innerHTML: "<strong>Achtung!</strong>Bitte zuerst den WMS auswählen und dann auf 'Zum Menü hinzufügen' klicken."
        },
        alertWMSExistMenu: {
            innerHTML: "<strong>Achtung!</strong>Der ausgewählte WMS ist bereits in dem Layermenu vorhaden."
        },
        sucessWMSQuery: {
            innerHTML: "Die Abfrage der Layer des WMS war erfolgreich."
        },
        errorMessage: {
            error: "Das GeoJSON, welches Sie hinzufügen wollen, besitzt Fehler:" + errorMessage
        }
    });

    translator.add("eng", {
        buttonOK: {
            innerText: "Okay, continue"
        },
        modalHeaderTerrain: {
            innerText: "Information"
        },
        modalHeaderWrongGeojson: {
            innerText: "Attention"
        },
        modalBodyTerrain: {
            innerText: "When the buildings are displayed on the terrain, a higher computer performance is required."
        },
        modalBodyDeleteData: {
            innerText: "Do you really want to remove all external geodata from the scene and the layer menu?"
        },
        modalBodyWrongFormat: {
            innerText: "The data you want to add are not GeoJSON files. Please only add GeoJSON files."
        },
        modalBodyaddedGeoJSON: {
            innerText: "Your GeoJSON data has been added to the menu as a layer."
        },
        modalBodyLoadGeoJSON: {
            innerText: "Your data will now be loaded and rendered by the application. Please wait a moment."
        },
        alertMessage: {
            innerText: "The loading of the GeoJSON file was successful."
        },
        modalBodyBothMesureFunction: {
            innerText: "Both measuring functions cannot be used at the same time, switch one off!"
        },
        modalBodyMeasurePoints: {
            innerText: "You can set points on the map with the left mouse button. With a click of the right mouse button in the map you delete all drawn elevation points from the map."
        },
        modalBodyMeasureLine: {
            innerText: "You can set points on the map with the left mouse button. With a click of the right mouse button in the map you can end the measurement. With the 'Esc' key you can delete all lines."
        },
        fileSelected: {
            innerText: "No file selected"
        },
        geoJSONAddnoFile: {
            innerText: "Select a file first"
        },
        geoJSONAddExists: {
            innerText: "One or more selected files already exist in the menu."
        },
        alertWMSNoURL: {
            innerHTML: "<strong>Caution!</strong>First enter a URL of the WMS!"
        },
        alertNoWMSURLrecognided: {
            innerHTML: "<strong>Attention!</strong>No URL recognised, please try again."
        },
        alerterrorRequest: {
            innerHTML: "<strong>Attention!</strong>Error in the request, please try again."
        },
        alertNoRequestSend: {
            innerHTML: "<strong>Attention!</strong>Request could not be sent, please try again."
        },
        alertNoWMSQueryed: {
            innerHTML: "<strong>Attention!</strong>Please request the WMS first and then click on 'Add to Menu'."
        },
        alertNoWMSSelected: {
            innerHTML: "<strong>Caution!</strong>Please select the WMS first and then click on 'Add to menu'."
        },
        alertWMSExistMenu: {
            innerHTML: "<strong>Attention!</strong> The selected WMS is already present in the layer menu."
        },
        sucessWMSQuery: {
            innerHTML: "The query of the layers of the WMS was successful."
        },
        errorMessage: {
            error: "The GeoJSON you want to add has errors:" + errorMessage
        }
    });

    translator.add("thai", {
        buttonOK: {
            innerText: "เอาล่ะดําเนินการต่อ"
        },
        modalHeaderTerrain: {
            innerText: "ข้อมูล"
        },
        modalHeaderWrongGeojson: {
            innerText: "การดูแล"
        },
        modalBodyTerrain: {
            innerText: "เมื่ออาคารแสดงบนภูมิประเทศจําเป็นต้องมีประสิทธิภาพของคอมพิวเตอร์ที่สูงขึ้น"
        },
        modalBodyDeleteData: {
            innerText: "คุณต้องการลบข้อมูลเชิงพื้นที่ภายนอกทั้งหมดออกจากฉากและเมนูเลเยอร์จริงหรือไม่?"
        },
        modalBodyWrongFormat: {
            innerText: "ข้อมูลที่คุณต้องการเพิ่มไม่ใช่ไฟล์ GeoJSON โปรดเพิ่มไฟล์ GeoJSON เท่านั้น"
        },
        modalBodyaddedGeoJSON: {
            innerText: "ข้อมูล GeoJSON ของคุณถูกเพิ่มลงในเมนูเป็นเลเยอร์"
        },
        modalBodyLoadGeoJSON: {
            innerText: "ข้อมูลของคุณจะถูกโหลดและแสดงผลโดยแอปพลิเคชัน โปรดรอสักครู่"
        },
        alertMessage: {
            innerText: "การโหลดไฟล์ GeoJSON สําเร็จ"
        },
        modalBodyBothMesureFunction: {
            innerText: "ฟังก์ชั่นการวัดทั้งสองไม่สามารถใช้ในเวลาเดียวกันปิดหนึ่งครั้ง!"
        },
        modalBodyMeasurePoints: {
            innerText: "คุณสามารถตั้งค่าจุดบนแผนที่ด้วยปุ่มซ้ายของเมาส์ ด้วยการคลิกปุ่มเมาส์ขวาในแผนที่คุณจะลบจุดระดับความสูงที่วาดทั้งหมดออกจากแผนที่"
        },
        modalBodyMeasureLine: {
            innerText: "คุณสามารถตั้งค่าจุดบนแผนที่ด้วยปุ่มซ้ายของเมาส์ ด้วยการคลิกปุ่มเมาส์ขวาในแผนที่คุณสามารถสิ้นสุดการวัดได้ ด้วยปุ่ม 'Esc' คุณสามารถลบทุกบรรทัดได้"
        },
        fileSelected: {
            innerText: "ไม่มีไฟล์ที่เลือก"
        },
        geoJSONAddnoFile: {
            innerText: "เลือกไฟล์ก่อน"
        },
        geoJSONAddExists: {
            innerText: "ไฟล์ที่เลือกหนึ่งหรือมากกว่านั้นมีอยู่แล้วในเมนู"
        },
        alertWMSNoURL: {
            innerHTML: "<strong>ความระมัดระวัง!</strong> ก่อนอื่นให้ป้อน URL ของ WMS!"
        },
        alertNoWMSURLrecognided: {
            innerHTML: "<strong>การดูแล!</strong> ไม่รู้จัก URL โปรดลองอีกครั้ง"
        },
        alerterrorRequest: {
            innerHTML: "<strong>การดูแล!</strong> ข้อผิดพลาดในคําขอโปรดลองอีกครั้ง"
        },
        alertNoRequestSend: {
            innerHTML: "<strong>การดูแล!</strong> ไม่สามารถส่งคําขอได้โปรดลองอีกครั้ง"
        },
        alertNoWMSQueryed: {
            innerHTML: "<strong>การดูแล!</strong> กรุณาขอ WMS ก่อนจากนั้นคลิกที่ 'เพิ่มในเมนู'"
        },
        alertNoWMSSelected: {
            innerHTML: "<strong>ความระมัดระวัง!</strong> โปรดเลือก WMS ก่อนจากนั้นคลิกที่ 'เพิ่มลงในเมนู'"
        },
        alertWMSExistMenu: {
            innerHTML: "<strong>โปรดทราบ!</strong> WMS ที่เลือกมีอยู่แล้วในเมนูเลเยอร์"
        },
        sucessWMSQuery: {
            innerHTML: "แบบสอบถามของเลเยอร์ของ WMS ประสบความสําเร็จ."
        },
        errorMessage: {
            error: "GeoJSON ที่คุณต้องการเพิ่มมีข้อผิดพลาด:" + errorMessage
        }
    });

    // Get all img tags
    const imagTags = document.querySelectorAll('img.eng, img.thai, img.ger');

    // Loop through the img tags
    for (const imgTag of imagTags) {
        // Get the language class of the img tag
        const lang = imgTag.classList[0];

        // Check if the img tag has the "active-flag" class which id added when clicked before
        if (imgTag.classList.contains('active-flag')) {
            // Do something with the img tag based on its language class
            updateModalText(lang);

        }
    }

    // Function to update modal text based on language
    function updateModalText(language) {
        if (modalBody) {
            switch (modalBody.id) {
                case "modal_body_osm_buildings_clamping":
                    button.innerText = __('buttonOK.innerText', language);
                    modalHeader.innerText = __('modalHeaderTerrain.innerText', language);
                    modalBody.innerText = __('modalBodyTerrain.innerText', language);
                    break;
                case "modal_body_delete_all_data":
                    modalBody.innerText = __('modalBodyDeleteData.innerText', language);
                    break;
                case "modalBody":
                    if (typeof modalHeader !== 'undefined' &&
                        typeof modalBody !== 'undefined' &&
                        typeof errorMessage === 'undefined' &&
                        typeof button === 'undefined') {
                        modalHeader.innerText = __('modalHeaderWrongGeojson.innerText', language);
                        modalBody.innerText = __('modalBodyWrongFormat.innerText', language);
                    } else if (typeof modalHeader !== 'undefined' &&
                        typeof modalBody !== 'undefined' &&
                        typeof errorMessage !== 'undefined' &&
                        typeof button === 'undefined') {
                        modalHeader.innerText = __('modalHeaderWrongGeojson.innerText', language);
                        modalBody.innerText = __('errorMessage.error', language);
                    } else if (typeof modalHeader !== 'undefined' &&
                        typeof modalBody !== 'undefined' &&
                        errorMessage === null &&
                        button === null) {
                        console.log("afa2");
                        modalHeader.innerText = __('modalHeaderTerrain.innerText', language);
                        modalBody.innerText = __('modalBodyaddedGeoJSON.innerText', language);
                    }
                    break;
                case "loadingGeojson":
                    modalBody.children[0].textContent = __('modalBodyLoadGeoJSON.innerText', language);
                    break;
                case "success-geojson":
                    modalHeader.innerText = __('alertMessage.innerText', language);
                    break;
                case "modalBodyMeasurePoint":
                    if (handler) {
                        modalHeader.innerText = __('modalHeaderWrongGeojson.innerText', language);
                        modalBody.innerText = __('modalBodyBothMesureFunction.innerText', language);
                    } else {
                        modalHeader.innerText = __('modalHeaderTerrain.innerText', language);
                        modalBody.innerText = __('modalBodyMeasurePoints.innerText', language);
                    }
                    break;
                case "modalBodyMeasureLine":
                    if (handler) {
                        modalHeader.innerText = __('modalHeaderWrongGeojson.innerText', language);
                        modalBody.innerText = __('modalBodyBothMesureFunction.innerText', language);
                    } else {
                        modalHeader.innerText = __('modalHeaderTerrain.innerText', language);
                        modalBody.innerText = __('modalBodyMeasureLine.innerText', language);
                    }
                    break;
            }
        }

        if (label) {
            switch (label.id) {
                case "fileLabel":
                    label.innerText = __('fileSelected.innerText', language);
                    break;
            }
        }

        if (alert) {
            switch (alert.id) {
                case "noGeoJSON":
                    alert.innerText = __('geoJSONAddnoFile.innerText', language);
                    break;
                case "GeoJSONExistsAlready":
                    alert.innerText = __('geoJSONAddExists.innerText', language);
                    break;
                case "noWMSURL":
                    alert.innerHTML = __('alertWMSNoURL.innerHTML', language);
                    break;
                case "noURLRecognised":
                    alert.innerHTML = __('alertNoWMSURLrecognided.innerHTML', language);
                    break;
                case "errorRequest":
                    alert.innerHTML = __('alerterrorRequest.innerHTML', language);
                    break;
                case "noRequestSend":
                    alert.innerHTML = __('alertNoRequestSend.innerHTML', language);
                    break;
                case "noWMSelected":
                    alert.innerHTML = __('alertNoWMSSelected.innerHTML', language);
                    break;
                case "noWMSQueryed":
                    alert.innerHTML = __('alertNoWMSQueryed.innerHTML', language);
                    break;
                case "WMSExistsMenu":
                    alert.innerHTML = __('alertWMSExistMenu.innerHTML', language);
                    break;
                case "success":
                    alert.innerHTML = __('sucessWMSQuery.innerHTML', language);
                    break;
            }
        }

    }
}