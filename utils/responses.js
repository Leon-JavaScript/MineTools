import { STATUS } from "../config/constants";

const JSON_INDENT_SPACES = 2;

export function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data, null, JSON_INDENT_SPACES), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers
    }
  });
}

function errorResponse(statusCode, statusText, message) {
  return jsonResponse(
    {
      status: statusText,
      message
    },
    statusCode
  );
}

export function badRequest(message) {
  return errorResponse(400, STATUS.BAD_REQUEST, message);
}

export function notFound(message = "Resource not found") {
  return errorResponse(404, STATUS.NOT_FOUND, message);
}

export function tooManyRequests(message = "Rate limit exceeded") {
  return errorResponse(429, STATUS.TOO_MANY_REQUESTS, message);
}

export function internalError(message = "Internal server error") {
  return errorResponse(500, STATUS.INTERNAL_ERROR, message);
}
