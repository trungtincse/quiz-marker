export const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Stored image names are `<uuid>.<ext>`; anything else is rejected. */
export const IMAGE_NAME_RE = /^[0-9a-f-]{36}\.(png|jpg|gif|webp)$/;

export const imageUrl = (name: string) => `/api/images/${name}`;
