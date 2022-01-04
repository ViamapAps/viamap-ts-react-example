declare var mapboxgl: any;

const POITYPES: any = {
    'daycare': {
        name: 'Daginstitution',
        icon: 'daycare',
        transtype: 'foot'
    },
    'doctor': {
        name: 'Læge',
        icon: 'doctor',
        transtype: 'foot'
    },
    'hospital': {
        name: 'Hospital',
        icon: 'hospital',
        transtype: 'car'
    },
    'junction': {
        name: 'Motorvej',
        icon: 'junction',
        transtype: 'car'
    },
    'metro': {
        name: 'Metro',
        icon: 'metro',
        transtype: 'foot'
    },
    'school': {
        name: 'Skole',
        icon: 'school',
        transtype: 'foot'
    },
    'stop': {
        name: 'Stoppested',
        icon: 'stop',
        transtype: 'foot'
    },
    'strain': {
        name: 'S-Tog',
        icon: 'strain',
        transtype: 'foot'
    },
    'supermarket': {
        name: 'Supermarked',
        icon: 'supermarket',
        transtype: 'foot'
    },
    'train': {
        name: 'Regionaltog',
        icon: 'train',
        transtype: 'foot'
    },
    'library': {
        name: 'Bibliotek',
        icon: 'library',
        transtype: 'foot'
    },
    'pharmacy': {
        name: 'Apotek',
        icon: 'pharmacy',
        transtype: 'auto'
    },
    'coast': {
        name: 'Kyst',
        icon: 'coast',
        transtype: 'foot'
    },
    'forest': {
        name: 'Skov',
        icon: 'forest',
        transtype: 'foot'
    },
    'lake': {
        name: 'Sø',
        icon: 'lake',
        transtype: 'foot'
    },
    'airport': {
        name: 'Lufthavn',
        icon: 'airport',
        transtype: 'car'
    },
    'sportshall': {
        name: 'Idrætshal',
        icon: 'sportshall',
        transtype: 'foot'
    },
    'publicbath': {
        name: 'Svømmehal',
        icon: 'publicbath',
        transtype: 'foot'
    },
    'soccerfield': {
        name: 'Fodboldbane',
        icon: 'soccerfield',
        transtype: 'foot'
    },
    'roadtrain': {
        name: 'Modulvogntog',
        icon: 'roadtrain',
        transtype: 'car'
    },
    'lightrail': {
        name: 'Letbane',
        icon: 'lightrail',
        transtype: 'car'
    }
};
export const maxPoiZoomLevel = 12;

const c_groen = "#3d8f6e";
const c_lysgroen = "#56c07c";

export async function asyncDisplayPOIforBounds(map: any, customer: string, token: string, poiLayer: string, poiTypesList: string[]) {
    function formatString(input: string, placeholders: { [key: string]: any }) {
        let s = input;
        for (let propertyName in placeholders) {
            if (placeholders.hasOwnProperty(propertyName)) {
                let re = new RegExp('{' + propertyName + '}', 'gm');
                s = s.replace(re, placeholders[propertyName]);
            }
        }
        return s;
    }

    let bounds = map.getBounds();
    let serviceUrl = formatString("https://{customer}.poi.viamap.net/v1/getpoi/?token={token}&", { customer, token });
    let bbox = formatString("{lat},{lng}%20{lat2},{lng2}", { lat: bounds.getSouth(), lng: bounds.getWest(), lat2: bounds.getNorth(), lng2: bounds.getEast() });

    let featuresArray: any[] = [];

    let sourceId = "poi-source-1";
    let layerId = "poi-unclustered-icon";

    if (!poiTypesList || poiTypesList.length < 1) {
        // No POI's selected
        if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
        };
        if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
        };
        return;
    }

    if (map.getZoom() < maxPoiZoomLevel) {
        if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
        };
        if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
        };
        return;
    }

    // Convert POIList to comma separated string
    let poitypes = ""; // Example "metro,train,strain,hospital,doctor,school,supermarket";
    poiTypesList.forEach((poiType, idx) => {
        if (idx > 0) {
            poitypes += ",";
        }
        poitypes += poiType;
    }
    );

    let query = serviceUrl + "&bbox=" + bbox + "&poitypes=" + poitypes;
    try {
        let data: { [x: string]: { POIs: any; }; };

        const response = await fetch(query);
        data = await response.json();

        // Remove the previous poi's, if any.
        // poiLayer && poiLayer.clearLayers(map);

        // Process response
        Object.keys(data).forEach((key) => {
            let val = data[key].POIs;
            if (!val || (val.status && val.status === "none found")) {
                // Nothing to display
            } else {
                // let icon = key;
                const icon = POITYPES[key].icon;
                if (val) {
                    val.forEach((poi: { name: any; poilatlng: any[]; }) => {
                        featuresArray.push({
                            type: "Feature",
                            properties: {
                                icon: icon,
                                label: "",
                                poiName: poi.name,
                                key: key
                            },
                            geometry: {
                                "type": "Point",
                                "coordinates": [poi.poilatlng[1], poi.poilatlng[0]]
                            }
                        }
                        );
                    });
                }
            }
        });

        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, makeSourceSpec(featuresArray, false));
        } else {
            map.getSource(sourceId).setData(makeSourceSpec(featuresArray, false).data);
        }
        if (!map.getLayer(layerId)) {
            map.addLayer(makeLayerPoi(layerId, sourceId));
        }
        // Always display the Data layer on top
        if (map.getLayer('pointiconandtextlayer')) {
            map.moveLayer('pointiconandtextlayer');
        }
        /* popup on mouse over logic */

        // Create a popup, but don't add it to the map yet.
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: "viamap-popup"
        });

        map.on('mouseenter', layerId, (e: any) => {
            // Change the cursor style as a UI indicator.
            // map.getCanvas().style.cursor = 'pointer';

            // Copy coordinates array.
            const coordinates = e.features[0].geometry.coordinates.slice();
            const coordName = POITYPES[e.features[0].properties.key].name;
            const poiName = e.features[0].properties.poiName;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            let contents = "";
            contents += "<div class='viamap-popup-contents-category' style='color:'" + c_groen + "'>" + coordName + "</div>";
            contents += "<div class='viamap-popup-contents-name' style='color:'" + c_lysgroen + "'>" + poiName + "</div>";
            // Populate the popup and set its coordinates
            // based on the feature found.
            popup.setLngLat(coordinates).setHTML(contents).addTo(map);
        });

        map.on('mouseleave', layerId, () => {
            // map.getCanvas().style.cursor = '';
            popup.remove();
        });
        return (poiLayer);
    } catch (err) {
        alert("Get and show Poi" + err);
        return (err);
    }
}

function makeSourceSpec(featuresArray: any[], useClustering: boolean) {
    // tslint:disable

    let clusterParams = useClustering ?
        {
            cluster: true,
            clusterMaxZoom: 16, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        }
        : {};
    return {
        type: "geojson",
        data: {
            "type": "FeatureCollection",
            "features": featuresArray,
        },
        ...clusterParams
    };
    // tslint:enable

}

function makeLayerPoi(id: string, source: string) {
    // tslint:disable
    return {
        id: id,
        type: "symbol",
        minzoom: 12,
        source: source,
        filter: ["!", ["has", "point_count"]],
        layout: {
            "icon-image": ['get', 'icon'],
            "icon-size": 0.8,
            "icon-anchor": "center",
            "icon-allow-overlap": false,
        },
    };
}