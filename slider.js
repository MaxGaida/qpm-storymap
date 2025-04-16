(function () {
    if (!window.vectorSource || !window.applyFilter) {
        return setTimeout(arguments.callee, 200); // Wait until map and filters are ready
    }

    let showAllActive = true;
    let slider;

    function createDecadeSlider(minYear = 1950, maxYear = 2020) {
        const pre1950Value = minYear - 10;

        const bar = document.createElement("div");
        bar.id = "decade-slider-bar";
        Object.assign(bar.style, {
            position: "fixed",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255, 255, 255, 0.95)",
            padding: "10px 20px",
            borderBottom: "1px solid #ccc",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            zIndex: "1001",
            textAlign: "center"
        });

        const label = document.createElement("label");
        label.innerText = "Show data from:";
        label.style.marginRight = "10px";
        label.style.fontWeight = "bold";

        slider = document.createElement("input");
        slider.type = "range";
        slider.min = pre1950Value;
        slider.max = maxYear;
        slider.step = 10;
        slider.value = minYear;
        slider.id = "decade-slider";
        slider.className = "slider-control";

        const valueDisplay = document.createElement("span");
        valueDisplay.innerText = `${slider.value}s`;
        valueDisplay.style.fontWeight = "bold";

        const showAllBtn = document.createElement("button");
        showAllBtn.innerText = "Show All";
        showAllBtn.className = "map-button";

        showAllBtn.addEventListener("click", () => {
            showAllActive = true;
            valueDisplay.innerText = `All decades`;
            applyFilter();
        });

        slider.addEventListener("input", () => {
            showAllActive = false;
            const val = parseInt(slider.value);
            valueDisplay.innerText = val === pre1950Value ? "pre-1950" : `${val}s`;
            applyFilter();
        });

        bar.appendChild(label);
        bar.appendChild(slider);
        bar.appendChild(valueDisplay);
        bar.appendChild(showAllBtn);

        document.body.appendChild(bar);

        window.getDecadeFilter = () => {
            if (showAllActive) return null;
            return parseInt(slider.value);
        };

        window.getDecadeMode = () => {
            if (showAllActive) return "all";
            return slider.value === String(pre1950Value) ? "pre1950" : "range";
        };
    }

    createDecadeSlider(1950, 2020);
})();
