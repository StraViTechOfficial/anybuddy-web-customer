// Browser notifications were switched off. Browsers that registered the old Firebase worker fetch this
// file on their next visit: it removes itself, so no notifications and no worker remain.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.registration.unregister());
