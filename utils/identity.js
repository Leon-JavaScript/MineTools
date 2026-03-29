export function uuidNameKey(username) {
  return `uuid:username:${username.toLowerCase()}`;
}

export function uuidIdKey(uuid) {
  return `uuid:id:${uuid.toLowerCase()}`;
}

export function buildIdentityPayload(id, name, profile = null) {
  return {
    id,
    name,
    profile
  };
}
