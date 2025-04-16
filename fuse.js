function createSearchUI() {
    let wrapper = document.getElementById("search-wrapper");
    if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.id = "search-wrapper";
        wrapper.className = "search-wrapper";
        document.body.appendChild(wrapper);
    }

    const searchDiv = document.createElement("div");
    searchDiv.style.marginBottom = "12px";

    const inputRow = document.createElement("div");
    inputRow.style.display = "flex";
    inputRow.style.alignItems = "center";
    inputRow.style.gap = "6px";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.id = "search-bar";
    searchInput.placeholder = "Search for anything...";
    searchInput.className = "search-input";

    const toggleButton = document.createElement("button");
    toggleButton.innerText = "Highlight All";
    toggleButton.className = "map-button highlight-toggle";

    let highlightsActive = false;

    toggleButton.addEventListener("click", () => {
        if (!window.fuse) return;
        const searchQuery = searchInput.value.toLowerCase();
        const results = fuse.search(searchQuery);

        if (highlightsActive) {
            vectorSource.getFeatures().forEach(feature => {
                feature.setStyle(defaultStyle);
            });
            toggleButton.innerText = "Highlight All";
            highlightsActive = false;
        } else {
            results.forEach(result => {
                const feature = result.item.feature;
                feature.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 8,
                        fill: new ol.style.Fill({ color: "yellow" }),
                        stroke: new ol.style.Stroke({ color: "black", width: 2 })
                    })
                }));
            });
            toggleButton.innerText = "Deselect All";
            highlightsActive = true;
        }
    });

    const resultsDiv = document.createElement("div");
    resultsDiv.id = "search-results";
    resultsDiv.className = "search-results";

    inputRow.appendChild(searchInput);
    inputRow.appendChild(toggleButton);

    searchDiv.appendChild(inputRow);
    searchDiv.appendChild(resultsDiv);
    wrapper.appendChild(searchDiv);

    searchInput.addEventListener("input", function () {
        searchFeatures(this.value.toLowerCase());
        highlightsActive = false;
        toggleButton.innerText = "Highlight All";
    });
}

function searchFeatures(query) {
    const resultsDiv = document.getElementById("search-results");
    resultsDiv.innerHTML = "";

    if (!query || !window.fuse) return;

    const results = fuse.search(query);

    if (results.length === 0) {
        resultsDiv.innerHTML = "<p>No results found</p>";
        return;
    }

    results.forEach(result => {
        const feature = result.item.feature;
        const label = result.item.Name || "Unnamed Location";

        const resultItem = document.createElement("div");
        resultItem.innerText = label;
        resultItem.className = "search-result-item";

        resultItem.addEventListener("click", () => {
            highlightFeature(feature);
        });

        resultsDiv.appendChild(resultItem);
    });
}

function highlightFeature(feature) {
    const geometry = feature.getGeometry();
    const coords = geometry.getCoordinates();

    feature.setStyle(null);
    feature.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            fill: new ol.style.Fill({ color: 'yellow' }),
            stroke: new ol.style.Stroke({ color: 'black', width: 2 })
        })
    }));

    map.getView().animate({
        center: coords,
        zoom: Math.min(map.getView().getZoom() + 2, 16),
        duration: 1000
    });
}

function highlightAllSearchResults() {
    const searchQuery = document.getElementById("search-bar").value.toLowerCase();
    if (!searchQuery || !window.fuse) return;

    const results = fuse.search(searchQuery);

    results.forEach(result => {
        const feature = result.item.feature;

        feature.setStyle(null);
        feature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({ color: "yellow" }),
                stroke: new ol.style.Stroke({ color: "black", width: 2 })
            })
        }));
    });

    console.log(`Highlighted ${results.length} matching features.`);
}

function deselectAllSearchResults() {
    vectorSource.getFeatures().forEach(feature => {
        feature.setStyle(defaultStyle);
    });
    console.log("Deselected all highlighted features.");
}

document.addEventListener("DOMContentLoaded", createSearchUI);