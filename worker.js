/**
 * Quran Fonts V2 - Cloudflare Worker
 * 
 * Serves Quran font files and manifest directly from Cloudflare R2
 * behind Cloudflare CDN as static URLs (independent of Vercel backend).
 */

export default {
  async fetch(request, env, ctx) {
    // Only allow GET and HEAD requests
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const url = new URL(request.url);
    const prefix = "/quran/fonts/v2/";

    // Check if path starts with the required base prefix
    if (!url.pathname.startsWith(prefix)) {
      return new Response("Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Extract filename relative to /quran/fonts/v2/
    const filename = url.pathname.slice(prefix.length);
    if (!filename || filename.endsWith("/")) {
      return new Response("Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Try primary key path in R2 (v2/<filename>), with fallbacks for bucket structure variations
    const candidateKeys = [
      `v2/${filename}`,
      filename,
      `quran/fonts/v2/${filename}`,
    ];

    let object = null;
    for (const key of candidateKeys) {
      object = await env.FONTS_BUCKET.get(key);
      if (object !== null) break;
    }

    // Plain HTTP 404 response if file is missing (strictly text/plain, no HTML)
    if (object === null) {
      return new Response("Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Build response headers
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    if (object.httpEtag) {
      headers.set("etag", object.httpEtag);
    }

    // CORS headers to enable web fonts across all origins
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");

    // Configure exact headers based on file extension
    if (filename.endsWith(".ttf")) {
      headers.set("Content-Type", "font/ttf");
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    } else if (filename === "manifest.json") {
      headers.set("Content-Type", "application/json");
      headers.set("Cache-Control", "public, max-age=3600");
    }

    // For HEAD requests, do not send the body
    if (request.method === "HEAD") {
      return new Response(null, {
        status: 200,
        headers,
      });
    }

    return new Response(object.body, {
      status: 200,
      headers,
    });
  },
};
