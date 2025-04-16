document.addEventListener("DOMContentLoaded", function () {
    if (!window.map) {
        console.error("Map not ready. Load this after map-setup.js");
        return;
    }

    let wrapper = document.getElementById("search-wrapper");
    if (!wrapper) {
        console.error("Missing #search-wrapper. Load fuse.js first.");
        return;
    }

    // Ensure wrapper is correctly positioned
    Object.assign(wrapper.style, {
        position: "absolute",
        top: "10px",
        left: "10px",
        background: "rgba(255,255,255,0.95)",
        padding: "10px",
        borderRadius: "10px",
        boxShadow: "2px 2px 5px rgba(0,0,0,0.3)",
        zIndex: "1000",
        maxWidth: "300px"
    });

    const container = document.createElement("div");
    container.style.marginTop = "12px";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Or, search by address...";
    input.className = "search-input";

    const resultsDiv = document.createElement("div");
    resultsDiv.className = "search-results";

    container.appendChild(input);
    container.appendChild(resultsDiv);
    wrapper.appendChild(container);

    const pinSource = new ol.source.Vector();
    const pinLayer = new ol.layer.Vector({ source: pinSource });
    map.addLayer(pinLayer);

    function fetchSuggestions(query) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                resultsDiv.innerHTML = "";

                if (!data || data.length === 0) {
                    resultsDiv.innerHTML = "<p>No matches</p>";
                    return;
                }

                data.forEach(item => {
                    const suggestion = document.createElement("div");
                    suggestion.innerText = item.display_name;
                    suggestion.className = "search-result-item";

                    suggestion.addEventListener("click", () => {
                        const lon = parseFloat(item.lon);
                        const lat = parseFloat(item.lat);
                        const coord = ol.proj.fromLonLat([lon, lat]);

                        input.value = item.display_name;
                        resultsDiv.innerHTML = "";
                        pinSource.clear();

                        const pin = new ol.Feature({
                            geometry: new ol.geom.Point(coord)
                        });

                        pin.setStyle(new ol.style.Style({
                            image: new ol.style.Icon({
                                anchor: [0.5, 1],
                                scale: 0.05,
                                src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png'
                            })
                        }));

                        pinSource.addFeature(pin);

                        map.getView().animate({
                            center: coord,
                            zoom: 16,
                            duration: 1000
                        });
                    });

                    resultsDiv.appendChild(suggestion);
                });
            })
            .catch(err => {
                console.error("Autocomplete failed:", err);
                resultsDiv.innerHTML = "<p>Error fetching suggestions</p>";
            });
    }

    let debounceTimer;
    input.addEventListener("input", () => {
        const query = input.value.trim();
        if (!query) {
            resultsDiv.innerHTML = "";
            return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);
    });
});
