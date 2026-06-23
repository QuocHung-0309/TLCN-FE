import DOMPurify from "isomorphic-dompurify";

// Nội dung blog là HTML do người dùng tự nhập qua editor contentEditable
// (post-blog/PostForm.tsx) nên phải khử trùng trước khi render bằng
// dangerouslySetInnerHTML để chặn stored XSS (vd: <img onerror=...>).
export function sanitizeBlogHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "b", "strong", "i", "em", "u", "a", "ul", "ol", "li",
      "blockquote", "h2", "h3", "figure", "figcaption", "img", "video", "div", "span",
    ],
    ALLOWED_ATTR: ["href", "src", "controls", "style", "class", "alt", "target", "rel"],
  });
}
