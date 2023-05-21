import { translateModal } from './translate.js';

export function loadAnimationGeoJSON() {

    let alert = document.getElementById("success-geojson");

    const loaderanimation = document.getElementsByClassName('spinner-border')[0];
    const loadertext = document.getElementsByClassName('load')[0];

    const modalBody = document.getElementById('loadingGeojson');

    loaderanimation.classList.remove("hide");
    loadertext.classList.remove("hide"); // fügen Sie eine zusätzliche Klasse hinzu, um den Loader auszublenden

    // translate(undefined, modalBody.firstChild.innerHTML, undefined, undefined);

    alert.style.display = "none";

    // modalBody.children[0].textContent = "Ihre Daten werden nun von der Anwendung geladen und gerendert. Bitte warten Sie einen Augenblick.";

    translateModal(undefined, modalBody, undefined, undefined);

    // loaderanimation.classList.remove("hide"); // fügen Sie eine zusätzliche Klasse hinzu, um den Loader auszublenden

    // const textLoading = document.getElementsByClassName('span-loading hide')[0];

    // textLoading.classList.remove("hide"); // fügen Sie eine zusätzliche Klasse hinzu, um den Loader auszublenden
}

export function startLoadingAnimationWMS() {

    const loaderanimation = document.getElementsByClassName('spinner-border spinner-border-sm')[0];
    const loadertext = document.getElementsByClassName('loadWMS')[0];

    loaderanimation.classList.remove("hide");
    loadertext.classList.remove("hide"); // fügen Sie eine zusätzliche Klasse hinzu, um den Loader auszublenden
}

export function stopLoadingAnimationWMS() {

    const loaderanimation = document.getElementsByClassName('spinner-border spinner-border-sm')[0];
    const loadertext = document.getElementsByClassName('loadWMS')[0];

    loaderanimation.classList.add("hide");
    loadertext.classList.add("hide"); // fügen Sie eine zusätzliche Klasse hinzu, um den Loader auszublenden
}

export function stopLoadAnimationGeoJSON() {

    const loaderanimation = document.getElementsByClassName('spinner-border')[0];
    const loadertext = document.getElementsByClassName('load')[0];

    const modalBody = document.getElementById('loadingGeojson');

    loaderanimation.classList.add("hide");
    loadertext.classList.add("hide"); // fügen Sie eine zusätzliche Klasse hinzu, um den Loader auszublenden

    let alert = document.getElementById("success-geojson");
    alert.style.display = "";
    // alert.innerHTML = "Das Laden der GeoJSON Datei war erfolgreich.";

    // translate(alert, undefined, undefined, undefined);

    modalBody.children[0].textContent = "";

    //const textLoading = document.getElementsByClassName('span-loading')[0];

    //textLoading.classList.add("hide"); // fügen Sie eine zusätzliche Klasse hinzu, um den Loader auszublenden
}

export function loadingInfoTable(table) {

    // create a new row for the loading animation and insert at the start of table
    let loadingRow = table.insertRow(0);
    loadingRow.setAttribute("class", "loading-row");

    // create a new cell for the loading animation
    let loadingCell = loadingRow.insertCell();
    loadingCell.colSpan = 2; // set the colspan to the number of columns in the table
    loadingCell.innerHTML = "Loading data...";

    // create the loading animation element
    let loadingAnimation = document.createElement("div");
    loadingAnimation.setAttribute("class", "loading-animation");

    // append the loading animation to the cell
    loadingCell.appendChild(loadingAnimation);

    return { row: loadingRow, animation: loadingAnimation };

}

// loading handling website loading
function loadAnimation() {
    window.addEventListener('load', function() {
        const loader = document.querySelector('.loader');
        const container = this.document.querySelector(".container");
        // loader.className += ' hidden'; 
        loader.classList.add("hidden"); // fügen Sie eine zusätzliche Klasse hinzu, um den Loader auszublenden
        container.style.display = "none";
        // const loader2 = document.querySelector('#loading-row');
        // loader2.classList.remove("hide");
    });
}

loadAnimation();