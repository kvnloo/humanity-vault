# humanity-vault

Mobile-first **GraphQL learning OS** for [frontier-kb](https://github.com/kvnloo/frontier-kb).

This is the human half of the vault: a continuously evolving public brain. Notes are neurons. Wikilinks are synapses. Human retrieve/encode and agent search/get are spikes. Idle edges decay. Noise is pruned — never silently deleted.

## Why this UI exists

Cutting-edge LLM knowledge dies if it is only dumped into markdown. The loop is:

1. **Move** (Rhonda Patrick) — metabolic / BDNF prerequisite
2. **Alert** (Andrew Huberman) — focused bout, ~90-minute ultradian
3. **Encode** (Justin Sung) — schema, compare, distill. No highlighting
4. **Retrieve** — regenerate the claim; hits potentiate, misses downscale
5. **Rest / Sleep** — consolidation and synaptic homeostasis
6. **Measure** (Bryan Johnson) — hit-rate, weight, idle-days. Effort is not a biomarker
7. **Prune** — review weak unused notes

This is a social experiment and an open repository of knowledge. No personal health data. Protocols here are learning-system design, not medical advice.

**Preview:** https://kvnloo.github.io/humanity-vault/

## GitHub Actions

- `ci` — lint + `next build` on every push
- `preview` — static export to GitHub Pages on `main` (`/humanity-vault`)

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. GraphQL: `POST /api/graphql`.

Live brain (Postgres on frontier-kb):

```bash
# in frontier-kb
python scripts/graphql_server.py   # :8787
# in humanity-vault
GRAPHQL_URL=http://127.0.0.1:8787/graphql npm run dev
```

Without `GRAPHQL_URL`, the app serves a distilled snapshot of the vault (`content/snapshot.json`) and keeps an in-memory synapse graph. Refresh snapshot:

```bash
python scripts/export_vault_snapshot.py   # from frontier-kb
```

## Performance

- Distilled claims first; full markdown after encode/retrieve
- System + two `next/font` families, `display: swap`
- Mobile viewport-fit, 48px tap targets, `content-visibility` on cards
- Local GraphQL so the first paint does not wait on a remote mesh
- PWA manifest for home-screen install

## Contract

Shared schema: [frontier-kb `graphql/schema.graphql`](https://github.com/kvnloo/frontier-kb/blob/main/graphql/schema.graphql).
