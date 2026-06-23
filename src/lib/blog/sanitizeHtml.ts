import sanitizeHtml from "sanitize-html";

// Nội dung blog là HTML do người dùng tự nhập qua editor contentEditable
// (post-blog/PostForm.tsx) nên phải khử trùng trước khi render bằng
// dangerouslySetInnerHTML để chặn stored XSS (vd: <img onerror=...>).
//
// Dùng sanitize-html (pure JS) thay vì isomorphic-dompurify: package đó kéo
// theo jsdom -> html-encoding-sniffer -> @exodus/bytes (ESM-only), require()
// của package này vỡ trên Netlify Functions (ERR_REQUIRE_ESM) vì jsdom không
// được bundle bởi Next mà chạy qua require() gốc của Node trên Lambda.
export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "b", "strong", "i", "em", "u", "a", "ul", "ol", "li",
      "blockquote", "h2", "h3", "figure", "figcaption", "img", "video", "div", "span",
    ],
    allowedAttributes: {
      "*": ["href", "src", "controls", "style", "class", "alt", "target", "rel"],
    },
  });
}
