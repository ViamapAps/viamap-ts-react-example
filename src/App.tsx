import React, { useContext, useEffect, useReducer, useRef, useState } from 'react';
import './App.css';

// VIAMAP REQUIRED IMPORTS AND DECLARATIONS
import { vms } from 'viamap-viamapstrap-mbox';
declare var mapboxgl: any;
// END VIAMAP REQUIRED IMPORTS AND DECLARATIONS

// VIAMAP TOKEN
let token = "YOUR VIAMAP TOKEN";

// STATE EXAMPLE
type State = {
  color: string;
  dotClicks: number;
  showOrtoPhoto: boolean;
}
let initialState: State = { color: "green", dotClicks: 0, showOrtoPhoto: false };

export const Context = React.createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

// Actions for Simple Reducer
enum ActionType { Recolor, DotClick, OrtoPhoto };
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
            token === "YOUR VIAMAP TOKEN" ? (
              <h2 style={{border:"3px solid orange"}}>Please first enter your Viamap token in the file App.tsx!</h2>
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
  return (
    <>
      <h1>Viamap React Example</h1>
      <button onClick={(e) => dispatch({ actionType: ActionType.Recolor, payLoad: state.color === "orange" ? "green" : "orange" })}>Toggle dot color</button>
      {' '}
      <button onClick={(e) => dispatch({ actionType: ActionType.OrtoPhoto, payLoad: !state.showOrtoPhoto })}>Toggle satelite photo</button>
      <div style={{ marginTop: "10px", fontStyle: 'italic' }}>Dots clicked {state.dotClicks} times</div>
    </>
  );
}

// MAP COMPONENT
const MapComponent = () => {
  const { state, dispatch } = useContext(Context);
  const [map, setMap] = useState<any>(null);
  const mapContainer = useRef(null);

  // MAP INITIALIZATION
  useEffect(() => {
    let props = {
      // Reference to the container html div
      container: mapContainer.current,
      // Viamap Token
      token: token,
      // Map Initial View. For options see https://docs.mapbox.com/mapbox-gl-js/api/map/
      zoom: 11,
      pitch: 0,
      bearing: 0,
      center: [10.4153,
        55.401046]
    };
    vms.initmap(props)
      .then((map: any) => {
        vms.load().then(function () {
          // Save map object in state
          setMap(map);

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
    map && map.setPaintProperty('exampledatalayerdot', 'circle-color', state.color);
  }, [state.color, map]); // Run when map becomes available or color is changed

  // EXAMPLE HANDLING OF EVENT/STATE CHANGES
  useEffect(() => {
    map && map.setLayoutProperty('orthophoto', 'visibility', state.showOrtoPhoto ? 'visible' : 'none');
  }, [state.showOrtoPhoto, map]); // Run when map becomes available or showOrtoPhoto is changed

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