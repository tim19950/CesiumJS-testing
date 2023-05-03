export function updateCesiumContainerHeight() {

    // Das Element, dessen Höhe überwacht werden soll
    const navbar = document.getElementsByClassName('navbar navbar-expand-lg navbar-light')[0];

    // Get the Cesium container element and set its height to fill the remaining space
    const cesiumContainer = document.getElementById('cesiumContainer');

    // Erstellen Sie eine Instanz des ResizeObservers
    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            let newHeight = entry.borderBoxSize[0].blockSize;
            if (window.innerWidth < 768) { // Check if the width is below 768px (replace with your desired value)
                cesiumContainer.style.height = `calc(100% - ${newHeight}px)`;

                // reset the body height to that of the inner browser
                document.body.style.height = window.innerHeight + "px";

                // document.body.style.height = `calc(100vh - ${toolbarHeight}px)`;

            } else {
                cesiumContainer.style.height = `calc(100vh - ${newHeight}px)`;
            }
        }
    });

    // Fügen Sie das Element dem Observer hinzu
    observer.observe(navbar);
}

export function updateMaxHeightLayerMenu() {
    // change height of the layer menu depending on screen height
    const layerMenu = document.getElementById('layermenue_dropdown');
    const screenHeight = window.innerHeight;
    const maxHeight = Math.round(screenHeight * 0.72); // Set max-height to 72% of the screen height
    layerMenu.style.maxHeight = maxHeight + 'px';
}

// Call updateMaxHeight on window resize
window.addEventListener('resize', updateMaxHeightLayerMenu);

function touchevent() {
    if ('ontouchstart' in window) {
        console.log('Touch events are supported.');
    } else {
        console.log('Touch events are not supported.');
    }
}