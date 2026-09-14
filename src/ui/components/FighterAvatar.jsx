/**
 * FighterAvatar.jsx — a face for the name.
 *
 * Fetches a headshot from Wikipedia's public REST summary API (CC/public-domain
 * images already hosted on Wikimedia Commons, CORS-open, no key required) and
 * falls back to a deterministic initials badge when a fighter has no page, no
 * image, or the request fails. Results are cached in memory for the session so
 * re-rendering the same fighter across rounds never re-fetches.
 */

import { useEffect, useState } from 'react';

const cache = new Map();

// Wikipedia disambiguates these names, so the plain title has no infobox
// image (or resolves to a different person's page). Point at the exact
// title that carries the fighter's photo.
const WIKI_TITLE_OVERRIDES = {
  'Sean O’Malley': "Sean O'Malley (fighter)",
  'Kyle Nelson': 'Kyle Nelson (fighter)',
  'Jim Miller': 'Jim Miller (fighter)',
  'Sean Brady': 'Sean Brady (fighter)',
  'Robert Whittaker': 'Robert Whittaker (fighter)',
  'Anthony Johnson': 'Anthony Johnson (fighter)',
  'Johnny Walker': 'Johnny Walker (fighter)',
  'Alexander Volkov': 'Alexander Volkov (fighter)',
  'Viviane Araújo': 'Viviane Araújo (fighter)',
};

const PALETTE = ['#e5142e', '#4d9fff', '#f5b93a', '#24d07a', '#a855f7', '#43e5c8'];

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initialsFor(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

async function fetchHeadshot(name) {
  if (cache.has(name)) return cache.get(name);
  const promise = (async () => {
    try {
      const title = encodeURIComponent((WIKI_TITLE_OVERRIDES[name] ?? name).replace(/ /g, '_'));
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.thumbnail?.source ?? null;
    } catch {
      return null;
    }
  })();
  cache.set(name, promise);
  return promise;
}

export default function FighterAvatar({ name, size = 44, className = '' }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    setSrc(null);
    setFailed(false);
    fetchHeadshot(name).then(url => {
      if (!live) return;
      if (url) setSrc(url); else setFailed(true);
    });
    return () => { live = false; };
  }, [name]);

  const style = { '--avatar-size': `${size}px` };

  if (src && !failed) {
    return (
      <span className={`fighteravatar ${className}`} style={style}>
        <img
          src={src}
          alt=""
          className="fighteravatar__img"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={`fighteravatar fighteravatar--initials ${className}`}
      style={{ ...style, '--avatar-color': colorFor(name) }}
    >
      {initialsFor(name)}
    </span>
  );
}
