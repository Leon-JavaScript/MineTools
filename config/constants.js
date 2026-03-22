export const CACHE_TTL_SECONDS = 12 * 60 * 60;

export const STATUS = {
  OK: "OK",
  NOT_FOUND: "NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  INTERNAL_ERROR: "INTERNAL_ERROR"
};

export const UPSTREAM = {
  LOOKUP_BASE: "https://api.minecraftservices.com/minecraft/profile/lookup",
  SESSION_PROFILE_BASE: "https://sessionserver.mojang.com/session/minecraft/profile"
};
