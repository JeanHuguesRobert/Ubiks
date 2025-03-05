import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        {
            name: "srcbook-error-reporter",
            // ref: https://vite.dev/guide/api-plugin.html#transformindexhtml
            transformIndexHtml: function (html) {
                if (process.env.NODE_ENV !== "development" && process.env.SHOW_WATERMARK !== "false") {
                    return [
                        {
                            tag: "style",
                            attrs: { type: "text/css" },
                            injectTo: "head",
                            children: "\n                .srcbook-watermark {\n                  position: fixed;\n                  bottom: 16px;\n                  right: 16px;\n                  background: white;\n                  border-radius: 8px;\n                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n                  display: flex;\n                  align-items: center;\n                  padding: 8px 12px;\n                  z-index: 9999;\n                  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;\n                  font-size: 14px;\n                  font-weight: bold;\n                  color: #000;\n                  gap: 8px;\n                  border: 1px solid #e6e6e6;\n                  background: linear-gradient(to bottom, #FFFFFF, #F9F9F9);\n                  cursor: pointer;\n                  transition: all 0.2s ease-in-out;\n                }\n                .srcbook-watermark:hover {\n                  transform: translateY(-2px);\n                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);\n                }\n                .srcbook-watermark:active {\n                  transform: translateY(0);\n                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n                }\n                .srcbook-watermark img {\n                  width: 16px;\n                  height: 16px;\n                }\n              ",
                        },
                        {
                            tag: "script",
                            attrs: { type: "module" },
                            injectTo: "body",
                            children: "\n                const watermark = document.createElement('a');\n                watermark.href = 'https://www.srcbook.com?a_id=' + encodeURIComponent('019560fc-a2fd-7aaa-ad09-f89bbd51a059');\n                watermark.target = '_blank';\n                watermark.className = 'srcbook-watermark';\n                watermark.innerHTML = `\n                  <img src=\"https://assets.srcbook.com/favicon.svg\" alt=\"Srcbook Logo\" />\n                  Made in Srcbook\n                `;\n                document.body.appendChild(watermark);\n              ",
                        },
                    ];
                }
                return [
                    {
                        tag: "script",
                        attrs: { type: "module" },
                        injectTo: "head",
                        children: "\n            // Report any logs, errors, etc to the parent srcbook app context to include in\n            // the bottom panel.\n            for (const method of ['log', 'debug', 'info', 'error', 'warn']) {\n              const originalFn = console[method];\n              console[method] = function(...args) {\n                window.parent.postMessage({ type: 'console', method, args: args.map(a => `${a}`) }, '*');\n                return originalFn(...args);\n              };\n            }\n\n            // Report any thrown errors / promise rejections so they show up in the logs\n            window.addEventListener('error', (e) => {\n              if (window.parent) {\n                window.parent.postMessage({ type: 'error', stack: e.error.stack }, '*');\n              }\n            });\n            window.addEventListener('unhandledrejection', (e) => {\n              if (window.parent) {\n                window.parent.postMessage({ type: 'unhandledrejection', reason: e.reason }, '*');\n              }\n            });\n\n            // Report URL change event from iframe\n            const originalPushState = history.pushState;\n            const originalReplaceState = history.replaceState;\n\n            const notifyParent = () => {\n              window.parent.postMessage({ type: 'iframe_url_changed', url: window.location.href }, '*');\n            };\n\n            history.pushState = function (...args) {\n              originalPushState.apply(this, args);\n              notifyParent();\n            };\n\n            history.replaceState = function (...args) {\n              originalReplaceState.apply(this, args);\n              notifyParent();\n            };\n\n            window.addEventListener('popstate', notifyParent);\n            window.addEventListener('hashchange', notifyParent);\n          ",
                    },
                ];
            },
            transform: function (src, id) {
                if (id === "/app/src/main.tsx") {
                    return "\n            ".concat(src, "\n            if (process.env.NODE_ENV === 'development') {\n              // Report any vite-hmr errors up to the parent srcbook app context\n              // Full event list: https://vite.dev/guide/api-hmr.html\n              if (import.meta.hot) {\n                import.meta.hot.on('vite:error', (data) => {\n                  if (window.parent) {\n                    window.parent.postMessage({ type: 'vite:hmr:error', data }, '*');\n                  }\n                });\n                import.meta.hot.on('vite:beforeUpdate', (data) => {\n                  if (window.parent) {\n                    window.parent.postMessage({ type: 'vite:hmr:beforeUpdate', data }, '*');\n                  }\n                });\n                import.meta.hot.on('vite:afterUpdate', (data) => {\n                  if (window.parent) {\n                    window.parent.postMessage({ type: 'vite:hmr:afterUpdate', data }, '*');\n                  }\n                });\n              }\n            }\n          ");
                }
            },
        },
    ],
    server: {
        allowedHosts: true,
    },
});
