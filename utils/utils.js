const UUID_NO_DASHES_REGEX = /^[0-9a-fA-F]{32}$/;
const UUID_DASHED_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isUuid(value) {
  return UUID_NO_DASHES_REGEX.test(value) || UUID_DASHED_REGEX.test(value);
}

export function normalizeUuid(value) {
  return value.toLowerCase().replace(/-/g, "");
}

export function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

export function buildCacheMeta(hit, ttlSeconds, cachedAtSeconds, currentTimeSeconds = nowSeconds()) {
  const now = currentTimeSeconds;
  const cachedUntil = cachedAtSeconds + ttlSeconds;

  return {
    HIT: hit,
    cache_time: ttlSeconds,
    cache_time_left: Math.max(0, cachedUntil - now),
    cached_at: cachedAtSeconds,
    cached_until: cachedUntil
  };
}

export function decodeBase64Json(value) {
  return JSON.parse(atob(value));
}
