import { enforceRateLimit } from "./middleware/rateLimit";
import { serveDefaultPage } from "./pages/defaultPage";
import { handleProfileRoute } from "./routes/profileRoute";
import { handleUuidRoute } from "./routes/uuidRoute";
import { internalError, notFound } from "./utils/responses";

const ROUTE_HANDLERS = {
  uuid: handleUuidRoute,
  profile: handleProfileRoute
};

function parsePath(pathname) {
  return pathname.split("/").filter(Boolean);
}

function resolveRoute(requestUrl) {
  const { pathname } = new URL(requestUrl);
  const [resource, identifier, ...rest] = parsePath(pathname);

  if (!resource || !identifier || rest.length > 0) {
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
      const { pathname } = new URL(request.url);
      if (pathname === "/") {
        return serveDefaultPage(request);
      }

      const route = resolveRoute(request.url);
      if (!route) {
        return notFound("Route not found");
      }

      const rateLimitedResponse = await enforceRateLimit(request, env);
      if (rateLimitedResponse) {
        return rateLimitedResponse;
      }

      return route.handler(route.identifier, env);
    } catch (error) {
      console.error("Unhandled worker error", error);
      return internalError();
    }
  }
};
