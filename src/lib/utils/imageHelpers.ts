/**
 * Converts a clash-of-clans-data image path (relative, no leading slash)
 * to an absolute public URL for use in <Image> or <img> src.
 *
 * Package paths look like: "images/home/troops/barbarian/icon.png"
 * Public folder mirrors this structure, so the URL is: "/images/home/troops/barbarian/icon.png"
 */
export function toPublicImageUrl(path: string | undefined | null): string {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
}
