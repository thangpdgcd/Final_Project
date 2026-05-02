/** Cloudinary delivery: brighten + contrast so faces read better in small UI crops. */
const CLOUDINARY_AVATAR_ENHANCE = 'e_improve,e_brightness:12,e_contrast:10';

/**
 * Inserts avatar-friendly transforms into a Cloudinary image URL when missing.
 * Skips if `e_improve` is already present.
 */
export const enhanceCloudinaryAvatarUrl = (url: string): string => {
  const v = String(url).trim();
  if (!v || /e_improve/i.test(v)) return v;
  if (!/cloudinary\.com\//i.test(v) || !/\/image\/upload\//i.test(v)) return v;

  if (/\/image\/upload\/v\d+\//.test(v)) {
    return v.replace(/\/image\/upload\/(v\d+\/)/, `/image/upload/${CLOUDINARY_AVATAR_ENHANCE}/$1`);
  }
  if (/\/image\/upload\/[^/]+\/v\d+\//.test(v)) {
    return v.replace(
      /\/image\/upload\/([^/]+)\/(v\d+\/)/,
      `/image/upload/$1,${CLOUDINARY_AVATAR_ENHANCE}/$2`,
    );
  }
  return v;
};

export const getImageSrc = (img?: string | null): string => {
  // Keep a guaranteed existing fallback asset from /public
  if (!img) return '/favicon.png';
  const v = String(img).trim();

  // If it's already a URL or a full data-URI, return it as-is
  if (/^https?:\/\//i.test(v) || v.startsWith('data:image/')) {
    // If the site is https, upgrade http image URLs to https to avoid mixed-content blocks.
    if (
      /^http:\/\//i.test(v) &&
      typeof window !== 'undefined' &&
      window.location?.protocol === 'https:'
    ) {
      return v.replace(/^http:\/\//i, 'https://');
    }
    return v;
  }

  // Handle protocol-relative URLs
  if (v.startsWith('//')) {
    return `https:${v}`;
  }

  // Handle Cloudinary URLs that were saved without protocol
  // e.g. "res.cloudinary.com/<cloud>/image/upload/..."
  if (/^res\.cloudinary\.com\//i.test(v) || /^.*cloudinary\.com\//i.test(v)) {
    return `https://${v.replace(/^https?:\/\//i, '')}`;
  }

  // Allow app-relative/static paths
  if (v.startsWith('/')) return v;

  // Allow relative file paths (common in stored DB values or older codepaths)
  // e.g. "assets/foo.png", "uploads/foo.jpg", "./img/logo.svg"
  if (/\.(png|jpe?g|webp|gif|svg)$/i.test(v)) return v;

  // Only treat as base64 when it clearly looks like one.
  const looksLikeBase64 = v.length >= 80 && /^[A-Za-z0-9+/=\s]+$/.test(v) && !/\s{2,}/.test(v);
  if (!looksLikeBase64) return '/favicon.png';

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

/** Same as {@link getImageSrc}, plus Cloudinary avatar enhancement when applicable. */
export const getAvatarImageSrc = (img?: string | null): string => {
  const base = getImageSrc(img);
  if (base === '/no-image.png' || /^data:image\//.test(base)) return base;
  if (/cloudinary\.com/i.test(base)) return enhanceCloudinaryAvatarUrl(base);
  return base;
};

/** Tailwind: bias crop toward upper face + mild lift for dark / contrasty photos */
export const AVATAR_DISPLAY_IMG_CLASS =
  'w-full h-full object-cover object-[center_24%] brightness-[1.06] contrast-[1.08] saturate-[1.04]';
