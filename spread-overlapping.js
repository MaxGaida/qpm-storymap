function spreadOverlappingFeatures(features, radius = 15) {
    const coordMap = new Map();

    features.forEach(feature => {
        const geom = feature.getGeometry();
        if (!geom || geom.getType() !== "Point") return;

        const coords = geom.getCoordinates();
        const key = coords.toString();

        if (!coordMap.has(key)) coordMap.set(key, []);
        coordMap.get(key).push(feature);
    });

    for (const group of coordMap.values()) {
        if (group.length === 1) continue;

        const original = group[0].getGeometry().getCoordinates();
        const angleStep = (2 * Math.PI) / (group.length - 1);

        group.forEach((feature, i) => {
            if (i === 0) return; // Keep the first feature in place

            const angle = (i - 1) * angleStep;
            const offsetX = radius * Math.cos(angle);
            const offsetY = radius * Math.sin(angle);
            const newCoords = [original[0] + offsetX, original[1] + offsetY];
            feature.getGeometry().setCoordinates(newCoords);
        });
    }

    return features;
}

window.spreadOverlappingFeatures = spreadOverlappingFeatures;
