import { tooManyRequests } from "../utils/responses";

export async function enforceRateLimit(request, env) {
  if (!env?.RATE_LIMITER || typeof env.RATE_LIMITER.limit !== "function") {
    return null;
  }

  const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
  const result = await env.RATE_LIMITER.limit({ key: clientIp });

  return result?.success ? null : tooManyRequests();
}
