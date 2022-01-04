import React, { useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import './css/App.css';

// VIAMAP REQUIRED IMPORTS AND DECLARATIONS
import { vms } from 'viamap-viamapstrap-mbox';
import { asyncDisplayPOIforBounds, maxPoiZoomLevel } from './managers/POIInterface';
declare var mapboxgl: any;
// END VIAMAP REQUIRED IMPORTS AND DECLARATIONS

// VIAMAP TOKEN AND USERNAME
export let userName = "test";
export let token = "eyJkcGZ4IjogInRlc3QiLCAicmVmIjogIjIiLCAicGFyIjogIiIsICJwcml2cyI6ICJXMCtLOXc9PSJ9.tyXKETkVeU+eYozC4cFmcIrSc65yA5C/1+5S2J9JLJch36h9eZdznRnHB5QS0wacBybNmiJR/b8Fyejd5ew9fw";

// INITIAL POI SETTINGS
const showPoiButtons = true;

// INITIAL GENERAL SETTINGS
const initialZoomLevel = 14;

// STATE EXAMPLE
type State = {
  color: string;
  dotClicks: number;
  showOrtoPhoto: boolean;
  map: any;
  currentZoomLevel: number;
}
let initialState: State = { color: "green", dotClicks: 0, showOrtoPhoto: false, map: null, currentZoomLevel: initialZoomLevel };

export const Context = React.createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

// Actions for Simple Reducer
enum ActionType { Recolor, DotClick, OrtoPhoto, SetMap, SetCurrentZoomLevel };
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
    case ActionType.SetCurrentZoomLevel:
      return { ...state, currentZoomLevel: action.payLoad}
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
      <button className="control-panel-button" onClick={(e) => dispatch({ actionType: ActionType.Recolor, payLoad: state.color === "orange" ? "green" : "orange" })}>Toggle dot color</button>
      <button className="control-panel-button" onClick={(e) => dispatch({ actionType: ActionType.OrtoPhoto, payLoad: !state.showOrtoPhoto })}>Toggle satelite photo</button>
      {showPoiButtons ? !(state.currentZoomLevel < maxPoiZoomLevel) ? (
        <>
          <button className="control-panel-button" onClick={(e) => displayPois(['train', 'strain', 'lightrail'])}>Show all trains</button>
          <button className="control-panel-button" onClick={(e) => displayPois(['supermarket'])}>Show supermarket</button>
          <button className="control-panel-button" onClick={(e) => displayPois([])}>Hide all POIs</button>
        </>
      ) : <button className="control-panel-button" disabled={true}>Zoom further in to enable POIs</button> : null}
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
      zoom: initialZoomLevel,
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
                    10.2086,
                    56.1522
                  ]
                }
              },
              {
                "type": "Feature",
                "geometry": {
                  "type": "Point",
                  "coordinates": [
                    10.2076,
                    56.1512
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
          map.on('zoomend', () => {
            dispatch({ actionType: ActionType.SetCurrentZoomLevel, payLoad: map.getZoom() }); console.log(map.getZoom());
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