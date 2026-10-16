import DOMPurify from "isomorphic-dompurify";

// HTML from the admin (CMS pages, service descriptions) is cleaned before it is shown. Formatting stays, while
// scripts, event handlers and javascript: links are removed. This works in the browser and in server rendering.
export const safeHtml = (html) => DOMPurify.sanitize(String(html ?? ""));
