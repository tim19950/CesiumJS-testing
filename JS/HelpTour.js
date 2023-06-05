import { tour_steps_ger, tour_steps_eng, tour_steps_th, buttonTextGer, buttonTextEng, buttonTextThai } from './toursteps.js';

export default class HelpTour {

    popoverTour() {

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
            let tour = this.setLanguageHelpTour();

            tour.restart();
        });

        document.getElementById("help_tour").addEventListener("click", () => {

            let tour = this.setLanguageHelpTour();
            tour.restart();
        });
    }

    setLanguageHelpTour() {

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

}