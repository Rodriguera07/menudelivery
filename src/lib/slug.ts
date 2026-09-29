const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

export function slugify(input: string) {
  const base = input
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'loja';
}
