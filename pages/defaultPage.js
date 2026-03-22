import cssTemplate from "./defaultPage.css";
import htmlTemplate from "./defaultPage.html";

function asText(templateModule) {
    if (typeof templateModule === "string") {
        return templateModule;
    }

    if (templateModule && typeof templateModule.default === "string") {
        return templateModule.default;
    }

    return String(templateModule ?? "");
}

const UUID_EXAMPLE = {
    cache: {
        HIT: true,
        cache_time: 43200,
        cache_time_left: 28910,
        cached_at: 1774166400,
        cached_until: 1774209600
    },
    id: "853c80ef3c3749fdaa49938b674adae6",
    name: "jeb_",
    status: "OK"
};

const PROFILE_EXAMPLE = {
    decoded: {
        profileId: "853c80ef3c3749fdaa49938b674adae6",
        profileName: "jeb_",
        signatureRequired: true,
        textures: {
            SKIN: {
                url: "http://textures.minecraft.net/texture/a846b82963924cb13211122489263941d1403689f90151120d5234be4a73fb"
            }
        },
        timestamp: 1521401553373
    },
    raw: {
        id: "853c80ef3c3749fdaa49938b674adae6",
        name: "jeb_",
        properties: [
            {
                name: "textures",
                value: "<base64>",
                signature: "<signature>"
            }
        ],
        cache: {
            HIT: true,
            cache_time: 43200,
            cache_time_left: 29712,
            cached_at: 1774166400,
            cached_until: 1774209600
        },
        status: "OK"
    }
};

function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderJson(value) {
    return escapeHtml(JSON.stringify(value, null, 2));
}

export function serveDefaultPage(request) {
    const url = new URL(request.url);
    const base = `${url.protocol}//${url.host}`;
    const htmlSource = asText(htmlTemplate);
    const cssSource = asText(cssTemplate);

    const html = htmlSource
        .replace("/*__INLINE_CSS__*/", cssSource)
        .replace("__UUID_USAGE__", escapeHtml(`${base}/uuid/jeb_\n${base}/uuid/853c80ef3c3749fdaa49938b674adae6`))
        .replace("__PROFILE_USAGE__", escapeHtml(`${base}/profile/853c80ef3c3749fdaa49938b674adae6`))
        .replace("__UUID_EXAMPLE__", renderJson(UUID_EXAMPLE))
        .replace("__PROFILE_EXAMPLE__", renderJson(PROFILE_EXAMPLE));

    return new Response(html, {
        headers: {
            "content-type": "text/html; charset=utf-8"
        }
    });
}
