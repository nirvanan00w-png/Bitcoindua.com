# bitcoindua.com

A one-page site offering the domain bitcoindua.com for 1 BTC.

- `index.html` is the whole site. There is no build step and nothing loads from third parties.
- `scripts/rings.mjs` draws the tree rings into `index.html`. Re-run it after changing a ring: `node scripts/rings.mjs`
- `node --test` checks the page.
- To preview: `python3 -m http.server 4173`, then open http://127.0.0.1:4173
- GitHub Pages serves the `main` branch. `CNAME` holds the custom domain and must stay.

Plain HTML instead of the usual Next.js stack (2026-11-25): one static page with no forms or data needs no framework, and the existing Pages hosting already serves the domain.

The typeface is Ysabeau, under the SIL Open Font License (`fonts/OFL.txt`).
