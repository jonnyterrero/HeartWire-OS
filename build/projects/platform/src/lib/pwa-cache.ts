/** Clear Workbox runtime caches that may hold user-specific responses. */
export async function clearRuntimeCaches(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;

  const names = await caches.keys();
  await Promise.all(
    names
      .filter(
        (name) =>
          name.includes("apis") ||
          name.includes("api") ||
          name.startsWith("workbox")
      )
      .map((name) => caches.delete(name))
  );
}
