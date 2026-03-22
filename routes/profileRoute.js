import { CACHE_TTL_SECONDS, STATUS } from "../config/constants";
import { fetchSessionProfile, lookupByUsername } from "../services/minecraftApi";
import { getCachedEntry, setCachedEntry } from "../utils/cache";
import { badRequest, internalError, jsonResponse, notFound } from "../utils/responses";
import {
  buildCacheMeta,
  decodeBase64Json,
  nowSeconds,
  parseUsernameOrUuid
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
  const parsed = parseUsernameOrUuid(identifier);
  if (!parsed.ok) {
    return badRequest(parsed.message);
  }

  const cacheKey = parsed.kind === "uuid"
    ? uuidIdKey(parsed.normalizedUuid)
    : uuidNameKey(parsed.username);

  const cached = await getCachedEntry(env, cacheKey);
  if (isValidCachedProfile(cached)) {
    const now = nowSeconds();
    const cache = buildCacheMeta(true, CACHE_TTL_SECONDS, cached.cachedAt, now);
    return jsonResponse(buildResponseFromProfile(cached.payload.profile, cache));
  }

  try {
    let resolvedId = parsed.kind === "uuid" ? parsed.normalizedUuid : null;

    // If a username key is already cached without profile, skip an extra lookup.
    if (!resolvedId && cached?.payload?.id) {
      resolvedId = cached.payload.id;
    }

    if (!resolvedId) {
      const identityUpstream = await lookupByUsername(parsed.username);
      if (identityUpstream.notFound) {
        return notFound("Player profile not found");
      }

      resolvedId = identityUpstream.data.id;
    }

    const upstream = await fetchSessionProfile(resolvedId);
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
