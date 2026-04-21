export const isNearBottom = (el: HTMLElement, threshold = 80) => {
  const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
  return distance < threshold;
};

