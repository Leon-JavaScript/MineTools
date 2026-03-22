import { nowSeconds } from "./utils";

function getNamespace(env) {
  return env?.PROFILE_CACHE;
}

export async function getCachedEntry(env, key) {
  const namespace = getNamespace(env);
  if (!namespace) {
    return null;
  }

  const entry = await namespace.get(key, { type: "json" });
  if (!entry || typeof entry !== "object") {
    return null;
  }

  return entry;
}

export async function setCachedEntry(env, key, payload, ttlSeconds) {
  const namespace = getNamespace(env);
  if (!namespace) {
    return;
  }

  await namespace.put(
    key,
    JSON.stringify({
      cachedAt: nowSeconds(),
      payload
    }),
    {
      expirationTtl: ttlSeconds
    }
  );
}
