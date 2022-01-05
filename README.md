# Introduction

This project is an example of how Viamap vector maps can be integrated in a React Typescript Application.

The application showcases that:

You can click on the buttons to send events to the map component to change color of the dots or display the ortophoto.
You can click on the dots on the map which will increment the counter in the top component.
You can zoom/pan using the mouse. Or change tilt/heading using <right mouse button> or Ctrl+<left mouse button>.
You can show a grouped set of different POI types by pressing “Show all trains” (shows different types of trains).
You can show a specific set of POIs by pressing “Show supermarket”.
You can hide all POIs.

The application is not useful in itself but illustrates:

- import of required npm viamap modules
- specifying your Viamap token and initializing the map
- using native Mapboxgl functionality to add map features
- drawing some points on the map
- how to integrate with React components
- how to get events to the map
- how to get events from the map to other parts of the application
- how to show the orthophoto
- how to add points of interest via the Viamap POI service
- simple event handlers

Focus has been on compact code examples
Everything is in the file App.tsx for ease of reading.

## To get started

### 1. Clone the repository 

#### `git clone https://github.com/ViamapAps/viamap-ts-react-example.git`

### 2.  Install modules

In the project directory:

#### `npm install`

### 3. Start your favorite editor

In _App.tsx_ edit lines 
#### `let userName = "YOUR VIAMAP USERNAME";`
#### `let token = "YOUR VIAMAP TOKEN";`
Enter your viamap username and token

### 4.  Start the Application

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Troubleshooting

If the application either returns error 520 or a syntax/parsing error, it indicates that the Viamap credentials from step 3 are invalid or ill-formed

## If you have questions

Contact Viamap (support@viamap.net) if you have questions or suggestions.


