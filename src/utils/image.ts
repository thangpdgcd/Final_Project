export const getImageSrc = (img?: string | null): string => {
  if (!img) return '/no-image.png';
  const v = String(img).trim();
  
  // If it's already a URL or a full data-URI, return it as-is
  if (/^https?:\/\//i.test(v) || v.startsWith('data:image/')) {
    return v;
  }
  
  // Basic heuristic to detect MIME type from base64 start
  // PNG: iVBORw0KGgo (starts with iVBOR)
  // JPEG: /9j/
  // WEBP: UklGR (starts with Ukl)
  // GIF: R0lGOD (starts with R0l)
  const head = v.slice(0, 15);
  let mime = 'jpeg'; // Changed to jpeg as default fallback
  
  if (head.includes('iVBOR')) mime = 'png';
  else if (head.includes('/9j/')) mime = 'jpeg';
  else if (head.includes('UklG')) mime = 'webp';
  else if (head.includes('R0lG')) mime = 'gif';
  
  return `data:image/${mime};base64,${v}`;
};
