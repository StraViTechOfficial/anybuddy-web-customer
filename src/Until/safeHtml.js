import DOMPurify from "isomorphic-dompurify";

// HTML from the admin (CMS pages, service descriptions) is cleaned before it is shown: formatting stays, scripts,
// event handlers and javascript: links go. Works in the browser and in server rendering.
export const safeHtml = (html) => DOMPurify.sanitize(String(html ?? ""));
