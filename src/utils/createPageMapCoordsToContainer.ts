export const createPageMapCoordsToContainer = (container: HTMLElement) => {
  return (event: MouseEvent | TouchEvent) => {
    let clientX: number;
    let clientY: number;
    let pageX: number;
    let pageY: number;

    if ("changedTouches" in event) {
      ({ clientX, clientY, pageX, pageY } = event.changedTouches[0]);
    } else {
      ({ clientX, clientY, pageX, pageY } = event);
    }

    const { top, bottom, left, right } = container.getBoundingClientRect();
    return {
      clientX,
      clientY,
      pageX,
      pageY,
      x: clientX - left,
      y: clientY - top
    };
  };
};
