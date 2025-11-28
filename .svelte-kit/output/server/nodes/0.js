

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": true,
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.C5HJjdCj.js","_app/immutable/chunks/Ca6PdoZt.js","_app/immutable/chunks/BtxYcPeY.js","_app/immutable/chunks/BW41Plnd.js","_app/immutable/chunks/-zzTvoIy.js","_app/immutable/chunks/Dfuim4pQ.js"];
export const stylesheets = ["_app/immutable/assets/0.CPZ8B-Du.css"];
export const fonts = [];
