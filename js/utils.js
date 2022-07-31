/**
 * Makes an element draggable.
 *
 * @param {HTMLElement} element - The element.
 */
function draggable(element) {
  var isMouseDown = false;

  // initial mouse X and Y for `mousedown`
  var mouseX;
  var mouseY;

  // element X and Y before and after move
  var elementX = 0;
  var elementY = 0;

  // mouse button down over the element
  element.addEventListener("mousedown", onMouseDown);
  /**
   * Listens to `mousedown` event.
   *
   * @param {Object} event - The event.
   */
  function onMouseDown(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    isMouseDown = true;
  }

  // mouse button released
  element.addEventListener("mouseup", onMouseUp);

  /**
   * Listens to `mouseup` event.
   *
   * @param {Object} event - The event.
   */
  function onMouseUp(event) {
    isMouseDown = false;
    elementX = parseInt(element.style.left) || 0;
    elementY = parseInt(element.style.top) || 0;
  }

  // need to attach to the entire document
  // in order to take full width and height
  // this ensures the element keeps up with the mouse
  document.addEventListener("mousemove", onMouseMove);

  /**
   * Listens to `mousemove` event.
   *
   * @param {Object} event - The event.
   */
  function onMouseMove(event) {
    if (!isMouseDown) return;
    var deltaX = event.clientX - mouseX;
    var deltaY = event.clientY - mouseY;
    element.style.left = elementX + deltaX + "px";
    element.style.top = elementY + deltaY + "px";
  }
}

const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
window.showAlert = (message, type) => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    "</div>",
  ].join("");

  alertPlaceholder.append(wrapper);
};

draggable(document.getElementById("floating-panel"));

window.createImageFromText = (header, text, scale = 1, fillStyle= "rgb(0, 77, 102)") => {
  var canvas = document.createElement("canvas");

  var ctx = canvas.getContext("2d");

  ctx.font = "700 24px Arial";
  const measureHeader = ctx.measureText(header);

  ctx.font = "100 22px Arial";
  const measureText = ctx.measureText(text);

  canvas.width = scale * Math.max(measureText.width, measureHeader.width) + 20;
  canvas.height =  scale * ( text ? 64 : 40)

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


t = window.createImageFromText('header', 'hello nguyen', 1)
console.log(t[0])
debugger;