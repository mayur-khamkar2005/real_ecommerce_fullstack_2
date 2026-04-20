/**
 * Convert a product name to a stable URL slug / filename stem (e.g. "Nike Shoes" -> "nike-shoes").
 */
function slugifyName(name) {
  if (!name || typeof name !== 'string') return 'product';
  return name
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'product';
}

function imagePathFromName(name) {
  return `/images/${slugifyName(name)}.jpg`;
}

module.exports = { slugifyName, imagePathFromName };
