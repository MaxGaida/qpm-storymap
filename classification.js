// classification.js

let classificationLayer = null;
let genderColors = {};
let raceColors = {};
let selectedGenderValues = new Set();
let selectedRaceValues = new Set();
let currentOverlay = null; // "sex/gender" or "race"

function generateColorMap(categories) {
    const basePalette = [
        '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
        '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
        '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
        '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
    ];
    const colorMap = {};
    categories.forEach((category, i) => {
        if (category === "Unclassified" || category === "Unclear") {
            colorMap["Unclassified"] = "#999999";
        } else {
            colorMap[category] = basePalette[i % basePalette.length];
        }
    });
    return colorMap;
}

function extractClassificationCategories() {
    if (!window.vectorSource || !vectorSource.getFeatures().length) {
        return setTimeout(extractClassificationCategories, 500);
    }

    const uniqueGenders = new Set();
    const uniqueRaces = new Set();

    vectorSource.getFeatures().forEach(f => {
        let gender = f.get("sex/gender") || "Unclassified";
        let race = f.get("race") || "Unclassified";
        if (gender === "Unclear") gender = "Unclassified";
        if (race === "Unclear") race = "Unclassified";
        uniqueGenders.add(gender);
        uniqueRaces.add(race);
    });

    genderColors = generateColorMap([...uniqueGenders]);
    raceColors = generateColorMap([...uniqueRaces]);
    selectedGenderValues = new Set(uniqueGenders);
    selectedRaceValues = new Set(uniqueRaces);

    createClassificationFilterUI();
}

function createClassificationFilterUI() {
    const filterDiv = document.getElementById("filters");
    if (!filterDiv) return;

    const container = document.createElement("div");
    container.style.marginTop = "15px";

    const title = document.createElement("h4");
    title.innerText = "Overlay by:";
    container.appendChild(title);

    const genderBtn = document.createElement("button");
    genderBtn.innerText = "Sex/Gender";
    genderBtn.className = "map-button";

    const raceBtn = document.createElement("button");
    raceBtn.innerText = "Race";
    raceBtn.className = "map-button";

    genderBtn.addEventListener("click", () => toggleClassificationLayer("sex/gender"));
    raceBtn.addEventListener("click", () => toggleClassificationLayer("race"));

    container.appendChild(genderBtn);
    container.appendChild(raceBtn);

    const optionsDiv = document.createElement("div");
    optionsDiv.id = "classification-options";
    optionsDiv.style.marginTop = "10px";
    optionsDiv.style.padding = "0";
    optionsDiv.style.border = "none";
    optionsDiv.style.background = "transparent";
    container.appendChild(optionsDiv);

    filterDiv.appendChild(container);
}

function toggleClassificationLayer(attribute) {
    if (classificationLayer) {
        map.removeLayer(classificationLayer);
        classificationLayer = null;
        currentOverlay = null;
        document.getElementById("classification-options").innerHTML = "";
        return;
    }

    currentOverlay = attribute;
    const colorMap = attribute === "sex/gender" ? genderColors : raceColors;
    const selectedSet = attribute === "sex/gender" ? selectedGenderValues : selectedRaceValues;

    buildClassificationOptions(attribute, colorMap, selectedSet);
    applyClassificationFilter();
}

function buildClassificationOptions(attribute, colorMap, selectedSet) {
    const optionsDiv = document.getElementById("classification-options");
    optionsDiv.innerHTML = `<strong>Filter ${attribute}:</strong><br>`;

    const toggleBtn = document.createElement("button");
    toggleBtn.innerText = "Deselect All";
    toggleBtn.className = "toggle-button";

    const checkboxes = [];

    const visibleValues = new Set();
    vectorSource.getFeatures().forEach(f => {
        let val = f.get(attribute) || "Unclassified";
        if (val === "Unclear") val = "Unclassified";
        const style = f.getStyle();
        if (!style || !style.getImage()) return;
        visibleValues.add(val);
    });

    Object.keys(colorMap).forEach(key => {
        if (!visibleValues.has(key)) return;

        const label = document.createElement("label");
        label.style.display = "flex";
        label.style.alignItems = "center";
        label.style.marginBottom = "3px";

        const swatch = document.createElement("span");
        swatch.className = "color-swatch";
        swatch.style.backgroundColor = colorMap[key];

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.value = key;
        cb.checked = true;
        cb.style.marginRight = "6px";

        cb.addEventListener("change", () => {
            if (cb.checked) selectedSet.add(key);
            else selectedSet.delete(key);
            applyClassificationFilter();
            updateToggleText();
        });

        checkboxes.push(cb);

        label.appendChild(cb);
        label.appendChild(swatch);
        label.appendChild(document.createTextNode(key));
        optionsDiv.appendChild(label);
    });

    toggleBtn.addEventListener("click", () => {
        const allChecked = checkboxes.every(cb => cb.checked);
        checkboxes.forEach(cb => {
            cb.checked = !allChecked;
            if (!allChecked) selectedSet.add(cb.value);
            else selectedSet.delete(cb.value);
        });
        toggleBtn.innerText = allChecked ? "Select All" : "Deselect All";
        applyClassificationFilter();
    });

    function updateToggleText() {
        const allChecked = checkboxes.every(cb => cb.checked);
        toggleBtn.innerText = allChecked ? "Deselect All" : "Select All";
    }

    optionsDiv.prepend(toggleBtn);
}

function applyClassificationFilter() {
    if (!currentOverlay) return;

    const colorMap = currentOverlay === "sex/gender" ? genderColors : raceColors;
    const selectedSet = currentOverlay === "sex/gender" ? selectedGenderValues : selectedRaceValues;
    const source = new ol.source.Vector();

    vectorSource.getFeatures().forEach(f => {
        let val = f.get(currentOverlay) || "Unclassified";
        if (val === "Unclear") val = "Unclassified";
        const style = f.getStyle();
        if (!style || !style.getImage()) return;
        if (!selectedSet.has(val)) return;

        const overlayFeature = f.clone();
        overlayFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({ color: colorMap[val] || "#999999" }),
                stroke: new ol.style.Stroke({ color: "black", width: 1 })
            })
        }));

        source.addFeature(overlayFeature);
    });

    if (classificationLayer) {
        map.removeLayer(classificationLayer);
    }

    classificationLayer = new ol.layer.Vector({ source });
    map.addLayer(classificationLayer);
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(extractClassificationCategories, 1000);
});