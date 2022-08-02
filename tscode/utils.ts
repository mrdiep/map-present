export const parseLatLng = (str: string): google.maps.LatLng => {
  const longLatX = str.split(",").map((x) => parseFloat(x.trim()));
  return new google.maps.LatLng(longLatX[0], longLatX[1]);
};

export const delay = (timeInMils: number) =>
  new Promise((solve) => {
    setTimeout(() => {
      return solve(true);
    }, timeInMils);
  });

export const center = (a: google.maps.LatLng, b: google.maps.LatLng): google.maps.LatLng => {
  const lat = a.lat() + b.lat();
  const lng = a.lng() + b.lng();

  return new google.maps.LatLng(lat / 2, lng / 2);
};

export const createImageFromText = (header: string, text: string, scale: number = 1, fillStyle: string | null = "#ff0030"): [string, number, number] => {
  var canvas = document.createElement("canvas");

  var ctx = canvas.getContext("2d");
  if (!ctx) return ['', 0, 0]
  ctx.font = "700 24px Arial";
  const measureHeader = ctx.measureText(header);

  ctx.font = "100 22px Arial";
  const measureText = ctx.measureText(text);

  canvas.width = scale * Math.max(measureText.width, measureHeader.width) + 20;
  canvas.height = scale * (text ? 64 : 40)

  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fillRect(0, 0, 500, 70);
  }
  ctx.fillStyle = fillStyle ? "#ffffcc" : '#ff0066';
  ctx.font = "700 24px Arial";
  ctx.scale(scale, scale);
  ctx.fillText(header, 10, 25);

  ctx.fillStyle = fillStyle ? "white" : "#ff0066";
  ctx.font = "100 22px Arial";

  ctx.fillText(text, 10, 55);

  return [canvas.toDataURL(), canvas.width, canvas.height];
};

export const dashedLineIcon = [
  {
    icon: {
      path: "M 0,-1 0,1",
      strokeOpacity: 0.8,
      scale: 3,
    },
    offset: "0",
    repeat: "20px",
  },
]

export const getDistanceText = (a: google.maps.LatLng, b: google.maps.LatLng) =>
  (google.maps.geometry.spherical.computeDistanceBetween(a, b) / 1000).toFixed(1) + "km";

export const hideObjectTimeout = (...obj) => {
  setTimeout(() => {
    obj.forEach(x => x?.setMap(null))
  }, 2000)
}

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

export const refinePath = (paths) => {
  const newPath: google.maps.LatLng[] = [];
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

    let start: google.maps.LatLng = point1;
    for (let i = 0; i < willAddPoint; i++) {
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