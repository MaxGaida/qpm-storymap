// --- Styles ---
const skibaStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 4,
    fill: new ol.style.Fill({ color: 'hotpink' }),
    stroke: new ol.style.Stroke({ color: '#fff', width: 1 })
  })
});

const skibaAdditionalStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 4,
    fill: new ol.style.Fill({ color: '#14d1e7' }), // pastel blue
    stroke: new ol.style.Stroke({ color: '#fff', width: 1 })
  })
});

const barDotStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 5.5,
    fill: new ol.style.Fill({ color: "#77b5f7" }),
    stroke: new ol.style.Stroke({ color: "#fff", width: 1 })
  })
});

function getYear(dateRaw) {
  return (typeof dateRaw === "string" && /^\d{4}/.test(dateRaw))
    ? parseInt(dateRaw.slice(0, 4))
    : null;
}

let currentOverlayFeature = null;


const c1ColorMap = {
  "business": "#77b5f7",
  "celebrations & socials": "#ffb347",
  "organizations": "#7cd992",
  "activism & protest": "#f790c0",
  "violence & policing": "#b695e0"
};

const allowedC1 = new Set(Object.keys(c1ColorMap));

const categoryStyle = feature => {
  const c1 = feature.get("c1")?.toLowerCase();
  if (!allowedC1.has(c1)) return null;
  return new ol.style.Style({
    image: new ol.style.Circle({
      radius: 4,
      fill: new ol.style.Fill({ color: c1ColorMap[c1] }),
      stroke: new ol.style.Stroke({ color: "#fff", width: 1 })
    })
  });
};

const defaultStyle = categoryStyle;

function updateLegend(show) {
  const legendDiv = document.getElementById("legend");
  if (!show) {
    legendDiv.innerHTML = "";
    legendDiv.style.display = "none";
    return;
  }

  legendDiv.innerHTML = `<strong>Category Legend</strong><br>` + Object.entries(c1ColorMap).map(([key, color]) => `
    <div class="legend-item">
      <div class="legend-color" style="background:${color}"></div>
      <span>${key.charAt(0).toUpperCase() + key.slice(1)}</span>
    </div>
  `).join("");

  legendDiv.style.display = "block";
}

// --- Chapter logic ---
const chapters = [
  {
    title: "Welcome to Queer Philadelphia",
    description: "Explore queer spaces in Philadelphia across time. Click 'Next' to begin.",
    view: {
      center: [-75.17438, 39.97648],
      zoom: 12
    },
    filter: f => false,
    style: null
  },
  {
    title: "Bob Skiba’s LGBT Mapping Project",
    description: "This chapter highlights locations documented by Bob Skiba.",
    view: {
      center: [-75.17438, 39.97648],
      zoom: 12
    },
    filter: f => {
      const source = f.get("Source");
      return source && source.toLowerCase().includes("skiba lgbt");
    },
    style: skibaStyle
  },
  {
    title: "Bob Skiba’s LGBT Mapping Project (Expanded)",
    description: "This chapter adds additional archival sources that complement Skiba's original data.",
    view: {
      center: [-75.17438, 39.97648],
      zoom: 12
    },
    filter: f => true,
    style: f => {
      const source = f.get("Source") || "";
      return source.toLowerCase() === "skiba lgbt" ? skibaStyle : skibaAdditionalStyle;
    }
  },
  {
    title: "Full Map by Category",
    description: "All known queer spaces, color-coded by category.",
    view: {
      center: [-75.17438, 39.97648],
      zoom: 12
    },
    filter: f => {
      const c1 = (f.get("c1") || "").toLowerCase();
      return allowedC1.has(c1);
    },
    style: defaultStyle,
    showLegend: true
  },
  {
    title: "Focus on the Gayborhood",
    description: "Zooming into Locust & 13th Street, the heart of Philadelphia’s Gayborhood.",
    view: {
      center: [-75.16416, 39.94907],
      zoom: 14
    },
    filter: f => allowedC1.has((f.get("c1") || "").toLowerCase()),
    style: f => {
      const c1 = (f.get("c1") || "").toLowerCase();
      const color = c1ColorMap[c1];
      return color ? new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5.5,
          fill: new ol.style.Fill({ color }),
          stroke: new ol.style.Stroke({ color: "#fff", width: 1 })
        })
      }) : null;
    },
    showLegend: true
  },
  {
    title: "Bars in the Gayborhood",
    description: "Focusing on bars located around Locust & 13th Street, which formed the backbone of queer nightlife.",
    view: {
      center: [-75.16416, 39.94907],
      zoom: 14
    },
    filter: f => (f.get("c2") || "").toLowerCase() === "nightlife",
    style: barDotStyle,
    showLegend: false
  },
  {
    title: "1950s Nightlife",
    description: "Bars open at any point between 1950 and 1959.",
    view: {
      center: [-75.16416, 39.94907],
      zoom: 14
    },
    filter: f => {
      const c2 = (f.get("c2") || "").toLowerCase();
      const start = getYear(f.get("Start"));
      const end = getYear(f.get("End")) || new Date().getFullYear();
      return c2 === "nightlife" && start <= 1959 && end >= 1950;
    },
    style: barDotStyle
  },
  {
    title: "1960s Nightlife",
    description: "Bars open at any point between 1960 and 1969.",
    view: {
      center: [-75.16416, 39.94907],
      zoom: 14
    },
    filter: f => {
      const c2 = (f.get("c2") || "").toLowerCase();
      const start = getYear(f.get("Start"));
      const end = getYear(f.get("End")) || new Date().getFullYear();
      return c2 === "nightlife" && start <= 1969 && end >= 1960;
    },
    style: barDotStyle
  },
  {
    title: "1970s Nightlife",
    description: "Bars open at any point between 1970 and 1979.",
    view: {
      center: [-75.16416, 39.94907],
      zoom: 14
    },
    filter: f => {
      const c2 = (f.get("c2") || "").toLowerCase();
      const start = getYear(f.get("Start"));
      const end = getYear(f.get("End")) || new Date().getFullYear();
      return c2 === "nightlife" && start <= 1979 && end >= 1970;
    },
    style: barDotStyle
  },
  {
    title: "1980s Nightlife",
    description: "Bars open at any point between 1980 and 1989.",
    view: {
      center: [-75.16416, 39.94907],
      zoom: 14
    },
    filter: f => {
      const c2 = (f.get("c2") || "").toLowerCase();
      const start = getYear(f.get("Start"));
      const end = getYear(f.get("End")) || new Date().getFullYear();
      return c2 === "nightlife" && start <= 1989 && end >= 1980;
    },
    style: barDotStyle
  },
  {
    title: "1990s Nightlife",
    description: "Bars open at any point between 1990 and 1999.",
    view: {
      center: [-75.16416, 39.94907],
      zoom: 14
    },
    filter: f => {
      const c2 = (f.get("c2") || "").toLowerCase();
      const start = getYear(f.get("Start"));
      const end = getYear(f.get("End")) || new Date().getFullYear();
      return c2 === "nightlife" && start <= 1999 && end >= 1990;
    },
    style: barDotStyle
  },
  {
    title: "What Remained by the late 1990s",
    description: "Bars still open in the 1990s are shown in blue; those from the '70s and '80s that had closed are in pink.",
    view: {
      center: [-75.16416, 39.94907],
      zoom: 14
    },
    filter: f => {
      const c2 = (f.get("c2") || "").toLowerCase();
      const startRaw = f.get("Start");
      const endRaw = f.get("End");
      const start = startRaw ? parseInt(String(startRaw).slice(0, 4)) : null;
      const end = endRaw ? parseInt(String(endRaw).slice(0, 4)) : new Date().getFullYear();
      return c2 === "nightlife" && start !== null;
    },
    style: f => {
      const startRaw = f.get("Start");
      const endRaw = f.get("End");
      const start = startRaw ? parseInt(String(startRaw).slice(0, 4)) : null;
      const end = endRaw ? parseInt(String(endRaw).slice(0, 4)) : new Date().getFullYear();

      if (start <= 1989 && end < 1990) {
        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: 5.5,
            fill: new ol.style.Fill({ color: "#f26c8d" }),
            stroke: new ol.style.Stroke({ color: "#fff", width: 1 })
          })
        });
      } else if (start <= 2009 && end >= 1995) {
        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: 5.5,
            fill: new ol.style.Fill({ color: "#77b5f7" }),
            stroke: new ol.style.Stroke({ color: "#fff", width: 1 })
          })
        });
      }
      return null;
    }
  },
  {
    title: "The Gayborhood in Context",
    description: "A transparent box highlights the Gayborhood. Blue dots show bars open in the 1990s; pink dots show those from the '70s/'80s that had closed.",
    view: {
      center: [-75.16416, 39.94907],
      zoom: 14
    },
    filter: f => {
      const c2 = (f.get("c2") || "").toLowerCase();
      const startRaw = f.get("Start");
      const endRaw = f.get("End");
      const start = startRaw ? parseInt(String(startRaw).slice(0, 4)) : null;
      const end = endRaw ? parseInt(String(endRaw).slice(0, 4)) : new Date().getFullYear();
      return c2 === "nightlife" && start !== null;
    },
    style: f => {
      const startRaw = f.get("Start");
      const endRaw = f.get("End");
      const start = startRaw ? parseInt(String(startRaw).slice(0, 4)) : null;
      const end = endRaw ? parseInt(String(endRaw).slice(0, 4)) : new Date().getFullYear();

      if (start <= 1989 && end < 1990) {
        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: 5.5,
            fill: new ol.style.Fill({ color: "#f26c8d" }),
            stroke: new ol.style.Stroke({ color: "#fff", width: 1 })
          })
        });
      } else if (start <= 2009 && end >= 1995) {
        return new ol.style.Style({
          image: new ol.style.Circle({
            radius: 5.5,
            fill: new ol.style.Fill({ color: "#77b5f7" }),
            stroke: new ol.style.Stroke({ color: "#fff", width: 1 })
          })
        });
      }
      return null;
    },
    overlay: {
      type: "polygon",
      coordinates: [
        [-75.16378955918556, 39.95082600450965],
        [-75.16491452446806, 39.94559687223659],
        [-75.15983516607132, 39.944926831889404],
        [-75.15865179283801, 39.950202522306085],
        [-75.16378955918556, 39.95082600450965]
        
      ]
      
      ,
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#ff69b4',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 105, 180, 0.1)' // transparent pink
        })
      })
    }
  }, 
  {
    title: "Black Nightlife in the Gayborhood",
    description: "Only nightlife spaces listed as Black in the archives are shown. A green dot highlights each one within the Gayborhood.",
    view: {
      center: [-75.16416, 39.94907],
      zoom: 14
    },
    filter: f => {
      const c2 = (f.get("c2") || "").toLowerCase();
      const race = (f.get("race") || "").toLowerCase();
      return c2 === "nightlife" && race === "black";
    },
    style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5.5,
        fill: new ol.style.Fill({ color: "#28a745" }), // a distinct green
        stroke: new ol.style.Stroke({ color: "#fff", width: 1 })
      })
    }),
    overlay: {
      type: "polygon",
      coordinates: [
        [-75.16378955918556, 39.95082600450965],
[-75.16491452446806, 39.94559687223659],
[-75.15983516607132, 39.944926831889404],
[-75.15865179283801, 39.950202522306085],
[-75.16378955918556, 39.95082600450965]

      ],
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#ff69b4',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 105, 180, 0.1)' // light pink transparent
        })
      })
    }
  },

  {
    title: "Lesbian Bars in the Gayborhood",
    description: "Nightlife spaces identified as lesbian bars are highlighted in purple within the Gayborhood.",
    view: {
      center: [-75.16416, 39.94907],
      zoom: 14
    },
    filter: f => {
      const c2 = (f.get("c2") || "").toLowerCase();
      const gender = (f.get("sex/gender") || "").toLowerCase();
      return c2 === "nightlife" && gender === "lesbian";
    },
    style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5.5,
        fill: new ol.style.Fill({ color: "#b36ff6" }), // purple
        stroke: new ol.style.Stroke({ color: "#fff", width: 1 })
      })
    }),
    overlay: {
      type: "polygon",
      coordinates: [
        [-75.16378955918556, 39.95082600450965],
[-75.16491452446806, 39.94559687223659],
[-75.15983516607132, 39.944926831889404],
[-75.15865179283801, 39.950202522306085],
[-75.16378955918556, 39.95082600450965]

      ],
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#ff69b4',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 105, 180, 0.1)' // transparent pink
        })
      })
    }
  },
  {
    title: "Lesbian Bars by Longevity (Size)",
    description: "The longer a lesbian bar remained open, the larger its dot. Estimated date ranges are shown as small gray dots.",
    view: { center: [-75.16416, 39.94907], zoom: 14 },
    filter: f => {
      const c2 = (f.get("c2") || "").toLowerCase();
      const gender = (f.get("sex/gender") || "").toLowerCase();
      const start = getYear(f.get("Start"));
      const end = getYear(f.get("End")) || new Date().getFullYear();
      return c2 === "nightlife" && gender === "lesbian" && start !== null;
    },
    style: f => {
      const start = getYear(f.get("Start"));
      const end = getYear(f.get("End")) || new Date().getFullYear();
      const duration = end - start;
  
      let radius;
      let color = "#b47ae4"; // consistent purple tone
  
      if (duration === 4) {
        radius = 3;
        color = "#aaa";
      } else if (duration < 1) {
        radius = 4;
      } else if (duration < 5) {
        radius = 5;
      } else if (duration < 10) {
        radius = 6;
      } else {
        radius = 7;
      }
  
      return new ol.style.Style({
        image: new ol.style.Circle({
          radius,
          fill: new ol.style.Fill({ color }),
          stroke: new ol.style.Stroke({ color: "#fff", width: 1 })
        })
      });
    },
    overlay: {
      type: "polygon",
      coordinates: [
        [-75.16378955918556, 39.95082600450965],
        [-75.16491452446806, 39.94559687223659],
        [-75.15983516607132, 39.944926831889404],
        [-75.15865179283801, 39.950202522306085],
        [-75.16378955918556, 39.95082600450965]
      ],
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#ff69b4',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 105, 180, 0.1)'
        })
      })
    }
  }
  
];

// --- Chapter display ---
let current = 0;

function showChapter(index) {
  const chapter = chapters[index];
  document.getElementById('story-title').innerText = chapter.title;
  document.getElementById('story-description').innerText = chapter.description;

  map.getView().animate({
    center: ol.proj.fromLonLat(chapter.view.center),
    zoom: chapter.view.zoom,
    duration: 1000
  }, () => map.render());

  setTimeout(() => {
    vectorSource.getFeatures().forEach(f => {
      f.setStyle(null);
      if (chapter.filter(f)) {
        const style = typeof chapter.style === "function" ? chapter.style(f) : chapter.style;
        f.setStyle(style);
      }
    });
  }, 300);

  const legend = document.getElementById("legend");
  if (chapter.showLegend) {
    legend.innerHTML = `<strong>Category Legend</strong><br>` + Object.entries(c1ColorMap).map(([key, color]) => `
      <div style="margin: 4px 0;"><span style="display:inline-block;width:12px;height:12px;background:${color};margin-right:6px;border-radius:50%;border:1px solid #999;"></span>${key}</div>
    `).join("");
    legend.style.display = "block";
  } else {
    legend.style.display = "none";
  }

  if (chapter.overlay && chapter.overlay.type === "box") {
    console.log("Overlay added for chapter:", chapter.title);

    if (window.overlayLayer) {
      map.removeLayer(window.overlayLayer);
    }
  
    const feature = new ol.Feature({
      geometry: ol.geom.Polygon.fromExtent(chapter.overlay.extent)
    });
  
    feature.setStyle(chapter.overlay.style);
  
    window.overlayLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [feature]
      })
    });
  
    map.addLayer(window.overlayLayer);
  } else {
    if (window.overlayLayer) {
      map.removeLayer(window.overlayLayer);
      window.overlayLayer = null;
    }
  }

  if (currentOverlayFeature) {
    overlaySource.removeFeature(currentOverlayFeature);
    currentOverlayFeature = null;
  }
  
  if (chapter.overlay) {
    let feature;
  
    if (chapter.overlay.type === "box") {
      const extent = chapter.overlay.extent;
      const polygon = ol.geom.Polygon.fromExtent(extent);
      feature = new ol.Feature(polygon);
    }
  
    if (chapter.overlay.type === "polygon") {
      const coords = chapter.overlay.coordinates.map(coord =>
        ol.proj.fromLonLat(coord)
      );
      const polygon = new ol.geom.Polygon([coords]);
      feature = new ol.Feature(polygon);
    }
  
    if (feature) {
      feature.setStyle(chapter.overlay.style);
      overlaySource.addFeature(feature);
      currentOverlayFeature = feature;
    }
  }
  
  
}

function nextChapter() {
  if (current < chapters.length - 1) {
    current++;
    showChapter(current);
  }
}

function prevChapter() {
  if (current > 0) {
    current--;
    showChapter(current);
  }
}

window.nextChapter = nextChapter;
window.prevChapter = prevChapter;

vectorSource.once('change', function () {
  if (vectorSource.getState() === 'ready') {
    showChapter(current);
  }
});
