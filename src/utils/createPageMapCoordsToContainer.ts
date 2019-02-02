export const createPageMapCoordsToContainer = (container: HTMLElement) => {
  return (event: MouseEvent | TouchEvent) => {
    let clientX: number;
    let clientY: number;
    let pageX: number;
    let pageY: number;
    let offsetX: number;
    let offsetY: number;

    if ("changedTouches" in event) {
      ({ clientX, clientY, pageX, pageY } = event.changedTouches[0]);
    } else {
      ({ clientX, clientY, pageX, pageY } = event);
    }
    const { offsetTop, offsetLeft } = container;
    const { top, left } = container.getBoundingClientRect();
    // const htmlRect = document
    //   .getElementsByTagName("html")[0]
    //   .getBoundingClientRect();

    // const elOffsetX = left - htmlRect.left;
    // const elOffsetY = top - htmlRect.top;

    return {
      clientX,
      clientY,
      pageX,
      pageY,
      top,
      left,
      // x: clientX + window.pageXOffset - elOffsetX,
      // y: clientY + window.pageYOffset - elOffsetY
      x: clientX - left,
      y: clientY - top
    };
  };
};
