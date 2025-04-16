// clean.js

window.cleanedGeoJSON = null; // Global variable for filtered data

function cleanGeoJSON(data) {
    const filteredFeatures = data.features.filter(feature => {
        const props = feature.properties || {};
        const isPublic = props.public !== "no";
        const isC1Clean = props.c1 !== "unclear";
        const isC2Clean = props.c2 !== "unclear";

        return isPublic && isC1Clean && isC2Clean;
    });

    return {
        type: "FeatureCollection",
        features: filteredFeatures
    };
}

// Fetch, clean, and store the data globally
fetch('https://raw.githubusercontent.com/MaxGaida/QPM-testing/refs/heads/main/testopenlayers.geojson')
    .then(response => {
        if (!response.ok) throw new Error("Failed to load GeoJSON");
        return response.json();
    })
    .then(rawData => {
        window.cleanedGeoJSON = cleanGeoJSON(rawData);
        console.log("Cleaned GeoJSON:", window.cleanedGeoJSON);
    })
    .catch(error => console.error("Error fetching or cleaning GeoJSON:", error));
