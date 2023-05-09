let tour_steps_ger = [{
        orphan: true,
        title: "Willkommen zur Hilfetour",
        content: "Diese Tour wird die wesentlichen Funktionen der Anwendung erläutern. " +
            "Die Tour kann jederzeit durch die Esc-Taste abgerochen und von vorne begonnen werden."
    },
    {
        element: '#geocode',
        title: 'Adressuche',
        content: 'Hier können Adressen oder Städte gesucht werden. Es wird automatisch auf die Orte gezoomt.',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#navbarDropdown',
        title: 'Externe Datenquellen',
        content: 'Hier können externe Daten in der GeoJSON Spezifikation oder als WMS Dienst eingebunden werden.',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#navbarDropdown_help',
        title: 'Weiteres',
        content: 'Unter diesem Menüpunkt finden sich Informationen zu dem Datenschutz und dem Impressum des Geoportals. ' +
            'Ebenfalls kann hier die Hilfetour neu gestartet werden.',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#geolocate_button_toolbar',
        title: 'Geolocation',
        content: 'Mit diesem Menüpunkt kann auf den aktuellen Standort des Nutzers gezoomt werden. ' +
            'Dazu wird von dem Browser die Standortberechtigung benötigt.',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#measure_height_button_toolbar',
        title: 'Höhen messen',
        content: 'Dieser Menüpunkt ermöglicht das Messen von Höhen. Dies funktioniert sowohl für das Gelände als auch auf Gebäuden.',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#measure_distance_button_toolbar',
        title: 'Strecken messen',
        content: 'Dieser Menüpunkt ermöglicht das Messen von Strecken. Dies funktioniert sowohl für das Gelände als auch auf Gebäuden.',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#menu_btn',
        title: 'Layermenü',
        content: 'In diesem Layermenü können die Geodaten ausgewählt werden, welche in der Szene dargestellt werden sollen. ' +
            'Ebenfalls können in dem Mneü Daten abgewählt werden, sodass diese nicht mehr in der Szene angezeigt werden.',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#homebutton',
        title: 'Initialer Startbereich',
        content: 'Mit diesem Menüpunkt kann auf den initialen Startbereich des Geoportals zurück gezoomt werden.',
        //placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#sceneModePickerBtn',
        title: 'Szenenmodus wechseln',
        content: 'Mit diesem Menüpunkt kann die Ansicht von einer 3D Darstellung in eine 2,5D Darstellung und in eine ' +
            '2D-Kartendarstellung geändert werden.',
        //placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#help_button',
        title: 'Hilfestellung zur Bedienung',
        content: 'Dieser Button stellt eine Hilfe bei der Bedienung des Geoportals bereit.',
        // placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#fullscreen',
        title: 'Vollbild',
        content: 'Über diesen Button kann das Bürgerportal in den Fullscreenmodus gebracht werden.',
        placement: "top",
        preventInteraction: true
    },
    {
        orphan: true,
        title: "Ende der Tour",
        content: "Die Tour ist nun beendet. Die Tour kann jederzeit von vorne begonnen werden. "
    }
];

let buttonTextGer = {
    buttonTexts: {
        prevButton: 'Zurück',
        nextButton: 'Weiter',
        endTourButton: 'Ende der Tour'
    }
};

let buttonTextEng = {
    buttonTexts: {
        prevButton: 'Back',
        nextButton: 'Next',
        endTourButton: 'End of the tour'
    }
};

let buttonTextThai = {
    buttonTexts: {
        prevButton: 'กลับ',
        nextButton: 'ถัด',
        endTourButton: 'สิ้นสุดการทัวร์'
    }
};

// english translation
let tour_steps_eng = [{
        orphan: true,
        title: "Welcome to the help tour",
        content: "This tour will explain the essential functions of the application. " +
            " The tour can be cancelled at any time by pressing the Esc key and started again from the beginning."
    },
    {
        element: '#geocode',
        title: 'Search for Address',
        content: 'Addresses or cities can be searched for here. The places are automatically zoomed in.',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#navbarDropdown',
        title: 'External Datasources',
        content: 'External data can be integrated here in the GeoJSON specification or as a WMS service.',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#navbarDropdown_help',
        title: 'Further',
        content: 'Under this menu item you will find information on data protection and the imprint of the geoportal. ' +
            'The help tour can also be restarted here.',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#geolocate_button_toolbar',
        title: 'Geolocation',
        content: 'This menu item can be used to zoom in on the users current location' +
            'The browser requires the location authorisation for this.',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#measure_height_button_toolbar',
        title: 'Measure hights',
        content: 'This menu item allows you to measure heights. This works both for terrain and on buildings.',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#measure_distance_button_toolbar',
        title: 'Measure distance',
        content: 'This menu item allows you to measure distances. This works both for the terrain and on buildings.',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#menu_btn',
        title: 'Layermenu',
        content: 'In this layer menu, the geodata to be displayed in the scene can be selected. ' +
            'Data can also be deselected in this menu so that they are no longer displayed in the scene.',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#homebutton',
        title: 'Initial view',
        content: 'This menu item can be used to zoom back to the initial start area of the Geo-portal.',
        //placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#sceneModePickerBtn',
        title: 'Change scene mode',
        content: 'With this menu item the view can be changed from a 3D representation to a 2.5D representation and to a 2D map representation.',
        //placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#help_button',
        title: 'Operating assistance',
        content: 'This button provides assistance in using the Geo-portal.',
        // placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#fullscreen',
        title: 'Fullscreen',
        content: 'This button can be used to switch to fullscreen mode.',
        placement: "top",
        preventInteraction: true
    },
    {
        orphan: true,
        title: "End of the Tour",
        content: "The tour is now finished. The tour can be started from the beginning at any time."
    }
];

// Thai Translation
let tour_steps_th = [{
        orphan: true,
        title: "ยินดีต้อนรับสู่การช่วยเหลือทัวร์",
        content: "ทัวร์นี้จะอธิบายฟังก์ชันที่สำคัญของแอปพลิเคชัน" +
            " คุณสามารถยกเลิกทัวร์ได้ทุกเมื่อโดยกดปุ่ม Esc และเริ่มต้นอีกครั้งจากต้นแบบ"
    },
    {
        element: '#geocode',
        title: 'ค้นหาที่อยู่',
        content: 'คุณสามารถค้นหาที่อยู่หรือเมืองได้ที่นี่ และจะมีการซูมอัตโนมัติเข้าไปในสถานที่นั้น',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#navbarDropdown',
        title: 'แหล่งข้อมูลภายนอก',
        content: 'ข้อมูลภายนอกสามารถรวมเข้ากันได้ที่นี่ในรูปแบบ GeoJSON หรือเป็นบริการ WMS',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#navbarDropdown_help',
        title: 'ข้อมูลเพิ่มเติม',
        content: 'ภายใต้เมนูนี้คุณจะพบข้อมูลเกี่ยวกับความปลอดภัยของข้อมูลและป้ายกำกับของ geoportal. ' +
            'ทัวร์ช่วยเหลือยังสามารถเริ่มต้นใหม่ได้ที่นี่',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#geolocate_button_toolbar',
        title: 'เรียกพิกัดตำแหน่ง',
        content: 'เมนูนี้ใช้สำหรับขยายภาพในตำแหน่งปัจจุบันของผู้ใช้' +
            'เบราว์เซอร์ต้องมีการอนุญาตให้เข้าถึงตำแหน่งสำหรับการใช้งาน',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#measure_height_button_toolbar',
        title: 'วัดความสูง',
        content: 'เมนูนี้ช่วยให้คุณวัดความสูงได้ทั้งบนพื้นที่และบนอาคาร',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#measure_distance_button_toolbar',
        title: 'วัดระยะทาง',
        content: 'เมนูนี้ช่วยให้คุณวัดระยะทางได้ทั้งบนพื้นที่และบนอาคาร',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#menu_btn',
        title: 'เมนูเลเยอร์',
        content: 'ในเมนูเลเยอร์นี้ คุณสามารถเลือกแสดงข้อมูลภูมิศาสตร์ที่ต้องการแสดงในฉากได้ ' +
            'และยังสามารถยกเลิกการแสดงข้อมูลภูมิศาสตร์เหล่านั้นได้อีกด้วย',
        placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#homebutton',
        title: 'มุมมองเริ่มต้น',
        content: 'เมนูนี้ใช้เพื่อขยายภาพกลับไปยังพื้นที่เริ่มต้นของ Geo-portal',
        //placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#sceneModePickerBtn',
        title: 'เปลี่ยนโหมดฉาก',
        content: 'เมนูนี้ช่วยให้คุณสามารถเปลี่ยนโหมดการแสดงผลจากการแสดงฉาก 3 มิติ เป็นการแสดงฉาก 2.5 มิติ หรือแผนที่ 2 มิติได้',
        //placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#help_button',
        title: 'ช่วยเหลือการใช้งาน',
        content: 'ปุ่มนี้จะช่วยให้คุณใช้ Geo-portal ได้ง่ายขึ้น',
        // placement: "bottom",
        preventInteraction: true
    },
    {
        element: '#fullscreen',
        title: 'เต็มจอ',
        content: 'ปุ่มนี้ใช้เพื่อเปิดโหมดเต็มจอ',
        placement: "top",
        preventInteraction: true
    },
    {
        orphan: true,
        title: "สิ้นสุดการทัวร์",
        content: "การทัวร์ได้เสร็จสิ้นแล้ว สามารถเริ่มต้นทัวร์ใหม่ได้ทุกเมื่อ"
    }
];

export { tour_steps_ger, tour_steps_eng, tour_steps_th, buttonTextGer, buttonTextEng, buttonTextThai };