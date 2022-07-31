const parseLatLng = (str) => {
  const longLatX = str.split(",").map((x) => x.trim());
  return new google.maps.LatLng(longLatX[0], longLatX[1]);
};
const color3 = null;// "rgb(0, 153, 255)";

const center = (a, b) => {
  const lat = a.lat() + b.lat();
  const lng = a.lng() + b.lng();

  return new google.maps.LatLng(lat / 2, lng / 2);
};
const lineSymbol = {
  path: "M 0,-1 0,1",
  strokeOpacity: 0.8,
  scale: 3,
};
const PNAME = {
  targetLnLng: "vị trí đất",
  intro: "giới thiệu",
  places: "xung quanh",
  name: "tên",
  distanceMode: "cách đo",
  icon: "hình ảnh",
  latLng: "tọa độ",
  border: "đường viền",
  LINE: "chim bay",
  ROUTE: "lái xe",
};
const findMinStepPath = (paths) => {
  return 5;
  let minDistance = 100000000000;

  for (let index = 0; index < paths.length - 1; index++) {
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      paths[index],
      paths[index + 1]
    );

    if (distance < minDistance) {
      minDistance = distance;
    }
  }

  if (minDistance < 5) minDistance = 5;
  return minDistance;
};

const refinePath = (paths) => {
  const newPath = [];
  const minDistance = findMinStepPath(paths);

  for (let index = 0; index < paths.length - 1; index++) {
    const point1 = paths[index];
    const point2 = paths[index + 1];
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      point1,
      point2
    );

    const willAddPoint = Math.floor(distance / minDistance);
    const gapLat = (point2.lat() - point1.lat()) / willAddPoint;
    const gapLng = (point2.lng() - point1.lng()) / willAddPoint;

    let start = point1;
    for (i = 0; i < willAddPoint; i++) {
      // split point
      start = new google.maps.LatLng(
        start.lat() + gapLat,
        start.lng() + gapLng
      );
      newPath.push(start);
    }
  }

  return newPath;
};
const delay = (x) =>
  new Promise((solve) => {
    setTimeout(() => {
      return solve(true);
    }, x);
  });

async function initMap2() {
  document.getElementById("code").style.display = "none";
  document.getElementById("content").style.display = "inline";
  localStorage.setItem("code", document.getElementById("codeArea").value);
  const DEFAULT_ZOOM = 15;
  const data = jsyaml.load(document.getElementById("codeArea").value);
  const directionsService = new google.maps.DirectionsService();
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 8,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: false,

    // mapTypeId: 'satellite',//
    center: parseLatLng(data[PNAME.targetLnLng]),
  });

  const drawingManager = new google.maps.drawing.DrawingManager({
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

  google.maps.event.addListener(
    drawingManager,
    "overlaycomplete",
    function (e) {
      // Switch back to non-drawing mode after drawing a shape.
      // drawingManager.setDrawingMode(null);

      // Add an event listener that selects the newly-drawn shape when the user
      // mouses down on it.
      var newShape = e.overlay;
      let radisText = null;
      debugger;
      if (e.type == "circle") {
        const radius = newShape.getRadius();
        const imageOut = window.createImageFromText(
          "Bán kính " + (radius / 1000).toFixed(1) + "km",
          '',
          0.7, color3
        );

        radisText = new google.maps.Marker({
          position: newShape.center,
          map,
          opacity: 0.8,
          zIndex:1000,
          icon: {
            url: imageOut[0],
            anchor: new google.maps.Point(imageOut[1]/2, imageOut[2]/2),
          },
        });

        setTimeout(() => {
          radisText.setMap(null);
        }, 2000)
      }

      if (e.type == 'polyline') {
        const arr = newShape.getPath().getArray();
        let distancePls = 0
        for(let i = 0; i < arr.length - 1; i++) {
          distancePls += google.maps.geometry.spherical.computeDistanceBetween(arr[i], arr[i+1]);
        }

        radisText = new google.maps.Marker({
          position: center(arr[0], arr[arr.length -1]),
          map,
          opacity: 0.8,
          zIndex:1000,
          icon: window.createImageFromText(
            (distancePls / 1000).toFixed(1) + "km",
            '',
            0.7, color3
          )[0],
        });

        setTimeout(() => {
          radisText.setMap(null);
        }, 2000)
      } 
      if (e.type == "marker") {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(newShape.position, parseLatLng(data[PNAME.targetLnLng]));
        const imageOut = window.createImageFromText(
          (distance / 1000).toFixed(1) + "km",
          '',
          0.7, color3
        );

        radisText = new google.maps.Marker({
          position: newShape.position,
          map,
          zIndex: 1000,
          opacity: 0.8,
          icon: {
            url: imageOut[0],
            anchor: new google.maps.Point(imageOut[1]/2, -imageOut[2]/2),
          } 
        });

        const line = new google.maps.Polyline({
          path: [newShape.position, parseLatLng(data[PNAME.targetLnLng])],
          geodesic: true,
          map: map,
          strokeColor: "#ff1a75", // pink ff1a75
          strokeOpacity: 0,
          strokeWeight: 3,
          icons: [
            {
              icon: lineSymbol,
              offset: "0",
              repeat: "15px",
            },
          ],
        });
        window.allDrawings.push(line);
        setTimeout(() => {
          radisText.setMap(null);
          line.setMap(null);
        }, 2000)
      }

      newShape.type = e.type;
      google.maps.event.addListener(newShape, "click", function () {
        newShape.setMap(null);
        radisText?.setMap(null);
      });

      window.allDrawings.push(newShape);
      if (radisText) window.allDrawings.push(radisText);
      
    }
  );

  drawingManager.setMap(map);

  new google.maps.Marker({
    position: parseLatLng(data[PNAME.targetLnLng]),
    map,
    icon: "./images/vi-tri.png",
  });

  document.getElementById("message").innerHTML = data[PNAME.intro];

  await delay(3000);
  for (let x = 9; x < 16; x++) {
    await delay(500);
    map.setZoom(x);
  }

  const carIcon = {
    url: "./images/car32_red.png",
    size: new google.maps.Size(32, 32),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(15, 15),
  };

  async function animatePlace(index) {
    const place = data[PNAME.places][index];

    const placeIcon = new google.maps.Marker({
      position: parseLatLng(place[PNAME.latLng]),
      map,
      icon: `./images/${place[PNAME.icon] || "pin"}.png`,
    });
    place[PNAME.distanceMode] = place[PNAME.distanceMode] || PNAME.ROUTE;

    const drawLine = async () => {
      const line = [
        parseLatLng(place[PNAME.latLng]),
        parseLatLng(data[PNAME.targetLnLng]),
      ];

      const flightPath = new google.maps.Polyline({
        path: line,
        geodesic: true,
        map: map,
        strokeColor: "#" + (place[PNAME.border] || "3385ff"),
        strokeOpacity: 0,
        icons: [
          {
            icon: lineSymbol,
            offset: "0",
            repeat: "20px",
          },
        ],
      });
      const distanceText =
        (
          google.maps.geometry.spherical.computeDistanceBetween(
            line[0],
            line[1]
          ) / 1000
        ).toFixed(1) + "km";

      const distanceMaker = new google.maps.Marker({
        position: center(line[0], line[1]),
        map,
        opacity: 0.8,
        icon: window.createImageFromText(place[PNAME.name], distanceText)[0],
      });

      const bounds = new google.maps.LatLngBounds();
      line.forEach((x) => bounds.extend(x));

      map.fitBounds(bounds);
      if (map.getZoom() > 15) {
        map.setZoom(15);
      }

      window.showAlert(
        `<span class='head'>${
          place[PNAME.name]
        }</span> cách ${distanceText} - đường ${place[PNAME.distanceMode]}.
        <img class="toggle" onclick="toggle(${index})" src="images/replay.png"><img>`,
        "primary"
      );

      //wait 3min to dispose
      await delay(5000);

      distanceMaker.setIcon(
        window.createImageFromText(place[PNAME.name], distanceText, 0.7)[0]
      );

      const displayMap = (toggle) => {
        const m = toggle ? map : null;
        distanceMaker.setMap(m);
        flightPath.setMap(m);
        placeIcon.setMap(m);
      };
      displayMap(false);

      return displayMap;
    };
    const drawRoute = async () => {
      const response = await directionsService.route({
        origin: parseLatLng(place[PNAME.latLng]),
        destination: parseLatLng(data[PNAME.targetLnLng]),
        travelMode: google.maps.TravelMode.DRIVING,
      });

      const bounds = new google.maps.LatLngBounds();
      response.routes[0].overview_path.forEach((x) => bounds.extend(x));

      const leg = response.routes[0].legs[0];
      const distanceText = `${leg.distance.text} - ${leg.duration.text} ${
        place[PNAME.distanceMode]
      }`;
      window.showAlert(
        `<span class='head'>${place[PNAME.name]}</span> cách ${distanceText}.
        <img class="toggle" onclick="toggle(${index})" src="images/replay.png"><img>
        `,
        "info"
      );

      map.fitBounds(bounds);
      if (map.getZoom() > 15) {
        map.setZoom(15);
      }
      
      const drivingRoute = new google.maps.Polyline({
        path: response.routes[0].overview_path,
        geodesic: true,
        map: map,
        strokeColor: "#" + (place[PNAME.border] || "3385ff"), // pink ff1a75
        strokeOpacity: 0.8,
        strokeWeight: 7,
      });
      const paths = refinePath(response.routes[0].overview_path);
      const distanceMaker = new google.maps.Marker({
        position: paths[parseInt(paths.length / 2)],
        map,
        opacity: 0.8,
        icon: window.createImageFromText(place[PNAME.name], distanceText)[0],
      });

      await delay(2000);
      const carMaker = new google.maps.Marker({
        position: response.routes[0].overview_path[0],
        map: map,
        zIndex: 1000,
        icon: carIcon,
      });
      await delay(1000);


      const x = Math.floor(paths.length / 1500);
      let t = 0;
      for (const position of paths) {
        if (x > 1 && t++ % x != 0) continue;
        await delay(1);
        carMaker.setPosition(position);
      }

      //wait 3min to dispose
      await delay(3000);
      drivingRoute.setMap(null);
      carMaker.setMap(null);
      placeIcon.setMap(null);
      distanceMaker.setIcon(
        window.createImageFromText(place[PNAME.name], distanceText, 0.7)[0]
      );
      const displayMap = (toggle) => {
        const m = toggle ? map : null;
        distanceMaker.setMap(m);
        drivingRoute.setMap(m);
        carMaker.setMap(m);
        placeIcon.setMap(m);
      };
      displayMap(false);

      return displayMap;
    };

    if (place[PNAME.distanceMode] == PNAME.LINE) {
      return await drawLine();
    } else {
      return await drawRoute();
    }
  }

  await delay(3000);
  for (const index in data[PNAME.places]) {
    const displayOnMapFunc = await animatePlace(index);
    window.placesFunc.push(displayOnMapFunc);
    window.placesFunc_toggle.push(false);
  }
  await delay(1000);
  map.setZoom(DEFAULT_ZOOM);
  map.setCenter(parseLatLng(data[PNAME.targetLnLng]));

  for (let i = 0; i < window.placesFunc_toggle.length; i++) {
    window.placesFunc_toggle[i] = true;
    window.placesFunc[i](true);
  }

  document.getElementById("liveAlertPlaceholder").style.display = "inline";
}

function toggle(index) {
  placesFunc_toggle[index] = !placesFunc_toggle[index];
  window.placesFunc[index](placesFunc_toggle[index]);
}

window.placesFunc = [];
window.placesFunc_toggle = [];
window.allDrawings = []
window.run = initMap2;
window.initMap = () => {};
document.addEventListener('keydown', function(event) {
  if (event.code == 'Digit1') {
    for (let i = 0; i < window.placesFunc_toggle.length; i++) {
      window.placesFunc_toggle[i] = false;
      window.placesFunc[i](false);
    }
  
    document.getElementById("liveAlertPlaceholder").style.display = "none";
  }
  if (event.code == 'Digit2') {
    for (let i = 0; i < window.placesFunc_toggle.length; i++) {
      window.placesFunc_toggle[i] = true;
      window.placesFunc[i](true);
    }
  
    document.getElementById("liveAlertPlaceholder").style.display = "inline";
  }

  if (event.code == 'Delete') {
    for(const x of window.allDrawings) {
      x?.setMap(null);
    }

    window.allDrawings = [];
  }
});