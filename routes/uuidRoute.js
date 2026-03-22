import { CACHE_TTL_SECONDS, STATUS } from "../config/constants";
import { getCachedEntry, setCachedEntry } from "../utils/cache";
import { badRequest, internalError, jsonResponse, notFound } from "../utils/responses";
import { buildCacheMeta, isUuid, normalizeUuid, nowSeconds } from "../utils/utils";
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
  return cached?.payload?.id && cached?.payload?.name && typeof cached.cachedAt === "number";
}

export async function handleUuidRoute(identifier, env) {
  if (!identifier) {
    return badRequest("Missing username or uuid");
  }

  const input = identifier.trim();
  const inputIsUuid = isUuid(input);
  const normalizedUuid = inputIsUuid ? normalizeUuid(input) : null;
  const cacheKey = inputIsUuid ? uuidIdKey(normalizedUuid) : uuidNameKey(input);

  const cached = await getCachedEntry(env, cacheKey);
  if (isValidCachedIdentity(cached)) {
    const cache = buildCacheMeta(true, CACHE_TTL_SECONDS, cached.cachedAt);
    return jsonResponse(buildResponse(cached.payload, cache));
  }

  try {
    const upstream = inputIsUuid
      ? await lookupByUuid(normalizedUuid)
      : await lookupByUsername(input);

    if (upstream.notFound) {
      return notFound("Player not found");
    }

    const payload = {
      id: upstream.data.id,
      name: upstream.data.name
    };

    await Promise.all([
      setCachedEntry(env, uuidNameKey(payload.name), payload, CACHE_TTL_SECONDS),
      setCachedEntry(env, uuidIdKey(payload.id), payload, CACHE_TTL_SECONDS)
    ]);

    const cache = buildCacheMeta(false, CACHE_TTL_SECONDS, nowSeconds());
    return jsonResponse(buildResponse(payload, cache));
  } catch (error) {
    console.error("UUID route error", error);
    return internalError("Failed to lookup profile");
  }
}
