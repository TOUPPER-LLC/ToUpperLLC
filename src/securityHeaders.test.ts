import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');
const yml = readFileSync(resolve(root, 'customHttp.yml'), 'utf8');

/** Reads customHttp.yml's `- key:` / `value:` pairs (plain or `>-` folded values) without a YAML library. */
function readHeaders(text: string): Record<string, string> {
  const found: Record<string, string> = {};
  for (const m of text.matchAll(/- key: (\S+)\n\s+value: (>-\n((?:\s{10}.*\n?)+)|.*)/g)) {
    found[m[1]] = m[3] ? m[3].trim().split(/\n\s*/).join(' ') : m[2].trim();
  }
  return found;
}
const headers = readHeaders(yml);
const csp = Object.fromEntries(
  headers['Content-Security-Policy'].split(';').map((d) => {
    const [name, ...values] = d.trim().split(/\s+/);
    return [name, values];
  }),
);

describe('customHttp.yml', () => {
  it('applies the security headers to every path', () => {
    expect(yml.match(/- pattern:/g)).toHaveLength(1);
    expect(yml).toContain("- pattern: '**/*'");
    expect(headers).toMatchObject({
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    });
  });

  it('only allows our own scripts and Google Tag Manager, with no inline or eval', () => {
    expect(csp['default-src']).toEqual(["'self'"]);
    expect(csp['script-src']).toEqual(["'self'", 'https://www.googletagmanager.com', 'https://*.googletagmanager.com']);
    expect(csp['frame-ancestors']).toEqual(["'none'"]);
    expect(csp['connect-src']).toContain('https://*.lambda-url.us-east-1.on.aws');
  });

  it('index.html has no inline executable scripts the policy would block', () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf8');
    for (const [tag] of html.matchAll(/<script\b[^>]*>/g)) {
      expect(tag).toMatch(/type="application\/ld\+json"|\bsrc=/);
    }
  });
});
