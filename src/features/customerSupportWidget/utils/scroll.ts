export const isNearBottom = (el: HTMLElement, thresholdPx = 120) => {
  const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
  return distanceToBottom < thresholdPx;
};
