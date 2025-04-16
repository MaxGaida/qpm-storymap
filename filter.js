(function () {
    const hiddenStyle = new ol.style.Style({});

    function initFilter() {
        if (!window.vectorSource || !vectorSource.getFeatures().length || !window.styleFunction || !window.c1ColorMap) {
            return setTimeout(initFilter, 200);
        }

        const features = vectorSource.getFeatures();

        // Group c1 -> Set of c2
        const categories = {};
        features.forEach(f => {
            const c1 = f.get("c1") || "Other";
            const c2 = f.get("c2") || "Other";
            if (c1 === "unclear" || c2 === "unclear") return;
            if (!categories[c1]) categories[c1] = new Set();
            categories[c1].add(c2);
        });

        let filterDiv = document.getElementById("filters");
        if (!filterDiv) {
            filterDiv = document.createElement("div");
            filterDiv.id = "filters";
            document.body.appendChild(filterDiv);
        }

        Object.assign(filterDiv.style, {
            position: "fixed",
            top: "0",
            right: "0",
            background: "white",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            boxShadow: "2px 2px 6px rgba(0,0,0,0.15)",
            zIndex: "1000",
            fontFamily: "sans-serif",
            fontSize: "14px",
            maxHeight: "80vh",
            overflowY: "auto"
        });

        filterDiv.innerHTML = "<h4 style='margin-top: 0;'>Filter by category</h4>";

        const controls = document.createElement("div");
        controls.style.marginBottom = "10px";

        const toggleBtn = document.createElement("button");
        toggleBtn.innerText = "Deselect All";
        toggleBtn.className = "toggle-button";


        toggleBtn.addEventListener("click", () => {
            const anyUnchecked = document.querySelectorAll(".c1-filter:not(:checked), .c2-filter:not(:checked)").length > 0;
            const select = anyUnchecked;

            document.querySelectorAll(".c1-filter, .c2-filter").forEach(cb => {
                cb.checked = select;
            });

            toggleBtn.innerText = select ? "Deselect All" : "Select All";
            applyFilter();
        });

        controls.appendChild(toggleBtn);
        filterDiv.appendChild(controls);

        for (const [c1, c2Set] of Object.entries(categories)) {
            const color = c1ColorMap[c1] || "#ccc";

            const c1Container = document.createElement("div");
            c1Container.style.marginBottom = "6px";

            const header = document.createElement("div");
            Object.assign(header.style, {
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                userSelect: "none"
            });

            const toggleIcon = document.createElement("span");
            toggleIcon.textContent = "▶";
            Object.assign(toggleIcon.style, {
                display: "inline-block",
                width: "12px",
                fontSize: "12px",
                marginRight: "4px"
            });

            const c1Checkbox = document.createElement("input");
            c1Checkbox.type = "checkbox";
            c1Checkbox.className = "c1-filter";
            c1Checkbox.value = c1;
            c1Checkbox.checked = true;
            c1Checkbox.style.marginRight = "6px";

            const swatch = document.createElement("span");
            Object.assign(swatch.style, {
                display: "inline-block",
                width: "12px",
                height: "12px",
                margin: "0 6px",
                backgroundColor: color,
                border: "1px solid #999"
            });

            const labelText = document.createTextNode(c1);

            header.appendChild(toggleIcon);
            header.appendChild(c1Checkbox);
            header.appendChild(swatch);
            header.appendChild(labelText);

            const c2List = document.createElement("div");
            c2List.style.marginLeft = "22px";
            c2List.style.display = "none";

            toggleIcon.addEventListener("click", () => {
                const expanded = c2List.style.display !== "none";
                c2List.style.display = expanded ? "none" : "block";
                toggleIcon.textContent = expanded ? "▶" : "▼";
            });

            c1Checkbox.addEventListener("change", () => {
                const c2Checkboxes = c2List.querySelectorAll(`.c2-filter[data-c1="${c1}"]`);
                c2Checkboxes.forEach(cb => cb.checked = c1Checkbox.checked);
                applyFilter();
            });

            for (const c2 of c2Set) {
                const c2Label = document.createElement("label");
                c2Label.style.display = "block";

                const c2Checkbox = document.createElement("input");
                c2Checkbox.type = "checkbox";
                c2Checkbox.className = "c2-filter";
                c2Checkbox.dataset.c1 = c1;
                c2Checkbox.value = c2;
                c2Checkbox.checked = true;

                c2Checkbox.addEventListener("change", () => {
                    const allC2 = c2List.querySelectorAll(`.c2-filter[data-c1="${c1}"]`);
                    const anyChecked = Array.from(allC2).some(cb => cb.checked);
                    c1Checkbox.checked = anyChecked;
                    applyFilter();
                });

                c2Label.appendChild(c2Checkbox);
                c2Label.appendChild(document.createTextNode(" " + c2));
                c2List.appendChild(c2Label);
            }

            c1Container.appendChild(header);
            c1Container.appendChild(c2List);
            filterDiv.appendChild(c1Container);
        }

        console.log("✅ Filter UI with nested c1/c2 + toggles + buttons initialized");
    }

    window.applyFilter = function applyFilter() {
        const selectedDecade = typeof getDecadeFilter === "function" ? getDecadeFilter() : null;
        const decadeMode = typeof getDecadeMode === "function" ? getDecadeMode() : "all";

        const selectedC1 = new Set([...document.querySelectorAll(".c1-filter:checked")].map(cb => cb.value));
        const selectedC2 = new Set([...document.querySelectorAll(".c2-filter:checked")].map(cb => cb.value + "|" + cb.dataset.c1));

        vectorSource.getFeatures().forEach((f) => {
            const c1 = f.get("c1") || f.get("C1");
            const c2 = f.get("c2") || f.get("C2");
            const key = (c2 || "") + "|" + (c1 || "");

            const startRaw = f.get("Start");
            const endRaw = f.get("End");
            const start = startRaw ? parseInt(String(startRaw).slice(0, 4)) : null;
            const end = endRaw ? parseInt(String(endRaw).slice(0, 4)) : new Date().getFullYear();

            const matchesC1 = selectedC1.has(c1);
            const matchesC2 = selectedC2.has(key);

            const matchesDecade =
                decadeMode === "all" || (
                    start !== null &&
                    (
                        (decadeMode === "pre1950" && start <= 1949) ||
                        (decadeMode === "range" && start <= (selectedDecade + 9) && end >= selectedDecade)
                    )
                );

            const visible = matchesC1 && matchesC2 && matchesDecade;
            f.setStyle(visible ? styleFunction(f) : hiddenStyle);
        });
    };

    function toggleAll(select) {
        document.querySelectorAll(".c1-filter, .c2-filter").forEach(cb => {
            cb.checked = select;
        });
        applyFilter();
    }

    initFilter();
})();
