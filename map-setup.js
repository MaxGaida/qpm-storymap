// Create the map
const map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          attributions: '© OpenStreetMap contributors © CARTO'
        })
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([-75.1652, 39.9526]),
      zoom: 13
    })
  });
  
  // Load the vector data
  const vectorSource = new ol.source.Vector({
    url: 'testopenlayers.geojson',
    format: new ol.format.GeoJSON()
  });
  
  const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: null // Start with no visible features
  });

  const overlaySource = new ol.source.Vector();
const overlayLayer = new ol.layer.Vector({ source: overlaySource });
map.addLayer(overlayLayer);

  
  map.addLayer(vectorLayer);
  
  // Expose globally for story.js to control
  window.map = map;
  window.vectorSource = vectorSource;
  window.vectorLayer = vectorLayer;
  