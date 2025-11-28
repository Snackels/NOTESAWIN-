import { Y as attr_class, U as head, Z as attr_style, _ as stringify } from "../../../chunks/index.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
function Toolbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let mode = "pen";
    $$renderer2.push(`<div class="toolbar svelte-1ld6r3r"><button${attr_class("btn svelte-1ld6r3r", void 0, { "active": mode === "pen" })}>✏️ Pen</button> <button${attr_class("btn svelte-1ld6r3r", void 0, { "active": mode === "eraser" })}>🧹 Eraser</button> <button${attr_class("btn svelte-1ld6r3r", void 0, { "active": mode === "select" })}>🔲 Select</button> <button${attr_class("btn svelte-1ld6r3r", void 0, { "active": mode === "pan" })}>🤚 Pan</button> <div class="divider svelte-1ld6r3r"></div> <button class="btn secondary svelte-1ld6r3r">🗑️ Clear</button></div>`);
  });
}
const PUBLIC_GEMINI_API_KEY = "AIzaSyClCRB7DMyqCTY6ij7H_V5sBg4wUj6N_QI";
new GoogleGenerativeAI(PUBLIC_GEMINI_API_KEY);
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("a8vy9b", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>AI Note App</title>`);
      });
    });
    $$renderer2.push(`<div class="app-container svelte-a8vy9b">`);
    Toolbar($$renderer2);
    $$renderer2.push(`<!----> <canvas class="drawing-canvas svelte-a8vy9b"${attr_style(`cursor: ${stringify(
      "crosshair"
    )};`)}></canvas> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="instructions svelte-a8vy9b"><h4 class="svelte-a8vy9b">How to use:</h4> <ul class="svelte-a8vy9b"><li class="svelte-a8vy9b">✏️ Use <strong>Pen</strong> to draw notes</li> <li class="svelte-a8vy9b">🧹 Use <strong>Eraser</strong> to erase</li> <li class="svelte-a8vy9b">🔲 Use <strong>Select</strong> to lasso an area</li> <li class="svelte-a8vy9b">🤚 Use <strong>Pan</strong> to move mind map</li> <li class="svelte-a8vy9b">✨ Choose an AI action to analyze</li></ul></div></div>`);
  });
}
export {
  _page as default
};
