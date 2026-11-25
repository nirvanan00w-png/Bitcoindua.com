// Run: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (f) => readFileSync(new URL(f, root), 'utf8');
const html = read('index.html');
const copy = html.replace(/<(script|style|svg)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, ' ');

test('the custom domain survives a deploy', () => {
  assert.equal(read('CNAME').trim(), 'bitcoindua.com');
});

test('both buy links open the same email', () => {
  const links = [...html.matchAll(/class="buy" href="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(links.length, 2);
  assert.equal(links[0], links[1]);
  assert.match(links[0], /^mailto:buy@bitcoindua\.com\?subject=/);
});

test('price is one bitcoin, and $99,999 is only ever an asking price', () => {
  assert.match(copy, /1 BTC/);
  assert.deepEqual(copy.match(/\$\d[\d,]*\d/g), ['$60,000', '$99,999']);
  assert.match(copy, /asking price was \$99,999/);
});

test('The New Scramble call to action is present', () => {
  assert.match(html, /class="more" href="https:\/\/thenewscramble\.com"/);
});

test('every local file the page needs exists', () => {
  const refs = [...html.matchAll(/(?:href|src)="([^"#:]+)"|url\(([^)]+)\)/g)].map((m) => m[1] ?? m[2]);
  assert.ok(refs.length >= 3);
  for (const ref of [...refs, 'og.png']) assert.ok(existsSync(new URL(ref, root)), ref);
});

test('the page loads nothing from third parties', () => {
  for (const [tag] of html.matchAll(/<(?:script|img|iframe|link)\b[^>]*>/g)) {
    if (!tag.includes('rel="canonical"')) assert.doesNotMatch(tag, /https?:\/\//);
  }
});

test('each chapter points at rings that were drawn', () => {
  const rings = new Set([...html.matchAll(/data-year="(\w+)"/g)].map((m) => m[1]));
  assert.equal(rings.size, 14);
  const chapters = [...html.matchAll(/data-from="(\w+)" data-to="(\w+)"/g)];
  assert.equal(chapters.length, 5);
  for (const [, from, to] of chapters) assert.ok(rings.has(from) && rings.has(to));
});

test('copy has no em dashes or curly quotes', () => {
  assert.doesNotMatch(copy, /[–—‘’“”]/);
});
