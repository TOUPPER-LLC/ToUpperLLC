import { afterEach, describe, expect, it } from 'vitest';
import { removeStaticHead } from './staticHead';

afterEach(() => {
  document.head.innerHTML = '';
});

describe('removeStaticHead', () => {
  it('removes the default and pre-rendered tags but keeps everything else', () => {
    document.head.innerHTML = `
      <meta charset="utf-8">
      <title data-static-head>Old</title>
      <meta data-static-head name="description" content="Old">
      <link data-static-head rel="canonical" href="https://toupperllc.com/">
      <link rel="icon" href="/favicon.ico">`;

    removeStaticHead();

    expect(document.head.querySelectorAll('[data-static-head]')).toHaveLength(0);
    expect(document.head.querySelector('meta[charset]')).not.toBeNull();
    expect(document.head.querySelector('link[rel="icon"]')).not.toBeNull();
  });
});
