
import { delay } from "./utils";
import { DEFAULT_ZOOM, getDrawManagerOptions, getSort } from "./configs";
import { DistanceMode_LINE } from './mapping';
import {
  allArroundObject, clearAllDrawings, drawLine, drawRoute, handleDrawingCompleted,
  hideAllArroundObject, showAllArroundObject, toggleArroundObject
} from './drawing';
import { addMoreArround, getScriptToRun, hideArroundHtmlList, loadScriptToRun, setIntro, showArroundHtmlList, showHtmlMap } from './doc';
import { draggable } from "./dragUtils";
let map: google.maps.Map;
let insertMode: boolean = false;
async function initMap2() {
  const introLabel = document.getElementById("floating-panel");
  if (introLabel) draggable(introLabel);

  showHtmlMap();

  const data = getScriptToRun();

  map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
    zoom: 8,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: false,

    // mapTypeId: 'satellite',//
    center: data.targetLocation,
  });

  map.addListener("click", (e) => {
    if (insertMode) {
      const name = prompt('Tên địa điểm:');
      const distanceMode = prompt('Cách đo: chim bay/lái xe [nhập c: chim bay, l: lái xe]');
      const marker = new google.maps.Marker({
        position: e.latLng,
        map,
        title: name,
      });
      insertMode = false;

      addMoreArround(name || 'Nhập Tên', distanceMode?.toUpperCase() == 'C' ? 'chim bay' : 'lái xe', e.latLng);
    }
  });

  const drawingManager = new google.maps.drawing.DrawingManager({ ...getDrawManagerOptions(), map });
  // drawingManager.setMap(map);
  google.maps.event.addListener(drawingManager, "overlaycomplete", handleDrawingCompleted(map, data));

  new google.maps.Marker({ position: data.targetLocation, map, icon: "./images/vi-tri.png" });

  setIntro(data.intro);

  await delay(3000);
  for (let x = 9; x < 16; x++) {
    await delay(500);
    map.setZoom(x);
  }

  const animatePlace = async (index: number) => {
    const place = data.arrounds[index];

    const placeIcon = new google.maps.Marker({
      position: place.location,
      map,
      icon: `./images/${place.icon || "pin"}.png`,
    });

    const drawLineFn = drawLine(map, data, index, placeIcon);
    const drawRouteFn = drawRoute(map, data, index, placeIcon);


    if (place.distanceMode == DistanceMode_LINE) {
      return await drawLineFn();
    } else {
      return await drawRouteFn();
    }
  }

  await delay(3000);
  for (let index = 0; index < data.arrounds.length; index++) {
    const displayOnMapFunc = await animatePlace(index);
    allArroundObject.push({ func: displayOnMapFunc, isShow: false });
  }

  await delay(1000);
  map.setZoom(DEFAULT_ZOOM);
  map.setCenter(data.targetLocation);

  showAllArroundObject();
  showArroundHtmlList();
}

document.addEventListener('keydown', function (event) {
  if (event.code == 'Digit1') {
    hideAllArroundObject();
    hideArroundHtmlList();
  }
  if (event.code == 'Digit2') {
    showAllArroundObject();
    showArroundHtmlList()
  }

  if (event.code == 'Delete') {
    clearAllDrawings();
  }

  if (event.code == "KeyQ") {
    maptypeId = ++maptypeId % 4;
    const mapTypes = [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.TERRAIN];
    map.setMapTypeId(mapTypes[maptypeId]);
  }

  if (event.code == 'KeyA') {
    insertMode = true;
  }
});

declare global {
  interface Window {
    initMap: () => void;
    run: () => void;
    toggleArroundObject: (index: number) => void
  }
}

let maptypeId = 0;

window.run = initMap2;
window.toggleArroundObject = toggleArroundObject;
window.initMap = () => {
  loadScriptToRun();
  console.log('done done')
}
export { };
