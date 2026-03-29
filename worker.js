import { enforceRateLimit } from "./middleware/rateLimit";
import { serveDefaultPage } from "./pages/defaultPage";
import { handleProfileRoute } from "./routes/profileRoute";
import { handleUuidRoute } from "./routes/uuidRoute";
import { internalError, notFound } from "./utils/responses";

const ROBOTS_POLICY = "noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate";

const ROUTE_HANDLERS = {
  uuid: handleUuidRoute,
  profile: handleProfileRoute
};

function withRobotsBlocked(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", ROBOTS_POLICY);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function robotsTxtResponse() {
  return new Response("User-agent: *\nDisallow: /\n", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600"
    }
  });
}

function resolveRoute(pathname) {
  if (!pathname || pathname === "/") {
    return null;
  }

  const normalizedPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  const separatorIndex = normalizedPath.indexOf("/");

  if (separatorIndex <= 0) {
    return null;
  }

  const resource = normalizedPath.slice(0, separatorIndex);
  const identifier = normalizedPath.slice(separatorIndex + 1);
  if (!identifier || identifier.includes("/")) {
    return null;
  }

  const handler = ROUTE_HANDLERS[resource];
  if (!handler) {
    return null;
  }

  return { handler, identifier };
}

export default {
  async fetch(request, env) {
    try {
      const pathname = new URL(request.url).pathname;
      if (pathname === "/robots.txt") {
        return withRobotsBlocked(robotsTxtResponse());
      }

      if (pathname === "/") {
        return withRobotsBlocked(serveDefaultPage(request));
      }

      const route = resolveRoute(pathname);
      if (!route) {
        return withRobotsBlocked(notFound("Route not found"));
      }

      const rateLimitedResponse = await enforceRateLimit(request, env);
      if (rateLimitedResponse) {
        return withRobotsBlocked(rateLimitedResponse);
      }

      return withRobotsBlocked(await route.handler(route.identifier, env));
    } catch (error) {
      console.error("Unhandled worker error", error);
      return withRobotsBlocked(internalError());
    }
  }
};
