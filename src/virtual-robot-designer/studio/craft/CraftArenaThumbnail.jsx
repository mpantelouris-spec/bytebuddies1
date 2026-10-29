import React, { useEffect, useState } from 'react';
import { craftPreviewUrl } from './CraftPreview.js';

/** Card preview for a Block Crafter mode: a picture of that arena's real world. */
export default function CraftArenaThumbnail({ mode, title }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    // Draw after paint so opening the mode list stays snappy
    const id = setTimeout(() => setUrl(craftPreviewUrl(mode)), 0);
    return () => clearTimeout(id);
  }, [mode]);
  if (!url) return null;
  return <img src={url} alt={`${title || 'Block Crafter'} world preview`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated' }} />;
}
