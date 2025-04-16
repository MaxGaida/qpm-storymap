// Avoid duplicate creation of popupDiv
let popupDiv = document.getElementById('popup');

if (!popupDiv) {
    popupDiv = document.createElement('div');
    popupDiv.setAttribute('id', 'popup');
    popupDiv.style.position = 'absolute';
    popupDiv.style.backgroundColor = 'white';
    popupDiv.style.border = '1px solid black';
    popupDiv.style.padding = '10px';
    popupDiv.style.display = 'none';
    popupDiv.style.zIndex = '1000';
    popupDiv.style.maxWidth = '300px';
    popupDiv.style.wordWrap = 'break-word';
    document.body.appendChild(popupDiv);
}

// Function to calculate decades from the start and end years
function calculateDecades(startYear, endYear) {
    if (!startYear || !endYear) return 'Unknown';

    const startDecade = Math.floor(startYear / 10) * 10;
    const endDecade = Math.floor(endYear / 10) * 10;

    if (startDecade === endDecade) {
        return `${startDecade}s`;
    } else {
        return `${startDecade}s – ${endDecade}s`;
    }
}

// Utility to avoid blank/null data
function getDataOrBlank(data) {
    return data ? data : '';
}

// Ensure the map is initialized before handling clicks
if (!map) {
    console.error('Error: "map" is not defined. Please initialize the map before using it.');
} else {
    // Handle clicking on features
    map.on('singleclick', function (event) {
        const feature = map.forEachFeatureAtPixel(event.pixel, function (feat) {
            return feat;
        });

        if (feature) {
            const properties = feature.getProperties();

            const startYear = properties['Start'] ? parseInt(properties['Start'].split('-')[0]) : null;
            const endYear = properties['End'] ? parseInt(properties['End'].split('-')[0]) : null;
            const decades = calculateDecades(startYear, endYear);

            const name = getDataOrBlank(properties['Name']);
            const address = getDataOrBlank(properties['Address']);
            const sexGender = getDataOrBlank(properties['sex/gender']);
            const race = getDataOrBlank(properties['race']);
            const description = getDataOrBlank(properties['Description']);
            const source = getDataOrBlank(properties['Source']);

            const popupContent = `
    <div style="text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 6px;">
        ${name}
    </div>

    <table style="margin-bottom: 10px;">
        <tr><td style="font-weight: bold; padding-right: 10px;">Address:</td><td>${address}</td></tr>
        <tr><td style="font-weight: bold; padding-right: 10px;">Active:</td><td>${decades}</td></tr>
        ${sexGender && sexGender.toLowerCase() !== 'unclear' 
            ? `<tr><td style="font-weight: bold; padding-right: 10px;">Sexuality:</td><td>${sexGender}</td></tr>` 
            : ''}
        ${race && race.toLowerCase() !== 'unclear' 
            ? `<tr><td style="font-weight: bold; padding-right: 10px;">Race:</td><td>${race}</td></tr>` 
            : ''}
    </table>

    <hr style="margin: 10px 0;" />
    <div style="text-align: justify;">${description}</div>
    <div style="margin-top: 10px;"><strong>Source:</strong> ${source}</div>
`;


            popupDiv.innerHTML = popupContent;

            // Convert event.coordinate to screen position
            const pixel = map.getPixelFromCoordinate(event.coordinate);
            popupDiv.style.left = `${pixel[0] + 10}px`;
            popupDiv.style.top = `${pixel[1] + 10}px`;

            popupDiv.style.display = 'block';
        } else {
            popupDiv.style.display = 'none';
        }
    });
}
