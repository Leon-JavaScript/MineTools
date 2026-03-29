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
        cache_time_left: 21600,
        cached_at: 1774177200,
        cached_until: 1774220400
    },
    id: "853c80ef3c3749fdaa49938b674adae6",
    name: "jeb_",
    status: "OK"
};

const PROFILE_EXAMPLE = {
    decoded: {
        timestamp: 1774177200000,
        profileId: "853c80ef3c3749fdaa49938b674adae6",
        profileName: "jeb_",
        signatureRequired: true,
        textures: {
            SKIN: {
                url: "http://textures.minecraft.net/texture/7fd9ba42a7c81eeea22f1524271ae85a8e045ce0af5a6ae16c6406ae917e68b5"
            },
            CAPE: {
                url: "http://textures.minecraft.net/texture/9e507afc56359978a3eb3e32367042b853cddd0995d17d0da995662913fb00f7"
            }
        }
    },
    raw: {
        id: "853c80ef3c3749fdaa49938b674adae6",
        name: "jeb_",
        properties: [
            {
                name: "textures",
                value: "ewogICJ0aW1lc3RhbXAiIDogMTc3NDE4Njg4NjU1NiwKICAicHJvZmlsZUlkIiA6ICI4NTNjODBlZjNjMzc0OWZkYWE0OTkzOGI2NzRhZGFlNiIsCiAgInByb2ZpbGVOYW1lIiA6ICJqZWJfIiwKICAic2lnbmF0dXJlUmVxdWlyZWQiIDogdHJ1ZSwKICAidGV4dHVyZXMiIDogewogICAgIlNLSU4iIDogewogICAgICAidXJsIiA6ICJodHRwOi8vdGV4dHVyZXMubWluZWNyYWZ0Lm5ldC90ZXh0dXJlLzdmZDliYTQyYTdjODFlZWVhMjJmMTUyNDI3MWFlODVhOGUwNDVjZTBhZjVhNmFlMTZjNjQwNmFlOTE3ZTY4YjUiCiAgICB9LAogICAgIkNBUEUiIDogewogICAgICAidXJsIiA6ICJodHRwOi8vdGV4dHVyZXMubWluZWNyYWZ0Lm5ldC90ZXh0dXJlLzllNTA3YWZjNTYzNTk5NzhhM2ViM2UzMjM2NzA0MmI4NTNjZGRkMDk5NWQxN2QwZGE5OTU2NjI5MTNmYjAwZjciCiAgICB9CiAgfQp9",
                signature: "r/A1vUnxmCsYAmaUv+AdHLAapq9epW64UQE4aWgtywZjgdSQce0xSoXQMKxU2u9m421HOCIIQTKL13VfpfMjYf36qQzYW+7S8trOzV2hebZS7a5IUFJY1/xaPcHkUFGAyBTtlKWME7HJYPAD8OoiBFK/7sljIib1yQJWBHaoZYJYHAAFkwJ+lnlMD803xPs0Rn0QKlptloVQbgkTSyeOCGhFOBX8f26yQ53oM/PsdutpwSK4DYdLmMEQ6KXvWzTK8rVtjBCJ9Xz6zujHLR5zBXynDxgQdSNM4elgSpX8EQwbutSwLK9zyKQ2Sun1zAaY+mJ+B+RGgxnGJwm0Kwu1MUf+1u/Bx26ZNOQLst4wkKRh+sB85vW3mU6DqQmoNUv00WNxt5lmU7tauv3dmqiWSfZTbtyD+OUh/AQoXPT6uvC4s965MeYnUrH3efGXD47IeCcwbzR7R82l5kjIRUmofwVyqc7gDhbE2UzI/A7G12buNST9HnyAwVtJAMRf1q58ZPpqLUnhF60Y+XtFKX0x6pM+Bn0t0cNterVyF/eMKF0rI1H4JwAhpkNfztQWBhz7Dl4Ei5yKpW1ekh546tZJjZsqX665CY0yDgsgSOPahxO70uOTiVEIki1OrLghxeyowNAW6BPj2E8JYAnxK8C5njBk8XaaaSyGWIuNLb9SSGc="
            }
        ],
        profileActions: [],
        cache: {
            HIT: true,
            cache_time: 43200,
            cache_time_left: 21600,
            cached_at: 1774177200,
            cached_until: 1774220400
        },
        status: "OK"
    }
};

function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
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
        .replace("__PROFILE_USAGE__", escapeHtml(`${base}/profile/jeb_\n${base}/profile/853c80ef3c3749fdaa49938b674adae6`))
        .replace("__UUID_EXAMPLE__", renderJson(UUID_EXAMPLE))
        .replace("__PROFILE_EXAMPLE__", renderJson(PROFILE_EXAMPLE));

    return new Response(html, {
        headers: {
            "content-type": "text/html; charset=utf-8"
        }
    });
}
