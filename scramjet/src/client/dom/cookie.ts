import { ScramjetClient } from "../client";

export default function (client: ScramjetClient, self: typeof window) {
	client.serviceWorker.addEventListener("message", ({ data }) => {
		if (!("scramjet$type" in data)) return;

		if (data.scramjet$type === "cookie") {
			client.cookieStore.setCookies([data.cookie], new URL(data.url));
		}
	});

	client.Trap("Document.prototype.cookie", {
		get() {
			return client.cookieStore.getCookies(client.url, true);
		},
		set(ctx, value: string) {
			client.cookieStore.setCookies([value], client.url);
			const controller = client.descriptors.get(
				"ServiceWorkerContainer.prototype.controller",
				client.serviceWorker
			);
			if (controller) {
				client.natives.call("ServiceWorker.prototype.postMessage", controller, {
					scramjet$type: "cookie",
					cookie: value,
					url: client.url.href,
				});
			}
		},
	});

	// @ts-ignore
	delete self.cookieStore;
}
