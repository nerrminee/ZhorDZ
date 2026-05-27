const COLOR_MAP = {
  beige: '#d8c3a5',
  bleu: '#3264a8',
  black: '#171412',
  blanc: '#f8f5ef',
  blue: '#3264a8',
  brown: '#7a5138',
  cream: '#f3ead8',
  gold: '#c5a34f',
  gray: '#8f8a82',
  green: '#426f4b',
  gris: '#8f8a82',
  ivory: '#f6f0df',
  noir: '#171412',
  orange: '#d7833f',
  pink: '#df91a8',
  red: '#b63f36',
  rose: '#df91a8',
  rouge: '#b63f36',
  silver: '#bfc1bf',
  vert: '#426f4b',
  white: '#f8f5ef',
}

const FALLBACK_COLORS = ['#d8c3a5', '#7a5138', '#426f4b', '#3264a8', '#b63f36', '#df91a8', '#c5a34f', '#8f8a82']

export function getProductImages(product = {}) {
  if (Array.isArray(product.images) && product.images.length) {
    return product.images.map((image) => image.url || image.imageUrl || image).filter(Boolean)
  }

  return [product.imageUrl || product.image_url].filter(Boolean)
}

export function getColorValue(color = '') {
  const value = String(color).trim()
  const key = value.toLowerCase()

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return value
  if (/^(rgb|hsl)a?\(/i.test(value)) return value

  if (COLOR_MAP[key]) return COLOR_MAP[key]

  const hash = [...key].reduce((total, char) => total + char.charCodeAt(0), 0)
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length]
}
