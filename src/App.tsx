import React, { useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import './css/App.css';

// VIAMAP REQUIRED IMPORTS AND DECLARATIONS
import { vms } from 'viamap-viamapstrap-mbox';
import { asyncDisplayPOIforBounds } from './managers/POIInterface';
declare var mapboxgl: any;
// END VIAMAP REQUIRED IMPORTS AND DECLARATIONS

// VIAMAP TOKEN AND USERNAME
export let userName = "YOUR VIAMAP USERNAME";
export let token = "YOUR VIAMAP TOKEN";

// INITIAL POI SETTINGS
const showPoiButtons = true;

// STATE EXAMPLE
type State = {
  color: string;
  dotClicks: number;
  showOrtoPhoto: boolean;
  map: any;
}
let initialState: State = { color: "green", dotClicks: 0, showOrtoPhoto: false, map: null };

export const Context = React.createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

// Actions for Simple Reducer
enum ActionType { Recolor, DotClick, OrtoPhoto, SetMap };
type Action = {
  actionType: ActionType;
  payLoad?: any;
}

// SIMPLE REDUCER
function reducer(state: State, action: Action): State {
  switch (action.actionType) {
    case ActionType.Recolor:
      return { ...state, color: action.payLoad };
    case ActionType.OrtoPhoto:
      return { ...state, showOrtoPhoto: action.payLoad };
    case ActionType.DotClick:
      return { ...state, dotClicks: state.dotClicks + 1 }
    case ActionType.SetMap:
      return { ...state, map: action.payLoad}
    default:
      return state;
  }
}

// MAIN APP COMPONENT
const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      <div className="App">
        <Context.Provider value={{ state, dispatch }}>
          <ControlPanel />
          {
            token === "YOUR VIAMAP TOKEN" || userName === "YOUR VIAMAP USERNAME" ? (
              <h2 style={{border:"3px solid orange"}}>Please first enter your Viamap username and token in the file App.tsx!</h2>
            ) : (
              <MapComponent />
            )
          }
        </Context.Provider>
      </div>
    </>
  );
}

// COMPONENT WITH ACTIONS CONTROLING THE MAP
const ControlPanel = () => {
  const { state, dispatch } = useContext(Context);
  const activeMoveEndPoiFunction = useRef<Function>();

  const callbackAsyncDisplayPoi = useCallback((poiTypesList: string[]) => {
    asyncDisplayPOIforBounds(state.map, userName, token, "poi", poiTypesList);
  }, [state.map]);

  const displayPois = (poiTypesList: string[]) => {
    // Clear active moveend event listener from map
    activeMoveEndPoiFunction && state.map.off('moveend', activeMoveEndPoiFunction.current);

    // Add new active moveend event listener to map and local state
    const poiMoveEventListener = () => callbackAsyncDisplayPoi(poiTypesList);
    state.map.on('moveend', poiMoveEventListener);
    activeMoveEndPoiFunction.current = poiMoveEventListener;

    // Display the new pois on the map
    asyncDisplayPOIforBounds(state.map, userName, token, "poi", poiTypesList)

    // Update the global mapstate with the updated map
    dispatch({ actionType: ActionType.SetMap, payLoad: state.map });
  }

  return (
    <>
      <h1>Viamap React Example</h1>
      <button onClick={(e) => dispatch({ actionType: ActionType.Recolor, payLoad: state.color === "orange" ? "green" : "orange" })}>Toggle dot color</button>
      {' '}
      <button onClick={(e) => dispatch({ actionType: ActionType.OrtoPhoto, payLoad: !state.showOrtoPhoto })}>Toggle satelite photo</button>
      {showPoiButtons ? (
        <>
          <button onClick={(e) => displayPois(['train', 'strain', 'lightrail'])}>Show all trains</button>
          <button onClick={(e) => displayPois(['supermarket'])}>Show supermarket</button>
          <button onClick={(e) => displayPois([])}>Hide all pois</button>
        </>
      ) : null}
      <div style={{ marginTop: "10px", fontStyle: 'italic' }}>Dots clicked {state.dotClicks} times</div>
    </>
  );
}

// MAP COMPONENT
const MapComponent = () => {
  const { state, dispatch } = useContext(Context);
  const mapContainer = useRef(null);

  // MAP INITIALIZATION
  useEffect(() => {
    let props = {
      // Reference to the container html div
      container: mapContainer.current,
      // Viamap Token
      token: token,
      // Map Initial View. For options see https://docs.mapbox.com/mapbox-gl-js/api/map/
      zoom: 14,
      pitch: 0,
      bearing: 0,
      center: [10.2086,
        56.1522]
    };
    vms.initmap(props)
      .then((map: any) => {
        vms.load().then(function () {
          // Save map object in state
          dispatch({ actionType: ActionType.SetMap, payLoad: map });

          // Create some controls
          map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-left');

          // Add example point layer
          let myData = {
            "type": "FeatureCollection",
            "features": [
              {
                "type": "Feature",
                "geometry": {
                  "type": "Point",
                  "coordinates": [
                    10.4103,
                    55.411046
                  ]
                }
              },
              {
                "type": "Feature",
                "geometry": {
                  "type": "Point",
                  "coordinates": [
                    10.428477,
                    55.375788
                  ]
                }
              }
            ]
          };
          map.addSource("exampledatasource", {
            type: "geojson",
            data: myData
          });
          map.addLayer({
            id: 'exampledatalayerdot',
            type: 'circle',
            source: 'exampledatasource',
            paint: {
              'circle-color': state.color,
              'circle-radius': 10,
            }
          });

          // Example Point event handlers
          map.on('click', 'exampledatalayerdot', () => {
            dispatch({ actionType: ActionType.DotClick });
          });
          map.on('mouseenter', 'exampledatalayerdot', () => {
            map.getCanvas().style.cursor = 'pointer'
          });
          map.on('mouseleave', 'exampledatalayerdot', () => {
            map.getCanvas().style.cursor = ''
          });
        });
      });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []); // Run only once

  // EXAMPLE HANDLING OF EVENT/STATE CHANGES
  useEffect(() => {
    state.map && state.map.setPaintProperty('exampledatalayerdot', 'circle-color', state.color);
  }, [state.color, state.map]); // Run when map becomes available or color is changed

  // EXAMPLE HANDLING OF EVENT/STATE CHANGES
  useEffect(() => {
    state.map && state.map.setLayoutProperty('orthophoto', 'visibility', state.showOrtoPhoto ? 'visible' : 'none');
  }, [state.showOrtoPhoto, state.map]); // Run when map becomes available or showOrtoPhoto is changed

  // Map render function
  return (
    <>
      <h2>The Map</h2>
      <div>
        <div ref={mapContainer} style={{ width: "100%", height: "500px" }} className="map-container" />
      </div>
    </>
  );
}

export default App;