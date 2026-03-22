import { CACHE_TTL_SECONDS, STATUS } from "../config/constants";
import { fetchSessionProfile } from "../services/minecraftApi";
import { getCachedEntry, setCachedEntry } from "../utils/cache";
import { badRequest, internalError, jsonResponse, notFound } from "../utils/responses";
import {
  buildCacheMeta,
  decodeBase64Json,
  isUuid,
  normalizeUuid,
  nowSeconds
} from "../utils/utils";

function profileKey(uuidNoDashes) {
  return `profile:${uuidNoDashes}`;
}

function decodeTextures(rawProfile) {
  const texturesProperty = rawProfile.properties?.find((property) => property.name === "textures");
  return texturesProperty?.value ? decodeBase64Json(texturesProperty.value) : null;
}

function buildProfilePayload(rawProfile) {
  return {
    decoded: decodeTextures(rawProfile),
    rawProfile
  };
}

function buildResponseFromPayload(payload, cache) {
  // Backward compatibility for cache entries written before decoded payload caching.
  if (!payload?.rawProfile) {
    return {
      decoded: decodeTextures(payload),
      raw: {
        ...payload,
        cache,
        status: STATUS.OK
      }
    };
  }

  return {
    decoded: payload.decoded,
    raw: {
      ...payload.rawProfile,
      cache,
      status: STATUS.OK
    }
  };
}

function isValidCachedProfile(cached) {
  return Boolean(cached?.payload) && typeof cached.cachedAt === "number";
}

export async function handleProfileRoute(identifier, env) {
  if (!identifier || !isUuid(identifier.trim())) {
    return badRequest("Invalid uuid format");
  }

  const normalizedUuid = normalizeUuid(identifier.trim());
  const cacheKey = profileKey(normalizedUuid);

  const cached = await getCachedEntry(env, cacheKey);
  if (isValidCachedProfile(cached)) {
    const now = nowSeconds();
    const cache = buildCacheMeta(true, CACHE_TTL_SECONDS, cached.cachedAt, now);
    return jsonResponse(buildResponseFromPayload(cached.payload, cache));
  }

  try {
    const upstream = await fetchSessionProfile(normalizedUuid);
    if (upstream.notFound) {
      return notFound("Player profile not found");
    }

    const rawProfile = upstream.data;
    const profilePayload = buildProfilePayload(rawProfile);
    await setCachedEntry(env, cacheKey, profilePayload, CACHE_TTL_SECONDS);

    const now = nowSeconds();
    const cache = buildCacheMeta(false, CACHE_TTL_SECONDS, now, now);
    return jsonResponse(buildResponseFromPayload(profilePayload, cache));
  } catch (error) {
    console.error("Profile route error", error);
    return internalError("Failed to fetch profile");
  }
}
