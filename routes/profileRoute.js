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

function uuidNameKey(username) {
  return `uuid:username:${username.toLowerCase()}`;
}

function uuidIdKey(uuid) {
  return `uuid:id:${uuid.toLowerCase()}`;
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

function buildResponseFromProfile(profilePayload, cache) {
  return {
    decoded: profilePayload.decoded,
    raw: {
      ...profilePayload.rawProfile,
      cache,
      status: STATUS.OK
    }
  };
}

function isValidCachedProfile(cached) {
  return Boolean(cached?.payload?.profile?.rawProfile) && typeof cached.cachedAt === "number";
}

function buildIdentityPayload(id, name, profile) {
  return {
    id,
    name,
    profile
  };
}

async function cacheIdentityPayload(env, payload) {
  await Promise.all([
    setCachedEntry(env, uuidNameKey(payload.name), payload, CACHE_TTL_SECONDS),
    setCachedEntry(env, uuidIdKey(payload.id), payload, CACHE_TTL_SECONDS)
  ]);
}

export async function handleProfileRoute(identifier, env) {
  if (!identifier || !isUuid(identifier.trim())) {
    return badRequest("Invalid uuid format");
  }

  const normalizedUuid = normalizeUuid(identifier.trim());
  const cacheKey = uuidIdKey(normalizedUuid);

  const cached = await getCachedEntry(env, cacheKey);
  if (isValidCachedProfile(cached)) {
    const now = nowSeconds();
    const cache = buildCacheMeta(true, CACHE_TTL_SECONDS, cached.cachedAt, now);
    return jsonResponse(buildResponseFromProfile(cached.payload.profile, cache));
  }

  try {
    const upstream = await fetchSessionProfile(normalizedUuid);
    if (upstream.notFound) {
      return notFound("Player profile not found");
    }

    const rawProfile = upstream.data;
    const profile = buildProfilePayload(rawProfile);

    const identityPayload = buildIdentityPayload(rawProfile.id, rawProfile.name, profile);
    await cacheIdentityPayload(env, identityPayload);

    const now = nowSeconds();
    const cache = buildCacheMeta(false, CACHE_TTL_SECONDS, now, now);
    return jsonResponse(buildResponseFromProfile(profile, cache));
  } catch (error) {
    console.error("Profile route error", error);
    return internalError("Failed to fetch profile");
  }
}
