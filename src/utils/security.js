/**
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character]);
}

/**
 * @param {number} latitude
 * @param {number} longitude
 * @returns {boolean}
 */
export function isValidCoordinate(latitude, longitude) {
  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -90
    && latitude <= 90
    && longitude >= -180
    && longitude <= 180;
}

/**
 * @param {unknown} value
 * @returns {[number, number] | null}
 */
export function parseLngLatString(value) {
  if (typeof value !== 'string') return null;
  const parts = value.trim().split(',');
  if (parts.length !== 2 || parts.some(part => part.trim() === '')) return null;
  const longitude = Number(parts[0]);
  const latitude = Number(parts[1]);
  return isValidCoordinate(latitude, longitude) ? [longitude, latitude] : null;
}

/**
 * @param {unknown} value
 * @returns {number[][] | null}
 */
export function parsePolylineString(value) {
  if (typeof value !== 'string') return null;
  const coordinates = value.split(';').map(parseLngLatString);
  if (coordinates.length < 2 || coordinates.some(point => point === null)) return null;
  return /** @type {number[][]} */ (coordinates);
}

/**
 * @param {string} value
 * @returns {number[][][] | null}
 */
export function parsePolygonString(value) {
  if (!value || typeof value !== 'string') return null;

  const polygons = value.split('|').map(polygon => polygon.split(';').map(parseLngLatString));

  if (polygons.some(polygon => polygon.length < 3 || polygon.some(point => point === null))) {
    return null;
  }

  return /** @type {number[][][]} */ (polygons);
}
