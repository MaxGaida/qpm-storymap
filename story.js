const skibaStyle = new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({ color: 'pink' }),
      stroke: new ol.style.Stroke({ color: '#fff', width: 1 })
    })
  });
  
  function isSkiba(feature) {
    const source = feature.get('source');
    return source && source.toLowerCase().includes('skiba lgbt');
  }
  
  function showSkibaChapter() {
    document.getElementById('story-title').innerText = "Bob Skiba’s LGBT Mapping Project";
    document.getElementById('story-description').innerText = "This chapter highlights locations documented by Bob Skiba.";
  
    map.getView().animate({
      center: ol.proj.fromLonLat([-75.1652, 39.9526]),
      zoom: 14,
      duration: 1000
    });
  
    vectorSource.getFeatures().forEach(f => {
      if (isSkiba(f)) {
        f.setStyle(skibaStyle);
      } else {
        f.setStyle(null); // hide others or reset to default
      }
    });
  }
  
  showSkibaChapter();
  
  {
    title: "South Street & 4th",
    description: "Zooming in to South Street and 4th — a key site for queer nightlife.",
    view: {
      center: [-75.1497, 39.9416], // Approximate coordinates for 4th & South
      zoom: 17
    },
    filter: f => true // Keep all features for now, or you can customize
  }
  