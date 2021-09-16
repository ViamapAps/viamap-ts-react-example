import React, { useContext, useEffect, useReducer, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { vms, mapboxglx } from 'viamapstrap';

type State = {
  position?: any;
  zoom?: any;
  color: string;
  clicks: number;
}
enum ActionType { Move, Zoom, Recolor, Click };
type Action = {
  actionType: ActionType;
  payLoad?: any;
}
let initialState: State = { color: "green", "clicks": 0 };
function reducer(state: State, action: Action): State {
  switch (action.actionType) {
    case ActionType.Move:
      return { ...state, position: action.payLoad };
    case ActionType.Zoom:
      return { ...state, zoom: action.payLoad };
    case ActionType.Recolor:
      return { ...state, color: action.payLoad };
    case ActionType.Click:
      return { ...state, clicks: state.clicks + 1 }
    default:
      return state;
  }
}
export const Context = React.createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      <div className="App">
        <Context.Provider value={{ state, dispatch }}>
          <OtherComponent />
          <Map />
        </Context.Provider>
      </div>
    </>
  );
}

const Map = () => {
  const { state, dispatch } = useContext(Context);
  const mapref = useRef(null);
  const mapContainer = useRef(null);

  useEffect(() => {
    // ==============================================================
    // MAP INITIALIZATION
    // ==============================================================

    let customer = "charlietango_trial";
    let token = "eyJkcGZ4IjogImNoYXJsaWV0YW5nb190cmlhbCIsICJyZWYiOiAiMjEwOTA5IiwgInBhciI6ICIiLCAiZXhwIjogMTYzNTgxMTE5OSwgInByaXZzIjogInIxWjByMEYwazZCdFdxUWNPVXlrQi95NlNVcEp2MlFiZ3lYZXRxNEhZNFhPLzNZclcwK0s5dz09In0.gqV466WO3GqdhsHU0PSzFV4xpxOMJMd9MHUxJ+lh7riZvREht/dG1PN0tlx+rzcDaqZRK5CD4yCOiUe393XOYg";
    let props = {
      server_uri: "https://edc.controlpanel.viamap.net/",
      // container: 'map',
      container: mapContainer.current,
      zoom: 11,
      pitch: 0,
      bearing: 0,
      center: [10.4153,
        55.401046],
      style: "https://" + customer + ".tiles.viamap.net/v1/style.json?token=" + token
    };
    vms.initmap(props)
      .then((map: any) => {
        mapref.current = map;
        let x = vms.mapboxgl();
        map.addControl(new x.NavigationControl({ visualizePitch: true }), 'top-left');
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
        mapref.current.addSource("exampledatasource", {
          type: "geojson",
          data: myData
        });
        mapref.current.addLayer({
          id: 'exampledatalayerdot',
          type: 'circle',
          source: 'exampledatasource',
          paint: {
            'circle-color': state.color,
            'circle-radius': 10,
          }
        });

      });
  }, []); // nun only once

  useEffect(() => {
    if (!mapref.current) return;
    mapref.current.setPaintProperty('exampledatalayerdot', 'circle-color', state.color);
  }, [state.color, mapref.current]);

  return (
    <>
      <h1>The Map</h1>
      <div>
        <div ref={mapContainer} style={{ width: "100%", height: "400px" }} className="map-container" />
      </div>
      {/* <div style={{ position: "relative", top:"10px"}}>
      <div style={{ position: "absolute", top:"10px", width:"100%"}}>
        <div id={'map'} style={{ verticalAlign:"bottom", textAlign:"left", position: "static", top: 0, left: 0, width: "100%", height: "500" }}></div>
      </div>
      </div> */}
    </>
  );
}

const OtherComponent = () => {
  const { state, dispatch } = useContext(Context);
  return (
    <>
      <h1>Viamap React Example</h1>
      <button onClick={(e) => dispatch({ actionType: ActionType.Recolor, payLoad: state.color === "orange" ? "green" : "orange" })}>Change dot color</button>
      <div>Map clicked {state.clicks} times</div>
    </>
  );
}

export default App;
