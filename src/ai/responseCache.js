const MAX_CACHE_SIZE = 50;
const DEFAULT_TTL_MS = 5 * 60 * 1000;

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export function createResponseCache(maxSize = MAX_CACHE_SIZE, ttlMs = DEFAULT_TTL_MS) {
  const cache = new Map();

  function makeKey(prompt, context, provider) {
    const raw = JSON.stringify({ prompt, context, provider });
    return hashString(raw);
  }

  function get(prompt, context, provider) {
    const key = makeKey(prompt, context, provider);
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > ttlMs) {
      cache.delete(key);
      return null;
    }
    return entry.response;
  }

  function set(prompt, context, provider, response) {
    const key = makeKey(prompt, context, provider);
    if (cache.size >= maxSize) {
      const oldest = cache.keys().next().value;
      cache.delete(oldest);
    }
    cache.set(key, { response, timestamp: Date.now() });
  }

  function clear() {
    cache.clear();
  }

  function size() {
    return cache.size;
  }

  function stats() {
    let hits = 0;
    let expired = 0;
    const now = Date.now();
    for (const [, entry] of cache) {
      if (now - entry.timestamp > ttlMs) expired++;
      else hits++;
    }
    return { entries: cache.size, hits, expired };
  }

  return { get, set, clear, size, stats };
}

export const responseCache = createResponseCache();
