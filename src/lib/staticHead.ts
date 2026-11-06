/**
 * index.html (and each pre-rendered page) ships title/description/share tags marked
 * `data-static-head` for crawlers that don't run JavaScript. Once React takes over it renders
 * the page's own tags, so the static copies are removed to avoid duplicates.
 */
export function removeStaticHead(doc: Document = document) {
  doc.head.querySelectorAll('[data-static-head]').forEach((el) => el.remove());
}
