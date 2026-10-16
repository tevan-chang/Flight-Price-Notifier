import { useEffect } from "react";

type DocumentMeta = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
};

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

// SPA replacement for per-route <head> metadata.
export function useDocumentMeta({ title, description, ogTitle, ogDescription }: DocumentMeta) {
  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", ogTitle);
    setMeta("property", "og:description", ogDescription);
  }, [title, description, ogTitle, ogDescription]);
}
