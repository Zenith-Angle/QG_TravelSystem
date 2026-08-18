import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeHtml,
  isValidCoordinate,
  parseLngLatString,
  parsePolygonString,
  parsePolylineString
} from '../src/utils/security.js';

test('escapeHtml neutralizes markup characters', () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(escapeHtml("Tom & Jerry's"), 'Tom &amp; Jerry&#39;s');
});

test('isValidCoordinate enforces geographic bounds', () => {
  assert.equal(isValidCoordinate(35.9, 104.1), true);
  assert.equal(isValidCoordinate(91, 104.1), false);
  assert.equal(isValidCoordinate(35.9, 181), false);
  assert.equal(isValidCoordinate(Number.NaN, 104.1), false);
});

test('parsePolygonString rejects empty and malformed coordinates', () => {
  assert.equal(parsePolygonString(''), null);
  assert.equal(parsePolygonString('1,2;not-a-point;3,4'), null);
  assert.equal(parsePolygonString('181,2;3,4;5,6'), null);
  assert.deepEqual(parsePolygonString('101,35;102,36;103,35'), [
    [[101, 35], [102, 36], [103, 35]]
  ]);
});

test('coordinate parsers reject malformed route data', () => {
  assert.deepEqual(parseLngLatString('104.1,35.9'), [104.1, 35.9]);
  assert.equal(parseLngLatString(','), null);
  assert.equal(parseLngLatString('104.1, '), null);
  assert.equal(parseLngLatString('181,35.9'), null);
  assert.equal(parsePolylineString('104.1,35.9'), null);
  assert.equal(parsePolylineString('104.1,35.9;not-a-point'), null);
  assert.equal(parsePolygonString('101,35; , ;103,35'), null);
  assert.deepEqual(parsePolylineString('104.1,35.9;105.2,36.1'), [
    [104.1, 35.9],
    [105.2, 36.1]
  ]);
});
