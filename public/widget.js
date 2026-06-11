/**
 * Helpdesk AI — embeddable widget loader.
 *
 * Usage:
 *   <script src="https://your-app.com/widget.js" data-key="pk_xxx" defer></script>
 *
 * Injects an isolated iframe (so host-page CSS can never leak in) that renders
 * the customer chat widget for the tenant identified by data-key. The iframe
 * is sized to the launcher when closed and expands when the panel opens, so it
 * never blocks clicks on the host page.
 */
(function () {
  "use strict";
  var current = document.currentScript;
  if (!current) {
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.indexOf("widget.js") !== -1) {
        current = scripts[i];
        break;
      }
    }
  }
  if (!current) return;

  var key = current.getAttribute("data-key");
  if (!key) {
    console.error("[HelpdeskAI] widget.js requires a data-key attribute.");
    return;
  }

  var origin = current.getAttribute("data-origin");
  if (!origin) {
    try {
      origin = new URL(current.src).origin;
    } catch (e) {
      origin = "";
    }
  }

  if (document.getElementById("helpdesk-ai-frame")) return; // guard against double-load

  var isMobile = window.matchMedia("(max-width: 480px)").matches;

  var frame = document.createElement("iframe");
  frame.id = "helpdesk-ai-frame";
  frame.title = "Customer support chat";
  frame.setAttribute("allow", "clipboard-write");
  frame.src = origin + "/widget?key=" + encodeURIComponent(key);

  var CLOSED = { w: "96px", h: "96px" };
  var OPEN = isMobile
    ? { w: "100vw", h: "90vh" }
    : { w: "424px", h: "680px" };

  var s = frame.style;
  s.position = "fixed";
  s.bottom = "0";
  s.right = "0";
  s.border = "0";
  s.width = CLOSED.w;
  s.height = CLOSED.h;
  s.maxWidth = "100vw";
  s.maxHeight = "100vh";
  s.zIndex = "2147483000";
  s.colorScheme = "normal";
  s.background = "transparent";
  s.transition = "width .28s cubic-bezier(.16,1,.3,1), height .28s cubic-bezier(.16,1,.3,1)";
  frame.allowTransparency = "true";

  function mount() {
    document.body.appendChild(frame);
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);

  window.addEventListener("message", function (event) {
    if (origin && event.origin !== origin) return;
    var data = event.data || {};
    if (data.type !== "helpdesk:widget") return;
    if (data.open) {
      frame.style.width = OPEN.w;
      frame.style.height = OPEN.h;
    } else {
      frame.style.width = CLOSED.w;
      frame.style.height = CLOSED.h;
    }
  });
})();
