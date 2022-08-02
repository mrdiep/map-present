import { getCarIcon, color3 } from "./configs";
import { setLabelRouteLabelLocation, showAlert } from "./doc";
import { ArroundInputSchema, ScriptRunnerSchema } from "./mapping";
import { center, createImageFromText, dashedLineIcon, delay, getDistanceText, hideObjectTimeout, refinePath } from "./utils";

export const allDrawings: (google.maps.Marker | google.maps.Polyline)[] = [];
export const allArroundObject: { func: Function, isShow: boolean }[] = [];
export const clearAllDrawings = () => {
  while (allDrawings.length > 0) {
    allDrawings.pop()?.setMap(null);
  }
}
export const toggleArroundObject = (index: number) => {
  const x = allArroundObject[index];
  x.isShow = !x.isShow;
  x.func(x.isShow);
};


export const showAllArroundObject = () => {
  for(let index = 0; index< allArroundObject.length; index++) {
    const x = allArroundObject[index];
    x.isShow = true;
    x.func(x.isShow);
  }
};

export const hideAllArroundObject = () => {
  for(let index = 0; index< allArroundObject.length; index++) {
    const x = allArroundObject[index];
    x.isShow = false;
    x.func(x.isShow);
  }
};

export const handleDrawingCompleted = (map: google.maps.Map, data: ScriptRunnerSchema) => (e: any) => {
  // Switch back to non-drawing mode after drawing a shape.
  // drawingManager.setDrawingMode(null);

  // Add an event listener that selects the newly-drawn shape when the user
  // mouses down on it.
  var newShape = e.overlay;

  const localDrawings: (google.maps.Marker | google.maps.Polyline)[] = [];

  if (e.type == "circle") {
    const radius = newShape.getRadius();
    const imageOut = createImageFromText(
      "Bán kính " + (radius / 1000).toFixed(1) + "km",
      '', 0.7, color3
    );

    const maker = new google.maps.Marker({
      position: newShape.center,
      map,
      opacity: 0.8,
      zIndex: 1000,
      icon: {
        url: imageOut[0] as string,
        anchor: new google.maps.Point(imageOut[1] / 2, imageOut[2] / 2),
      },
    });

    localDrawings.push(maker);
    hideObjectTimeout(maker);
  }

  if (e.type == 'polyline') {
    const arr = newShape.getPath().getArray();
    let distancePls = 0
    for (let i = 0; i < arr.length - 1; i++) {
      distancePls += google.maps.geometry.spherical.computeDistanceBetween(arr[i], arr[i + 1]);
    }

    const maker = new google.maps.Marker({
      position: center(arr[0], arr[arr.length - 1]),
      map,
      opacity: 0.8,
      zIndex: 1000,
      icon: createImageFromText(
        (distancePls / 1000).toFixed(1) + "km",
        '', 0.7, color3
      )[0],
    });
    localDrawings.push(maker);
    hideObjectTimeout(maker);
  }
  if (e.type == "marker") {
    const distance = google.maps.geometry.spherical.computeDistanceBetween(newShape.position, data.targetLocation);
    const imageOut = createImageFromText(
      (distance / 1000).toFixed(1) + "km",
      '', 0.7, color3
    );

    const maker = new google.maps.Marker({
      position: newShape.position,
      map,
      zIndex: 1000,
      opacity: 0.8,
      icon: {
        url: imageOut[0],
        anchor: new google.maps.Point(imageOut[1] / 2, -imageOut[2] / 2),
      }
    });

    const line = new google.maps.Polyline({
      path: [newShape.position, data.targetLocation],
      geodesic: true,
      map: map,
      strokeColor: "#ff1a75", // pink ff1a75
      strokeOpacity: 0,
      strokeWeight: 3,
      icons: dashedLineIcon
    });
    localDrawings.push(maker);
    localDrawings.push(line);
    hideObjectTimeout(maker, line);
  }

  localDrawings.push(newShape);
  const registerClickToRemove = (drawings: (google.maps.Marker | google.maps.Polyline)[]) => {
    google.maps.event.addListener(newShape, "click", function () {
      drawings.forEach(x => x.setMap(null));
    });
  }

  registerClickToRemove(localDrawings);

  localDrawings.forEach(x => x && allDrawings.push(x));
}

export type DisplayRoute = (x: boolean) => {};

export const drawLine = (map: google.maps.Map, data: ScriptRunnerSchema, index: number, placeIcon) => async () => {
  const place = data.arrounds[index];
  const line = [place.location, data.targetLocation];

  const flightPath = new google.maps.Polyline({
    path: line,
    geodesic: true,
    map: map,
    strokeColor: place.borderColor,
    strokeOpacity: 0,
    icons: dashedLineIcon
  });

  const distanceText = getDistanceText(line[0], line[1]);
  const distanceTextMarker = new google.maps.Marker({
    position: place.routeLabelLocation || center(line[0], line[1]),
    map,
    opacity: 0.8,
    draggable:true,
    icon: createImageFromText(place.name, distanceText, 1, place.borderColor)[0],
  });

  google.maps.event.addListener(distanceTextMarker, 'dragend', function() 
  {
    setLabelRouteLabelLocation(index, distanceTextMarker.getPosition());
  });

  const bounds = new google.maps.LatLngBounds();
  line.forEach((x) => bounds.extend(x));

  map.fitBounds(bounds);
  const currentZoom = map.getZoom();
  if (currentZoom && currentZoom > 15) {
    map.setZoom(15);
  }

  showAlert(
    `<span class='head'>${place.name
    }</span> cách ${distanceText} - đường ${place.distanceMode}.
    <img class="toggle" onclick="toggleArroundObject(${index})" src="images/replay.png"><img>`,
    "primary"
  );

  //wait 3min to dispose
  await delay(5000);

  distanceTextMarker.setPosition(center(line[0], line[1]));
  distanceTextMarker.setIcon(createImageFromText(place.name, distanceText, 0.7, place.borderColor)[0]);

  const displayMap = (toggle) => {
    const m = toggle ? map : null;
    distanceTextMarker.setMap(m);
    flightPath.setMap(m);
    placeIcon.setMap(m);
  };

  flightPath.addListener('click', () => toggleArroundObject(index));

  displayMap(false);

  return displayMap;
};

export const drawRoute = (map: google.maps.Map, data: ScriptRunnerSchema, index: number, placeIcon) => async () => {
  const place: ArroundInputSchema = data.arrounds[index];
  const directionsService = new google.maps.DirectionsService();
  let response: google.maps.DirectionsResult | null = null;
  try {
      response = await directionsService.route({
      origin: place.location,
      destination: data.targetLocation,
      travelMode: google.maps.TravelMode.DRIVING,
    });
  } catch(err) {
    // fallback to line
    alert('Không tìm thấy đường, tính đường chim bay');
    return await drawLine(map, data, index, placeIcon);
  }
  const bounds = new google.maps.LatLngBounds();
  response.routes[0].overview_path.forEach((x) => bounds.extend(x));

  const leg = response.routes[0].legs[0];
  const distanceText = `${leg.distance?.text} - ${leg.duration?.text} ${place.distanceMode}`;
  showAlert(
    `<span class='head'>${place.name}</span> cách ${distanceText}.
    <img class="toggle" onclick="toggleArroundObject(${index})" src="images/replay.png"><img>
    `,
    "info"
  );

  map.fitBounds(bounds);
  const currentZoom = map.getZoom();
  if (currentZoom && currentZoom > 15) {
    map.setZoom(15);
  }

  const drivingRoute = new google.maps.Polyline({
    path: response.routes[0].overview_path,
    geodesic: true,
    map: map,
    strokeColor: place.borderColor, // pink ff1a75
    strokeOpacity: 0.8,
    strokeWeight: 7,
  });
  const paths = refinePath(response.routes[0].overview_path);
  const distanceTextMarker = new google.maps.Marker({
    position: place.routeLabelLocation || paths[parseInt((paths.length / 2).toFixed(0))],
    map,
    draggable:true,
    opacity: 0.8,
    icon: createImageFromText(place.name, distanceText, 1, place.borderColor)[0],
  });
  google.maps.event.addListener(distanceTextMarker, 'dragend', function() 
  {
    setLabelRouteLabelLocation(index, distanceTextMarker.getPosition());
  });
  await delay(2000);
  const carMaker = new google.maps.Marker({
    position: response.routes[0].overview_path[0],
    map: map,
    zIndex: 1000,
    icon: getCarIcon(),
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

  distanceTextMarker.setPosition(paths[parseInt((paths.length / 2).toFixed(0))]) // reset if drag
  distanceTextMarker.setIcon(createImageFromText(place.name, distanceText, 0.7, place.borderColor)[0]);

  const displayMap = (toggle) => {
    const m = toggle ? map : null;
    distanceTextMarker.setMap(m);
    drivingRoute.setMap(m);
    carMaker.setMap(m);
    placeIcon.setMap(m);
  };
  drivingRoute.addListener('click', () => toggleArroundObject(index));
  displayMap(false);
  return displayMap;
};