// Service Worker for Mobile Performance Optimization
// Implements static asset caching, runtime caching, and cache invalidation

const CACHE_NAME = "dumende-mobile-v1";
const RUNTIME_CACHE = "dumende-runtime-v1";
const API_CACHE = "dumende-api-v1";

// Static assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/dumende-icon.ico",
  // Critical CSS and JS will be added dynamically
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^\/api\/boats/,
  /^\/api\/tours/,
  /^\/api\/reviews/,
  /^\/api\/locations/,
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
  NETWORK_ONLY: "network-only",
  CACHE_ONLY: "cache-only",
};

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
  STATIC_ASSETS: 7 * 24 * 60 * 60 * 1000, // 7 days
  API_RESPONSES: 5 * 60 * 1000, // 5 minutes
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] Failed to cache static assets:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old cache versions
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Main request handler with different caching strategies
async function handleRequest(request) {
  const url = new URL(request.url);

  try {
    // API requests - network first with cache fallback
    if (isApiRequest(url)) {
      return await handleApiRequest(request);
    }

    // Static assets (JS, CSS) - cache first
    if (isStaticAsset(url)) {
      return await handleStaticAsset(request);
    }

    // Images - cache first with long expiration
    if (isImageRequest(url)) {
      return await handleImageRequest(request);
    }

    // HTML pages - stale while revalidate
    if (isHtmlRequest(request)) {
      return await handleHtmlRequest(request);
    }

    // Default - network first
    return await fetch(request);
  } catch (error) {
    console.error("[SW] Request failed:", error);
    return await handleOfflineRequest(request);
  }
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);

  // Only apply caching for GET JSON requests
  if (request.method !== "GET") {
    return fetch(request);
  }

  const cachedResponse = await cache.match(request);

  // Kick off network request in background (SWR)
  const networkPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
        await addCacheTimestamp(request.url, API_CACHE);
      }
      return networkResponse;
    })
    .catch(() => null);

  // If we have a fresh cached response, return it immediately
  if (
    cachedResponse &&
    (await isCacheValid(request.url, API_CACHE, CACHE_DURATIONS.API_RESPONSES))
  ) {
    // Update cache in background
    networkPromise.catch(() => {});
    return cachedResponse;
  }

  try {
    // No (valid) cache: wait for network
    const networkResponse = await networkPromise;
    if (networkResponse) return networkResponse;
    // As a fallback, return stale cache if any
    if (cachedResponse) return cachedResponse;
    throw new Error("Network failed and no cache available");
  } catch (error) {
    // Final fallback
    return new Response("Offline", { status: 503 });
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Return cached version immediately
    return cachedResponse;
  }

  // Not in cache, fetch and cache
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }

    return networkResponse;
  } catch (error) {
    console.error("[SW] Failed to fetch static asset:", request.url);
    throw error;
  }
}

// Handle images with cache-first and long expiration
async function handleImageRequest(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  if (
    cachedResponse &&
    (await isCacheValid(request.url, RUNTIME_CACHE, CACHE_DURATIONS.IMAGES))
  ) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      await addCacheTimestamp(request.url, RUNTIME_CACHE);
    }

    return networkResponse;
  } catch (error) {
    // Return stale cache if available
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Handle HTML requests with stale-while-revalidate
async function handleHtmlRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Start network request in background
  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const responseClone = response.clone();
        await cache.put(request, responseClone);
      }
      return response;
    })
    .catch(() => null);

  // Return cached version immediately if available
  if (cachedResponse) {
    // Update cache in background
    networkPromise.catch(() => {});
    return cachedResponse;
  }

  // No cache, wait for network
  return (await networkPromise) || new Response("Offline", { status: 503 });
}

// Handle offline requests
async function handleOfflineRequest(request) {
  const url = new URL(request.url);

  // Try to find cached version in any cache
  const cacheNames = await caches.keys();

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }
  }

  // Return offline page for HTML requests
  if (isHtmlRequest(request)) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Dumende</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline-message { max-width: 400px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="offline-message">
            <h1>You're Offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>
    `,
      {
        status: 503,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  return new Response("Offline", { status: 503 });
}

// Utility functions
function isApiRequest(url) {
  return API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

function isStaticAsset(url) {
  return /\.(js|css|woff|woff2|ttf|eot)$/.test(url.pathname);
}

function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/.test(url.pathname);
}

function isHtmlRequest(request) {
  return request.headers.get("accept")?.includes("text/html");
}

// Cache timestamp management for expiration
async function addCacheTimestamp(url, cacheName) {
  const timestampCache = await caches.open(`${cacheName}-timestamps`);
  const timestamp = Date.now();

  await timestampCache.put(
    new Request(url),
    new Response(timestamp.toString())
  );
}

async function isCacheValid(url, cacheName, maxAge) {
  try {
    const timestampCache = await caches.open(`${cacheName}-timestamps`);
    const timestampResponse = await timestampCache.match(new Request(url));

    if (!timestampResponse) {
      return false;
    }

    const timestamp = parseInt(await timestampResponse.text());
    const age = Date.now() - timestamp;

    return age < maxAge;
  } catch (error) {
    console.error("[SW] Error checking cache validity:", error);
    return false;
  }
}

// Message handling for cache management
self.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "CLEAR_CACHE":
      clearCache(payload?.cacheName);
      break;

    case "UPDATE_CACHE":
      updateCache(payload?.urls);
      break;

    case "GET_CACHE_STATUS":
      getCacheStatus().then((status) => {
        event.ports[0]?.postMessage({ type: "CACHE_STATUS", payload: status });
      });
      break;
  }
});

// Clear specific cache or all caches
async function clearCache(cacheName) {
  try {
    if (cacheName) {
      await caches.delete(cacheName);
      console.log(`[SW] Cleared cache: ${cacheName}`);
    } else {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      console.log("[SW] Cleared all caches");
    }
  } catch (error) {
    console.error("[SW] Error clearing cache:", error);
  }
}

// Update cache with new URLs
async function updateCache(urls) {
  if (!urls || !Array.isArray(urls)) return;

  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls);
    console.log("[SW] Updated cache with new URLs:", urls);
  } catch (error) {
    console.error("[SW] Error updating cache:", error);
  }
}

// Get cache status information
async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    const status = {};

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      status[cacheName] = {
        size: keys.length,
        urls: keys.map((request) => request.url),
      };
    }

    return status;
  } catch (error) {
    console.error("[SW] Error getting cache status:", error);
    return {};
  }
}

console.log("[SW] Service worker loaded successfully");
