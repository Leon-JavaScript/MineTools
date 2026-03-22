import { UPSTREAM } from "../config/constants";

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { accept: "application/json" }
  });

  if (response.status === 404) {
    return { notFound: true };
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Upstream request failed (${response.status}): ${body}`);
  }

  return { data: await response.json() };
}

export function lookupByUsername(username) {
  return fetchJson(`${UPSTREAM.LOOKUP_BASE}/name/${encodeURIComponent(username)}`);
}

export function lookupByUuid(uuidNoDashes) {
  return fetchJson(`${UPSTREAM.LOOKUP_BASE}/${uuidNoDashes}`);
}

export function fetchSessionProfile(uuidNoDashes) {
  return fetchJson(`${UPSTREAM.SESSION_PROFILE_BASE}/${uuidNoDashes}?unsigned=false`);
}
