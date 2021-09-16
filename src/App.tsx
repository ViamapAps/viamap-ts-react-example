import React, { useContext, useEffect, useReducer, useRef, useState } from 'react';
import './App.css';

// VIAMAP REQUIRED IMPORTS AND DESCLARATIONS
import {vms} from 'viamap-viamapstrap-mbox';
declare var mapboxgl: any;

// STATE EXAMPLE
type State = {
  color: string;
  clicks: number;
  showOrtoPhoto: boolean;
}

let initialState: State = { color: "green", "clicks": 0, "showOrtoPhoto":false };
export const Context = React.createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

enum ActionType { Recolor, Click, ToggleShowOrtoPhoto };
type Action = {
  actionType: ActionType;
  payLoad?: any;
}

// SIMPLE REDUCER
function reducer(state: State, action: Action): State {
  switch (action.actionType) {
    case ActionType.Recolor:
      return { ...state, color: action.payLoad };
      case ActionType.ToggleShowOrtoPhoto:
        return { ...state, showOrtoPhoto: !state.showOrtoPhoto };
      case ActionType.Click:
      return { ...state, clicks: state.clicks + 1 }
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
          <OtherComponent />
          <MapComponent />
        </Context.Provider>
      </div>
    </>
  );
}

const OtherComponent = () => {
  const { state, dispatch } = useContext(Context);
  return (
    <>
      <h1>Viamap React Example</h1>
      <button onClick={(e) => dispatch({ actionType: ActionType.Recolor, payLoad: state.color === "orange" ? "green" : "orange" })}>Toggle dot color</button>
      {' '}
      <button onClick={(e) => dispatch({ actionType: ActionType.ToggleShowOrtoPhoto})}>Toggle satelite photo</button>
      <div>Map clicked {state.clicks} times</div>
    </>
  );
}

const MapComponent = () => {
  const { state, dispatch } = useContext(Context);
  const [ map, setMap ] = useState<any>(null);
  const mapContainer = useRef(null);

  // ==============================================================
  // MAP INITIALIZATION
  // ==============================================================
  useEffect(() => {
    let customer = "charlietango_trial";
    let token = "eyJkcGZ4IjogImNoYXJsaWV0YW5nb190cmlhbCIsICJyZWYiOiAiMjEwOTA5IiwgInBhciI6ICIiLCAiZXhwIjogMTYzNTgxMTE5OSwgInByaXZzIjogInIxWjByMEYwazZCdFdxUWNPVXlrQi95NlNVcEp2MlFiZ3lYZXRxNEhZNFhPLzNZclcwK0s5dz09In0.gqV466WO3GqdhsHU0PSzFV4xpxOMJMd9MHUxJ+lh7riZvREht/dG1PN0tlx+rzcDaqZRK5CD4yCOiUe393XOYg";
    let props = {
      server_uri: "https://edc.controlpanel.viamap.net/",
      // container: 'map',
      container: mapContainer.current,
      zoom: 11,
      pitch:  0,
      bearing: 0,
      center: [10.4153,
        55.401046],
      style: "https://" + customer + ".tiles.viamap.net/v1/style.json?token=" + token
    };
    vms.initmap(props)
      .then((map: any) => {
        vms.load().then(function () {

        setMap(map);
        map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-left');
        map.setLayoutProperty('orthophoto', 'visibility', 'none');
        map.on('click', (e: any) => { dispatch({ actionType: ActionType.Click }); })

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
      });
      });
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []); // Run only once

  // ==============================================================
  // EXAMPLE HANDLING OF EVENT/STATE CHANGES
  // ==============================================================
  useEffect(() => {
    map && map.setPaintProperty('exampledatalayerdot', 'circle-color', state.color);
  }, [state.color, map]); // Run when map becomes available or color is changed

  useEffect(() => {
    map && map.setLayoutProperty('orthophoto', 'visibility', state.showOrtoPhoto ? 'visible' : 'none');
  }, [state.showOrtoPhoto, map]); // Run when map becomes available or showOrtoPhoto is changed

  return (
    <>
      <h1>The Map</h1>
      <div>
        <div ref={mapContainer} style={{ width: "100%", height: "400px" }} className="map-container" />
      </div>
    </>
  );
}



export default App;
