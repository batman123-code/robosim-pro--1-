// ---------------------------------------------------------------------------
// Event Sync service — pulls the latest Instagram posts and reconciles them
// with the local cache (db/store.js). New posts are inserted, existing posts
// are refreshed, duplicates are avoided (keyed by instagramPostId).
//
// On any Instagram failure the existing cache is preserved (we never wipe good
// data because of a transient API error), so the Events page keeps working.
// ---------------------------------------------------------------------------

const instagram = require("./instagram");
const store = require("../db/store");

let syncing = false; // simple in-process lock to avoid overlapping runs

async function syncNow({ limit = 12 } = {}) {
  if (syncing) return { skipped: true, reason: "A sync is already running." };
  syncing = true;
  try {
    if (!instagram.isConfigured()) {
      return {
        ok: false,
        configured: false,
        message: "Instagram not configured (INSTAGRAM_ACCESS_TOKEN missing).",
      };
    }

    const posts = await instagram.fetchLatestPosts(limit);
    const { added, total } = store.upsertEvents(posts);
    console.log(
      `[eventSync] synced ${posts.length} posts (${added} new, ${total} cached).`,
    );
    return { ok: true, configured: true, fetched: posts.length, added, total };
  } catch (err) {
    // Keep the existing cache; just record that the last attempt failed.
    store.setEventsStatus("error");
    console.error("[eventSync] sync failed:", err.message);
    return { ok: false, configured: true, error: err.message };
  } finally {
    syncing = false;
  }
}

// Start the background scheduler for a long-running Node process.
// (On Vercel/serverless, use Vercel Cron to POST /api/events/sync instead —
//  setInterval doesn't survive between serverless invocations.)
function startScheduler() {
  const minutes = Math.max(
    5,
    parseInt(process.env.INSTAGRAM_SYNC_INTERVAL_MINUTES || "20", 10),
  );
  if (!instagram.isConfigured()) {
    console.log(
      "[eventSync] scheduler idle — set INSTAGRAM_ACCESS_TOKEN to enable auto-sync.",
    );
    return;
  }
  console.log(`[eventSync] auto-sync every ${minutes} min.`);
  syncNow(); // run once at boot
  setInterval(syncNow, minutes * 60 * 1000);
}

module.exports = { syncNow, startScheduler };
