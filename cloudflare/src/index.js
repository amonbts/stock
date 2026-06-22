/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	// async fetch(req) {
	// 	const url = new URL(req.url)
	// 	url.pathname = "/__scheduled";
	// 	url.searchParams.append("cron", "* * * * *");
	// 	return new Response(`To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${url.href}".`);
	// },

	// // The scheduled handler is invoked at the interval set in our wrangler.jsonc's
	// // [[triggers]] configuration.
	// async scheduled(event, env, ctx) {
	// 	// A Cron Trigger can make requests to other endpoints on the Internet,
	// 	// publish to a Queue, query a D1 Database, and much more.
	// 	//
	// 	// We'll keep it simple and make an API call to a Cloudflare API:
	// 	let resp = await fetch('https://api.cloudflare.com/client/v4/ips');
	// 	let wasSuccessful = resp.ok ? 'success' : 'fail';

	// 	// You could store this result in KV, write to a D1 Database, or publish to a Queue.
	// 	// In this template, we'll just log the result:
	// 	console.log(`trigger fired at ${event.cron}: ${wasSuccessful}`);
	// },
	async scheduled(event, env, ctx) {
		const url = "https://api.github.com/repos/amonbts/stock/actions/workflows/deploy.yml/dispatches";
		const userAgent = env.GITHUB_USER_AGENT || "stock-cloudflare-scheduler/1.0";

		if (!env.GITHUB_TOKEN) {
			throw new Error("Missing GITHUB_TOKEN secret in Worker environment");
		}

		const res = await fetch(url, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${env.GITHUB_TOKEN}`,
			"User-Agent": userAgent,
			"Accept": "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			ref: "main"
		})
		});

		if (!res.ok) {
		const body = await res.text();
		const reqId = res.headers.get("x-github-request-id");
		console.error("GitHub dispatch failed:", res.status, { reqId, body });
		throw new Error(`Dispatch failed: ${res.status}`);
		}

		console.log("GitHub workflow dispatched");
	}
};
