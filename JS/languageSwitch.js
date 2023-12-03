export function toggleLanguage() {

    // By default set language imgs to german
    const germanFlags = document.querySelectorAll(".lang-switch .ger");
    germanFlags.forEach((germanFlag) => {
        germanFlag.classList.add("active-flag");
        germanFlag.previousElementSibling.classList.add("active");
    });

    // blub

    // Function switch
    function switchLang() {

        // Funktion für den Klick auf den deutschen Button
        function handleGermanButtonClick(index) {
            // Alle imgs auswählen und die Klassen anpassen
            document.querySelectorAll(".lang-switch .ger")[index].classList.add("active-flag");
            document.querySelectorAll(".lang-switch .eng")[index].classList.remove("active-flag");
            document.querySelectorAll(".lang-switch .thai")[index].classList.remove("active-flag");
            // Unterstreichung anpassen
            document.querySelectorAll(".lang-switch .ger")[index].previousElementSibling.classList.add("active");
            document.querySelectorAll(".lang-switch .eng")[index].previousElementSibling.classList.remove("active");
            document.querySelectorAll(".lang-switch .thai")[index].previousElementSibling.classList.remove("active");

            if (index === 1) {
                // Alle imgs tags des kleinen menu auswählen und die Klassen anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 1].classList.add("active-flag");
                document.querySelectorAll(".lang-switch .eng")[index - 1].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .thai")[index - 1].classList.remove("active-flag");
                // Unterstreichung anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 1].previousElementSibling.classList.add("active");
                document.querySelectorAll(".lang-switch .eng")[index - 1].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .thai")[index - 1].previousElementSibling.classList.remove("active");

            } else if (index === 2) {
                // Alle imgs von dem menu nicht im modal auswählen und die Klassen anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 1].classList.add("active-flag");
                document.querySelectorAll(".lang-switch .eng")[index - 1].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .thai")[index - 1].classList.remove("active-flag");
                // Unterstreichung anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 1].previousElementSibling.classList.add("active");
                document.querySelectorAll(".lang-switch .eng")[index - 1].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .thai")[index - 1].previousElementSibling.classList.remove("active");
                // Alle imgs von dem menu nicht im modal auswählen und die Klassen anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 2].classList.add("active-flag");
                document.querySelectorAll(".lang-switch .eng")[index - 2].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .thai")[index - 2].classList.remove("active-flag");
                // Unterstreichung anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 2].previousElementSibling.classList.add("active");
                document.querySelectorAll(".lang-switch .eng")[index - 2].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .thai")[index - 2].previousElementSibling.classList.remove("active");
            } else {
                // Alle imgs von dem großen menu auswählen und die Klassen anpassen
                document.querySelectorAll(".lang-switch .ger")[index + 1].classList.add("active-flag");
                document.querySelectorAll(".lang-switch .eng")[index + 1].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .thai")[index + 1].classList.remove("active-flag");
                // Unterstreichung anpassen
                document.querySelectorAll(".lang-switch .ger")[index + 1].previousElementSibling.classList.add("active");
                document.querySelectorAll(".lang-switch .eng")[index + 1].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .thai")[index + 1].previousElementSibling.classList.remove("active");
            }
        }

        // Klick-Eventlistener für den deutschen Button im kleinen menü (Index 0)
        document.querySelectorAll(".lang-switch .ger")[0].addEventListener("click", function() {
            handleGermanButtonClick(0);
        });

        // Klick-Eventlistener für den deutschen Button im großen menü (Index 1)
        document.querySelectorAll(".lang-switch .ger")[1].addEventListener("click", function() {
            handleGermanButtonClick(1);
        });
        // Klick-Eventlistener für den deutschen Button im modal (Index 2)
        document.querySelectorAll(".lang-switch .ger")[2].addEventListener("click", function() {
            handleGermanButtonClick(2);
        });

        // Funktion für den Klick auf den englischen Button
        function handleEnglishButtonClick(index) {
            // Alle imgs auswählen und die Klassen anpassen
            document.querySelectorAll(".lang-switch .ger")[index].classList.remove("active-flag");
            document.querySelectorAll(".lang-switch .eng")[index].classList.add("active-flag");
            document.querySelectorAll(".lang-switch .thai")[index].classList.remove("active-flag");
            // Unterstreichung anpassen
            document.querySelectorAll(".lang-switch .ger")[index].previousElementSibling.classList.remove("active");
            document.querySelectorAll(".lang-switch .eng")[index].previousElementSibling.classList.add("active");
            document.querySelectorAll(".lang-switch .thai")[index].previousElementSibling.classList.remove("active");

            if (index === 1) {
                // Alle imgs tags des kleinen menu auswählen und die Klassen anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 1].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .eng")[index - 1].classList.add("active-flag");
                document.querySelectorAll(".lang-switch .thai")[index - 1].classList.remove("active-flag");
                // Unterstreichung anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 1].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .eng")[index - 1].previousElementSibling.classList.add("active");
                document.querySelectorAll(".lang-switch .thai")[index - 1].previousElementSibling.classList.remove("active");
            } else if (index === 2) {
                // Alle imgs von dem menu nicht im modal auswählen und die Klassen anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 1].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .eng")[index - 1].classList.add("active-flag");
                document.querySelectorAll(".lang-switch .thai")[index - 1].classList.remove("active-flag");
                // Unterstreichung anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 1].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .eng")[index - 1].previousElementSibling.classList.add("active");
                document.querySelectorAll(".lang-switch .thai")[index - 1].previousElementSibling.classList.remove("active");
                // Alle imgs von dem menu nicht im modal auswählen und die Klassen anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 2].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .eng")[index - 2].classList.add("active-flag");
                document.querySelectorAll(".lang-switch .thai")[index - 2].classList.remove("active-flag");
                // Unterstreichung anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 2].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .eng")[index - 2].previousElementSibling.classList.add("active");
                document.querySelectorAll(".lang-switch .thai")[index - 2].previousElementSibling.classList.remove("active");
            } else {
                // Alle imgs von dem großen menu auswählen und die Klassen anpassen
                document.querySelectorAll(".lang-switch .ger")[index + 1].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .eng")[index + 1].classList.add("active-flag");
                document.querySelectorAll(".lang-switch .thai")[index + 1].classList.remove("active-flag");
                // Unterstreichung anpassen
                document.querySelectorAll(".lang-switch .ger")[index + 1].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .eng")[index + 1].previousElementSibling.classList.add("active");
                document.querySelectorAll(".lang-switch .thai")[index + 1].previousElementSibling.classList.remove("active");
            }
        }

        // Klick-Eventlistener für den eng Button im kleinen menü (Index 0)
        document.querySelectorAll(".lang-switch .eng")[0].addEventListener("click", function() {
            handleEnglishButtonClick(0);
        });

        // Klick-Eventlistener für den eng Button großes menü (Index 1)
        document.querySelectorAll(".lang-switch .eng")[1].addEventListener("click", function() {
            handleEnglishButtonClick(1);
        });
        // Klick-Eventlistener für den eng Button im modal (Index 2)
        document.querySelectorAll(".lang-switch .eng")[2].addEventListener("click", function() {
            handleEnglishButtonClick(2);
        });

        // Funktion für den Klick auf den thai Button
        function handleThaiButtonClick(index) {
            // Alle imgs auswählen und die Klassen anpassen
            document.querySelectorAll(".lang-switch .ger")[index].classList.remove("active-flag");
            document.querySelectorAll(".lang-switch .eng")[index].classList.remove("active-flag");
            document.querySelectorAll(".lang-switch .thai")[index].classList.add("active-flag");
            // Unterstreichung anpassen
            document.querySelectorAll(".lang-switch .ger")[index].previousElementSibling.classList.remove("active");
            document.querySelectorAll(".lang-switch .eng")[index].previousElementSibling.classList.remove("active");
            document.querySelectorAll(".lang-switch .thai")[index].previousElementSibling.classList.add("active");

            if (index === 1) {
                // Alle imgs tags des kleinen menu auswählen und die Klassen anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 1].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .eng")[index - 1].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .thai")[index - 1].classList.add("active-flag");
                // Unterstreichung anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 1].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .eng")[index - 1].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .thai")[index - 1].previousElementSibling.classList.add("active");
            } else if (index === 2) {
                // Alle imgs von dem menu nicht im modal auswählen und die Klassen anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 1].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .eng")[index - 1].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .thai")[index - 1].classList.add("active-flag");
                // Unterstreichung anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 1].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .eng")[index - 1].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .thai")[index - 1].previousElementSibling.classList.add("active");
                // Alle imgs von dem menu nicht im modal auswählen und die Klassen anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 2].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .eng")[index - 2].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .thai")[index - 2].classList.add("active-flag");
                // Unterstreichung anpassen
                document.querySelectorAll(".lang-switch .ger")[index - 2].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .eng")[index - 2].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .thai")[index - 2].previousElementSibling.classList.add("active");
            } else {
                // Alle imgs von dem großen menu auswählen und die Klassen anpassen
                document.querySelectorAll(".lang-switch .ger")[index + 1].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .eng")[index + 1].classList.remove("active-flag");
                document.querySelectorAll(".lang-switch .thai")[index + 1].classList.add("active-flag");
                // Unterstreichung anpassen
                document.querySelectorAll(".lang-switch .ger")[index + 1].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .eng")[index + 1].previousElementSibling.classList.remove("active");
                document.querySelectorAll(".lang-switch .thai")[index + 1].previousElementSibling.classList.add("active");
            }
        }

        // Klick-Eventlistener für den thai Button im kleinen menü (Index 0)
        document.querySelectorAll(".lang-switch .thai")[0].addEventListener("click", function() {
            handleThaiButtonClick(0);
        });

        // Klick-Eventlistener für den thai Button im großen menu (Index 1)
        document.querySelectorAll(".lang-switch .thai")[1].addEventListener("click", function() {
            handleThaiButtonClick(1);
        });

        // Klick-Eventlistener für den thai Button im modal (Index 1)
        document.querySelectorAll(".lang-switch .thai")[2].addEventListener("click", function() {
            handleThaiButtonClick(2);
        });

    }

    switchLang();

}

export function deleteLanguageSwitchModal() {

    // Select the modal element
    $('#modal_welcome').on('hidden.bs.modal', function(event) {
        // do something...
        // Do something when the modal is hidden, e.g. remove the "lang2" div element
        var lang2Div = document.getElementById('lang2');
        if (lang2Div) {
            console.log("removed language buttons modal");
            lang2Div.parentNode.removeChild(lang2Div);
        }
    })

}