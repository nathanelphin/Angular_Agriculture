'use client';

import { useEffect } from 'react';

function setDescription(content: string) {
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

/**
 * Sets the document title (+ optional meta description) for the current view.
 * SiteShell resets a sensible base title on every navigation; views call this
 * hook once their data resolves to refine it (e.g. product/story names).
 */
export function useSeo(title?: string, description?: string) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) setDescription(description);
  }, [title, description]);
}
