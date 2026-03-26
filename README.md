# MineTools

A blazingly fast Cloudflare Worker API for Minecraft player identity and profile lookups. Resolve Minecraft usernames and UUIDs to player data with built-in caching, rate limiting, and optimized performance.

> **⚠️ Disclaimer:** This is an independent recreation project and is **not affiliated with** `api.minetools.eu`, **Mojang**, or **Microsoft**. This service aggregates data from official Minecraft APIs for educational and development purposes.

> **Note:** This project is deployed as a Cloudflare Worker with zero-cold-start execution, making it ideal for serverless Minecraft data services.

## Features

- ⚡ **Lightning-Fast Lookups** - Optimized route parsing and precompiled regex patterns
- 🔒 **Player Identity Resolution** - Convert usernames ↔ UUIDs with caching
- 👤 **Profile Textures & Metadata** - Fetch Minecraft player profiles with decoded texture data
- 💾 **Intelligent Caching** - 12-hour TTL with dual-key KV storage (by UUID and username)
- 🛡️ **Rate Limiting** - Built-in per-IP rate limiting (90 req/60s)
- 📖 **Interactive Documentation** - Comprehensive dashboard at `/` with examples and error reference
- 🎯 **Flexible Input** - Query by username OR UUID for all endpoints

## Usage

Access the API through your deployed endpoint (e.g., `https://your-worker.dev/`).

Visit the root endpoint (`/`) to see the interactive documentation dashboard with examples and error reference.

## API Endpoints

### 1. UUID Route - Player Identity Lookup

Resolve a Minecraft username or UUID to player identity information.

**Endpoint:**
```
GET /uuid/{username_or_uuid}
```

**Parameters:**
- `{username_or_uuid}` - A Minecraft username (case-insensitive) or UUID (with or without dashes)

**Example Requests:**
```bash
# By username
curl https://your-worker.dev/uuid/jeb_

# By UUID (with dashes)
curl https://your-worker.dev/uuid/8667ba71-b29a-4d67-abb5-a206094d940e

# By UUID (no dashes)
curl https://your-worker.dev/uuid/8667ba71b29a4d67abb5a206094d940e
```

**Success Response (200):**
```json
{
  "cache": {
    "hit": true,
    "cache_time_left": 43195
  },
  "id": "8667ba71b29a4d67abb5a206094d940e",
  "name": "jeb_",
  "status": "ok"
}
```

**Error Responses:**
- `400 Bad Request` - Missing or invalid username/UUID
- `404 Not Found` - Player not found in Minecraft database
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Upstream service error

---

### 2. Profile Route - Player Profile & Textures

Fetch detailed player profile including texture data (skin and cape).

**Endpoint:**
```
GET /profile/{username_or_uuid}
```

**Parameters:**
- `{username_or_uuid}` - A Minecraft username (case-insensitive) or UUID (with or without dashes)

**Example Requests:**
```bash
# By username
curl https://your-worker.dev/profile/jeb_

# By UUID
curl https://your-worker.dev/profile/8667ba71-b29a-4d67-abb5-a206094d940e
```

**Success Response (200):**
```json
{
  "cache": {
    "hit": true,
    "cache_time_left": 43192
  },
  "id": "8667ba71b29a4d67abb5a206094d940e",
  "name": "jeb_",
  "profile": {
    "textures": {
      "SKIN": {
        "url": "http://textures.minecraft.net/texture/...",
        "metadata": {
          "model": "classic"
        }
      },
      "CAPE": {
        "url": "http://textures.minecraft.net/texture/..."
      }
    }
  },
  "status": "ok"
}
```

**Error Responses:**
- `400 Bad Request` - Missing or invalid username/UUID
- `404 Not Found` - Player or profile not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Upstream service error

---

### 3. Documentation Route

Interactive documentation dashboard with API usage examples and error reference.

**Endpoint:**
```
GET /
```

## Rate Limiting

The API implements per-IP rate limiting:

- **Limit:** 90 requests per 60 seconds
- **Per:** Client IP address
- **Response:** 429 Too Many Requests (when exceeded)

Rate limit counters are tracked by Cloudflare's edge network and reset every 60 seconds.

## Caching Strategy

MineTools uses an efficient unified cache schema:

- **Scope:** Each player identity is cached once per KV entry
- **TTL:** 12 hours
- **Keys:** Dual-indexed by UUID and username for fast lookups
  - `uuid:id:{normalized_uuid}` → Full identity + profile data
  - `uuid:username:{username}` → Same entry (KV replication)
- **Metadata:** Cache hit status and remaining TTL returned with each response

### Cache Behavior

- **First Request:** Queries Minecraft API, stores result in cache
- **Subsequent Requests (within TTL):** Returns cached entry with `hit: true` and remaining TTL
- **After TTL Expires:** Fresh lookup from Minecraft API, cache refreshed

## Performance Optimizations

- **Fast Route Parsing** - O(1) route resolution using string indexing
- **Precompiled Regex** - UUID validation patterns compiled once at startup
- **Cached Profile Decode** - Base64 texture decoding cached to avoid repeated work
- **Dual-Key Caching** - Single KV entry indexed by both UUID and username
- **Pretty-Printed JSON** - Automatic JSON formatting for browser readability

## Error Handling

All errors follow a consistent format:

```json
{
  "status": "error",
  "message": "Human-readable error message"
}
```

Common error scenarios:

| Status | Scenario | Example |
|--------|----------|---------|
| 400 | Invalid input | Missing username/UUID |
| 404 | Not found | Username doesn't exist in Minecraft DB |
| 429 | Rate limited | Exceeded 90 req/60s per IP |
| 500 | Server error | Minecraft API unavailable |

## Upstream Dependencies

MineTools queries these official Minecraft APIs:

- **Minecraft API** - `api.minecraftservices.com` for username↔UUID resolution
- **Session Server** - `sessionserver.mojang.com` for player profile textures

Both services are maintained by Mojang and are the official Minecraft player data sources.

## License

MIT © Leon-JavaScript

See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- 📖 Visit the API dashboard at `/` for full documentation
- 🐛 Report issues on [GitHub Issues](https://github.com/Leon-JavaScript/MineTools/issues)
- 💭 Discuss ideas in [GitHub Discussions](https://github.com/Leon-JavaScript/MineTools/discussions)