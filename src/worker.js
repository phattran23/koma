// Cloudflare Worker entry: /api/* and /img go to the API, everything else is a static asset.
import { handleApi } from './api.js';

export default {
    async fetch(request, env) {
        return (await handleApi(request)) || env.ASSETS.fetch(request);
    },
};
