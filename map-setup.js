// Default style fallback (used if needed)
const defaultStyle = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({ color: 'blue' }),
        stroke: new ol.style.Stroke({ color: 'white', width: 1 })
    })
});

// Color cache for consistent mapping
const c1ColorMap = {};
const colorPalette = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
    '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
    '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
];

window.c1ColorMap = {};

// Dynamic style function
function styleFunction(feature) {
    const c1 = feature.get("c1") || "Other";

    if (!c1ColorMap[c1]) {
        const nextColor = colorPalette[Object.keys(c1ColorMap).length % colorPalette.length];
        c1ColorMap[c1] = nextColor;
    }

    return new ol.style.Style({
        image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({ color: c1ColorMap[c1] }),
            stroke: new ol.style.Stroke({ color: "white", width: 1 })
        })
    });
}
window.styleFunction = styleFunction;


// Base map
const baseLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attributions: '© OpenStreetMap contributors © CARTO'
    })
});

// Vector layer
const vectorSource = new ol.source.Vector();
const vectorLayer = new ol.layer.Vector({ source: vectorSource });

window.vectorSource = vectorSource;
window.vectorLayer = vectorLayer;

// Map
const map = new ol.Map({
    target: 'map',
    layers: [baseLayer, vectorLayer],
    view: new ol.View({
        center: ol.proj.fromLonLat([-75.1652, 39.9526]),
        zoom: 12
    })
});
window.map = map;

// Load data
fetch('https://raw.githubusercontent.com/MaxGaida/QPM-testing/refs/heads/main/testopenlayers.geojson')
    .then(response => {
        if (!response.ok) throw new Error("Failed to load GeoJSON");
        return response.json();
    })
    .then(data => {
        console.log("Loaded GeoJSON Data:", data);
        loadInitialData(data);
    })
    .catch(error => console.error("Error fetching GeoJSON:", error));

// Load and style data
function loadInitialData(data) {
    const features = new ol.format.GeoJSON().readFeatures(data, {
        featureProjection: 'EPSG:3857'
    });

    spreadOverlappingFeatures(features); // If you use this
    vectorSource.clear();
    vectorSource.addFeatures(features);

    // ✅ Normalize properties: lowercase versions of all keys
    features.forEach(f => {
        const props = f.getProperties();
        for (const key in props) {
            const lower = key.toLowerCase();
            if (key !== lower && !f.get(lower)) {
                f.set(lower, props[key]);
            }
        }
    });

    // ✅ Now style features using normalized "c1"
    features.forEach(f => f.setStyle(styleFunction(f)));

    // ✅ Fuse setup (safe to use lowercase keys now)
    window.fuse = new Fuse(features.map(f => ({
        feature: f,
        ...f.getProperties()
    })), {
        keys: ['Name', 'Address', 'Description', 'Source', 'sex/gender', 'race'],
        includeScore: true,
        threshold: 0.3
    });

    extractClassificationCategories(); // at the end

}

