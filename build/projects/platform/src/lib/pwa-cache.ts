/** Clear Workbox runtime caches that may hold user-specific HTML or API data. */
export async function clearRuntimeCaches(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;

  const names = await caches.keys();
  await Promise.all(
    names
      .filter(
        (name) =>
          name.includes("apis") ||
          name.includes("api") ||
          name.startsWith("workbox") ||
          name.startsWith("heartwire") ||
          name === "pages" ||
          name === "start-url" ||
          name.includes("static-image-assets") ||
          name.includes("static-js-assets") ||
          name.includes("static-style-assets") ||
          name.includes("next-static") ||
          name.includes("next-image")
      )
      .map((name) => caches.delete(name))
  );
}
