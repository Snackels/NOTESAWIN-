import { W as store_get, V as attr, X as unsubscribe_stores } from "../../chunks/index.js";
import "@sveltejs/kit/internal";
import { w as writable } from "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { f as favicon } from "../../chunks/favicon.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const loading = writable(false);
    if (store_get($$store_subs ??= {}, "$loading", loading)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="fixed inset-0 flex items-center justify-center bg-black/70 z-50 svelte-1uha8ag"><div class="flex flex-col items-center gap-4 svelte-1uha8ag"><img${attr("src", favicon)} alt="loading icon" class="w-16 sm:w-20 md:w-24 rounded-full animate-spin-neon svelte-1uha8ag"/> <p class="text-white text-base sm:text-lg md:text-xl font-semibold svelte-1uha8ag">Loading...</p></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F0F3A] to-[#1A1E8C] p-4 sm:p-6 md:p-8 svelte-1uha8ag"><div class="w-full max-w-md sm:max-w-xl md:max-w-2xl bg-white/5 backdrop-blur-md rounded-3xl p-8 sm:p-10 md:p-12 text-center shadow-2xl border border-white/20 transition-all hover:scale-105 duration-300 svelte-1uha8ag"><div class="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 svelte-1uha8ag"><img${attr("src", favicon)} alt="NOTESAWIN icon" class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full drop-shadow-2xl animate-bounce-slow neon-glow svelte-1uha8ag"/> <h1 class="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg svelte-1uha8ag">NOTESAWIN</h1> <p class="text-gray-300 text-sm sm:text-base md:text-lg max-w-xs sm:max-w-md md:max-w-lg text-center svelte-1uha8ag">Notesawin: Intelligent Note-Taking That Elevates Productivity</p> <button class="mt-6 sm:mt-8 px-10 sm:px-14 md:px-16 py-3 sm:py-4 rounded-full bg-white/90 text-black font-bold text-sm sm:text-lg md:text-lg shadow-lg hover:bg-white/100 hover:shadow-2xl active:scale-95 transition-all duration-200 svelte-1uha8ag">TRY IT NOW</button></div></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
