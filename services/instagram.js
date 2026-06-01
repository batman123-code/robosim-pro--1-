// ---------------------------------------------------------------------------
// Instagram service — fetches the latest posts via the official Instagram
// Graph API (the Meta-approved, production approach; NOT scraping).
//
// SETUP (one-time, done by the account owner in their Meta account):
//   1. Convert @actforchange.trust to a Business or Creator account.
//   2. Create an app at https://developers.facebook.com and add the
//      "Instagram" product (Instagram API with Instagram Login).
//   3. Generate a LONG-LIVED access token (valid ~60 days, refreshable).
//   4. Put it in .env as INSTAGRAM_ACCESS_TOKEN.
//
// Docs: https://developers.facebook.com/docs/instagram-platform
// ---------------------------------------------------------------------------

const GRAPH_HOST = "https://graph.instagram.com";
const VERSION = process.env.INSTAGRAM_GRAPH_VERSION || "v21.0";

const FIELDS = [
  "id",
  "caption",
  "media_type",
  "media_url",
  "permalink",
  "thumbnail_url",
  "timestamp",
  "children{media_url,media_type,thumbnail_url}",
].join(",");

function isConfigured() {
  return !!process.env.INSTAGRAM_ACCESS_TOKEN;
}

// Pick a usable image URL for a post (handles IMAGE / VIDEO / CAROUSEL_ALBUM).
function resolveImage(node) {
  if (node.media_type === "VIDEO") {
    return node.thumbnail_url || node.media_url || "";
  }
  if (node.media_type === "CAROUSEL_ALBUM") {
    const first = node.children && node.children.data && node.children.data[0];
    if (first) {
      return first.media_type === "VIDEO"
        ? first.thumbnail_url || first.media_url || ""
        : first.media_url || "";
    }
  }
  return node.media_url || node.thumbnail_url || "";
}

// Normalize a raw Graph node into our cache/event shape.
function normalize(node) {
  return {
    instagramPostId: node.id,
    caption: node.caption || "",
    imageUrl: resolveImage(node),
    permalink: node.permalink || "",
    mediaType: node.media_type || "IMAGE",
    isCarousel: node.media_type === "CAROUSEL_ALBUM",
    timestamp: node.timestamp || new Date().toISOString(),
  };
}

// Fetch the latest posts. Throws a descriptive Error on failure so the sync
// service can decide how to react (cache stays intact on failure).
async function fetchLatestPosts(limit = 12) {
  if (!isConfigured()) {
    throw new Error("INSTAGRAM_ACCESS_TOKEN is not set.");
  }

  console.log("[instagram] Fetching latest posts…");

  const url =
    `${GRAPH_HOST}/${VERSION}/me/media` +
    `?fields=${encodeURIComponent(FIELDS)}` +
    `&limit=${encodeURIComponent(limit)}` +
    `&access_token=${encodeURIComponent(process.env.INSTAGRAM_ACCESS_TOKEN)}`;

  let res;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch (e) {
    throw new Error(
      e.name === "AbortError"
        ? "Instagram request timed out."
        : "Network error reaching Instagram.",
    );
  } finally {
    clearTimeout(timeout);
  }

  let body;
  try {
    body = await res.json();
  } catch (e) {
    throw new Error("Invalid response from Instagram.");
  }

  if (!res.ok || body.error) {
    const err = body.error || {};
    // Rate-limit / throttling codes — surface clearly so we back off.
    if ([4, 17, 32, 613].includes(err.code)) {
      throw new Error("Instagram rate limit reached. Will retry next cycle.");
    }
    if (err.code === 190) {
      throw new Error(
        "Instagram access token is invalid or expired. Refresh INSTAGRAM_ACCESS_TOKEN.",
      );
    }
    throw new Error(err.message || `Instagram API error (HTTP ${res.status}).`);
  }

  if (!Array.isArray(body.data)) {
    throw new Error("Unexpected Instagram response shape.");
  }

  // Validate + normalize; drop any post without a usable image.
  const posts = body.data
    .map(normalize)
    .filter((p) => p.instagramPostId && p.imageUrl);
  console.log("[instagram] Posts received:", posts.length);
  return posts;
}

module.exports = { fetchLatestPosts, isConfigured, normalize };
