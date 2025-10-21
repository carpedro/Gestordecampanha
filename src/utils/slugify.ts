/**
 * Convert text to URL-friendly slug
 * - Convert to lowercase
 * - Remove accents
 * - Replace spaces with hyphens
 * - Remove special characters
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Generate unique slug by appending number if needed
 */
export function generateUniqueSlug(baseName: string, existingSlugs: string[]): string {
  let slug = slugify(baseName);
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${slugify(baseName)}-${counter}`;
    counter++;
  }
  
  return slug;
}
