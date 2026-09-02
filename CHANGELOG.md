# Changelog

All notable changes to the EnConvert Zapier integration are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Two hidden dropdown triggers, **List of Watchers** (`GET /v2/watch`) and **List of Ingest Jobs**
  (`GET /v2/ingest`). They never appear in the Zap editor; they exist only to populate the Watcher and
  Ingest Job pickers, and they paginate over the API's `skip`/`limit` parameters.

### Changed

- The **Watcher ID** and **Job ID** input fields are now labelled **Watcher** and **Ingest Job** and
  render as dropdowns instead of asking users to paste an ID. The wire keys (`watcher_id`, `job_id`)
  are unchanged, so existing Zaps keep working.

## [1.0.0] - 2026-08-27

### Added

- Initial release of the EnConvert Zapier integration, built with the Zapier Platform CLI (TypeScript,
  `zapier-platform-core` 19).
- **Custom API-key authentication**: the `X-API-Key` header is added by a `beforeRequest` middleware and
  the connection is verified against `GET /v1/whoami` (private `sk_` keys only; public `pk_` keys are
  rejected).
- **Creates**: Convert File to PDF, Convert File to Markdown, Convert Image, Compress Image, Perceive URL,
  Distill Structured Data, Start Ingest Job and Create Watcher. The four conversion actions upload a file
  and return the result as a real Zapier file via `z.dehydrateFile`.
- **Searches**: Search the Web (`/v2/lookup`), Discover URLs (`/v2/discover`) and Get Ingest Job.
- **Triggers**: New Watcher Snapshot, a polling trigger over a watcher's check history.
- The `render_quality` honesty score is surfaced on Perceive URL and the watcher snapshot trigger.
