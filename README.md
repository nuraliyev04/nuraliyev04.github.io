# Portfolio — Cybersecurity Specialist

Single-page static site: plain HTML, CSS, and vanilla JavaScript. No build step,
no framework, no backend. Deployed straight from the repo via GitHub Pages.

```
index.html                        the whole page
style.css                         dark terminal theme
script.js                         nav, scroll-spy, reveal, typing
assets/favicon.svg                favicon
assets/iotedge-screenshot.jpg     iotEdge Parking 24 project screenshot
```

## Before you publish

Search `index.html` for these placeholders and replace them:

| Placeholder | Where |
| --- | --- |
| `Name` | `<title>`, hero `<h1>`, nav brand, footer |
| `href="#"` | hero socials, project buttons, contact links |
| `you@example.com` | contact email and `mailto:` |
| `/in/your-handle`, `@your-handle`, `/u/your-handle` | contact values |

The `glitch` effect reads its text from the `data-text` attribute on the
hero `<h1>`, so update that too when you change the name. If you swap in a real
screenshot, a 16:9 image around 1200px wide works well.

## Deploy to GitHub Pages

```sh
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source: Deploy from a branch →
`main` / `(root)`**. The site goes live at
`https://<user>.github.io/<repo>/`.

An empty `.nojekyll` file is already included, so GitHub Pages serves the
files as-is instead of running them through Jekyll.

To develop locally: `python3 -m http.server 8000`, then open
`http://localhost:8000`.

## Notes

- Icons are an inline SVG sprite in `index.html`, so there is no icon-font
  request. The only external dependency is JetBrains Mono from Google Fonts,
  loaded with `display=swap` and a monospace fallback stack.
- `prefers-reduced-motion` disables the glitch, typing, and reveal animations.
- The scroll-spy uses `IntersectionObserver`; if it is unsupported the nav
  simply never highlights rather than throwing.
