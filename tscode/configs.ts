export const color3: string | null = null;// "rgb(0, 153, 255)";

export const DEFAULT_ZOOM = 15;

export const getCarIcon = () => ({
  url: "./images/car32_red.png",
  size: new google.maps.Size(32, 32),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(15, 15),
});

enum Sort {
  Input = 0,
  NearFirst = 1,
  FarFirst = 2
}

let sort = Sort.FarFirst;
export const getSort = () => {
  return sort;
}

export const getDrawManagerOptions = () => ({
  drawingMode: null,
  drawingControl: true,
  drawingControlOptions: {
    position: google.maps.ControlPosition.TOP_CENTER,
    drawingModes: [
      google.maps.drawing.OverlayType.MARKER,
      google.maps.drawing.OverlayType.CIRCLE,
      google.maps.drawing.OverlayType.POLYGON,
      google.maps.drawing.OverlayType.POLYLINE,
      google.maps.drawing.OverlayType.RECTANGLE,
    ],
  },
  markerOptions: {
    icon: "images/pin.png",
  },
  circleOptions: {
    strokeColor: '#ff0066',
    fillColor: "#e6e600",
    fillOpacity: 0.5,
    strokeWeight: 2,
    zIndex: 1,
  },
  polylineOptions: {
    strokeColor: '#ff0066',
    strokeWeight: 3,
  },
  polygonOptions: {
    strokeColor: '#ff0066',
    fillColor: "#e6e600",
    strokeWeight: 2,
  },
  rectangleOptions: {
    strokeColor: '#ff0066',
    fillColor: "#e6e600",
    strokeWeight: 2,
  }
});