# EnConvert for Zapier

A [Zapier](https://zapier.com) integration for [EnConvert](https://www.enconvert.com), built with the
Zapier Platform CLI (TypeScript). Convert files, render web pages into agent-ready data, crawl sites into
RAG-ready chunks, and monitor pages for changes, all from one connection inside a Zap.

Every page render carries a `render_quality` score from 0.0 to 1.0, so a blocked or empty page comes back
flagged rather than being mistaken for real content.

Every **Perceive URL** step also returns `is_blocked` and `billed`: a detected content-free block is a
normal success with `is_blocked` true, no artifacts and `billed` false, so a Filter step on
`render_quality >= 0.4` and `is_blocked` is false keeps bad reads out of the rest of the Zap.

## What it does

### Creates (actions)

| Action | EnConvert endpoint | What it does |
| --- | --- | --- |
| **Convert File to PDF** | `POST /v1/convert/anything-to-pdf` | Convert a document, spreadsheet, presentation, image, HTML or text file to PDF. |
| **Convert File to Markdown** | `POST /v1/convert/anything-to-markdown` | Convert Word, PowerPoint, Excel, PDF, EPUB, RTF, HTML and more into markdown. |
| **Convert Image** | `POST /v1/convert/{from}-to-{to}` | Convert between JPEG, PNG, WebP, HEIC and SVG, or rasterize a PDF page to JPEG. |
| **Compress Image** | `POST /v1/convert/compress-image` | Shrink a PNG, JPEG or WebP towards a target size. |
| **Perceive URL** | `POST /v2/perceive` | Render a page into markdown, HTML, a screenshot, a PDF, links, images or structured data. |
| **Distill Structured Data** | `POST /v2/distill` | Extract fields matching a JSON schema from one or more pages. |
| **Start Ingest Job** | `POST /v2/ingest` | Crawl a whole site into RAG-ready chunked JSONL (async job). |
| **Create Watcher** | `POST /v2/watch` | Monitor a page for changes on a fixed cadence. |

### Searches

| Search | EnConvert endpoint | What it does |
| --- | --- | --- |
| **Search the Web** | `POST /v2/lookup` | Web, news, image, scholar, patent and map search, one result per row. |
| **Discover URLs** | `POST /v2/discover` | List a site's URLs via sitemap, crawl or both, without rendering. |
| **Get Ingest Job** | `GET /v2/ingest/{id}` | Read an ingest job, including its finished JSONL output URL. |

### Triggers

| Trigger | EnConvert endpoint | What it does |
| --- | --- | --- |
| **New Watcher Snapshot** | `GET /v2/watch/{id}/snapshots` | Polls a watcher and fires when it records a new check. |

Two further triggers, **List of Watchers** (`GET /v2/watch`) and **List of Ingest Jobs**
(`GET /v2/ingest`), are hidden: they never appear in the Zap editor and exist only to populate the
**Watcher** and **Ingest Job** dropdowns. The 12 visible operations above (1 trigger, 3 searches,
8 actions) are unchanged.

## Files

The four conversion actions accept a **File** input (map a file from a previous step). They upload it as
multipart, then return the converted result as a real Zapier **file** (via `z.dehydrateFile`) plus the
file name, size and a `Download URL`. The pre-signed download URL is fetched without the API key, since
the storage host rejects it.

Two source files carry no visible operation of their own:

| Source file | What it is |
| --- | --- |
| `src/triggers/listWatchers.ts` | Hidden polling trigger over `GET /v2/watch`. Populates the **Watcher** dropdown only. |
| `src/triggers/listIngestJobs.ts` | Hidden polling trigger over `GET /v2/ingest`. Populates the **Ingest Job** dropdown only. |

## Authentication

The integration uses a custom API-key connection. Paste your **private** EnConvert key (starts with
`sk_`, from your dashboard under API keys). Every request sends it as the header `X-API-Key`, added once
in a `beforeRequest` middleware. Connecting calls `GET /v1/whoami`, which only accepts private keys, so a
public `pk_` key is rejected immediately and the connection is labelled with your plan.

## Develop

```bash
npm install
npm run build     # compiles TypeScript to dist/
npm run validate  # zapier-platform validate (structural + schema checks)
```

## Deploy

The app id (`245566`) is pinned in `.zapierapprc`; the version pushed is `package.json`'s.

```bash
npm i -g zapier-platform-cli   # provides the zapier-platform binary
zapier-platform login          # once per machine
npm ci && npm run build && npm run validate
zapier-platform push           # uploads this version to the app
zapier-platform promote 1.1.0  # makes it the version new Zaps use
```

To move from invite-only to the public Zapier app directory, open the app at
<https://developer.zapier.com/app/245566/publishing> and submit it for review.

Requires Node.js 18.20 or newer. Built on `zapier-platform-core` 19. The CLI binary is `zapier-platform`
(the legacy `zapier` binary was removed in v19).

## Resources

- EnConvert integration guide: <https://www.enconvert.com/docs/guides/integrations/zapier>
- EnConvert API documentation: <https://www.enconvert.com/docs/introduction>
- Zapier Platform CLI: <https://docs.zapier.com/platform/reference/cli-docs>

## Licence

[MIT](LICENSE)
