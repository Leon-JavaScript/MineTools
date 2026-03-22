import { CACHE_TTL_SECONDS, STATUS } from "../config/constants";
import { getCachedEntry, setCachedEntry } from "../utils/cache";
import { badRequest, internalError, jsonResponse, notFound } from "../utils/responses";
import { buildCacheMeta, nowSeconds, parseUsernameOrUuid } from "../utils/utils";
import { lookupByUsername, lookupByUuid } from "../services/minecraftApi";

function uuidNameKey(username) {
  return `uuid:username:${username.toLowerCase()}`;
}

function uuidIdKey(uuid) {
  return `uuid:id:${uuid.toLowerCase()}`;
}

function buildResponse(profile, cache) {
  return {
    cache,
    id: profile.id,
    name: profile.name,
    status: STATUS.OK
  };
}

function isValidCachedIdentity(cached) {
  return Boolean(cached?.payload?.id) && Boolean(cached?.payload?.name) && typeof cached.cachedAt === "number";
}

function buildIdentityPayload(id, name, profile) {
  return {
    id,
    name,
    profile: profile ?? null
  };
}

async function cacheIdentityPayload(env, payload) {
  await Promise.all([
    setCachedEntry(env, uuidNameKey(payload.name), payload, CACHE_TTL_SECONDS),
    setCachedEntry(env, uuidIdKey(payload.id), payload, CACHE_TTL_SECONDS)
  ]);
}

export async function handleUuidRoute(identifier, env) {
  const parsed = parseUsernameOrUuid(identifier);
  if (!parsed.ok) {
    return badRequest(parsed.message);
  }

  const cacheKey = parsed.kind === "uuid"
    ? uuidIdKey(parsed.normalizedUuid)
    : uuidNameKey(parsed.username);

  const cached = await getCachedEntry(env, cacheKey);
  if (isValidCachedIdentity(cached)) {
    const now = nowSeconds();
    const cache = buildCacheMeta(true, CACHE_TTL_SECONDS, cached.cachedAt, now);
    return jsonResponse(buildResponse(cached.payload, cache));
  }

  try {
    const upstream = parsed.kind === "uuid"
      ? await lookupByUuid(parsed.normalizedUuid)
      : await lookupByUsername(parsed.username);

    if (upstream.notFound) {
      return notFound("Player not found");
    }

    const payload = buildIdentityPayload(upstream.data.id, upstream.data.name, null);
    await cacheIdentityPayload(env, payload);

    const now = nowSeconds();
    const cache = buildCacheMeta(false, CACHE_TTL_SECONDS, now, now);
    return jsonResponse(buildResponse(payload, cache));
  } catch (error) {
    console.error("UUID route error", error);
    return internalError("Failed to lookup profile");
  }
}
