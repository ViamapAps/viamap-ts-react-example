# Introduction

This project is an example of how Viamap vector maps can be integrated in a React Typescript Application.

The application is not useful in itself but illustrates:

- import of required npm viamap modules
- specifying your Viamap token and initializing the map
- using native Mapboxgl functionality to add map features
- drawing some points on the map
- how to integrate with React components
- how to get events to the map
- how to get events from the map to other parts of the application
- how to show the orthophoto
- simple event handlers

Focus has been on compact code examples
Everything is in the file App.tsx for ease of reading.

## To get started

### 1. Clone the repository 

#### `git clone https://github.com/ViamapAps/viamap-ts-react-example.git`

### 2. Start your favorite editor

In _App.tsx_ edit line 
####    `let token = "YOUR VIAMAP TOKEN";`
Enter your viamap token

### 3.  Install modules

In the project directory:

#### `npm install`

### 4.  Start the Application

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.


## If you have questions

Contact Viamap (support@viamap.net) if you have questions or suggestions.


## General Instructions when Integrating Viamap on a web site

Below are some code chunks that as a minimum must be added to the application.
They are mentioned in the order that they will likely be in the source file.

### 1. Imports

Import viamap bootstrap code

```javascript
// VIAMAP REQUIRED IMPORTS AND DECLARATIONS
import { vms } from 'viamap-viamapstrap-mbox';
declare var mapboxgl: any;
// END VIAMAP REQUIRED IMPORTS AND DECLARATIONS
```

Import needed React components

```javascript
import { useRef, useState } from 'react';
```

### 2. Specify your Viamap token

```javascript
let token = "YOUR VIAMAP TOKEN";
```

### 3. Declare some React States to Store key information in. Example:

```javascript
const [map, setMap] = useState<any>(null);
const mapContainer = useRef(null);
```

### 4. Initialize the Map [Do this only once]

```javascript
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
        // Create some controls
        map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-left');

        // ADD MORE CONTROLS HERE

        // SAVE the map variable in the state. We will need it later
        setMap(map);
    });
});
```

### 5. Declare a \<div\> which will be the container for the map

```javascript
<div ref={mapContainer} style={{ width: "100%", height: "500px" }} className="map-container" />
```
