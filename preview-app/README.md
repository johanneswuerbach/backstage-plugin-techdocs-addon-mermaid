# TechDocs preview app

A copy of Backstage's [`techdocs-cli-embedded-app`](https://github.com/backstage/backstage/tree/master/packages/techdocs-cli-embedded-app) (Apache-2.0), the app that `techdocs-cli serve` uses to preview docs, with this addon's `techDocsMermaidAddonModule` added in `src/App.tsx`.

It has two jobs:

- **Release asset.** The publish workflow builds it and attaches `techdocs-preview-app.tar.gz` to each GitHub release, for `techdocs-cli serve --preview-app-bundle-path`. See "Preview Docs Locally with `techdocs-cli`" in the main README.
- **End-to-end test.** `e2e/smoke.mjs` serves `e2e/docs` through `techdocs-cli` with the built app and checks in Chrome that diagrams render inside the TechDocs shadow root and that sequence diagram link menus open. CI runs it on every pull request.

The addon is linked from this repo's `src/` as a workspace, so both use the current code.

## Running the smoke test

You need mkdocs with `mkdocs-techdocs-core` on your `PATH` (the test serves with `--no-docker`) and Chrome or Chromium (set `CHROME_PATH` if it isn't found).

```sh
python3 -m venv .venv && .venv/bin/pip install -r preview-app/e2e/requirements.txt
export PATH="$PWD/.venv/bin:$PATH"

yarn workspace techdocs-mermaid-preview-app build
yarn workspace techdocs-mermaid-preview-app test:e2e
```

Ports 3000 and 8000 must be free.

## Updating from Backstage

The Backstage version comes from the repo's `backstage.json`, so `backstage-cli versions:bump` updates this app's dependencies too. When Backstage changes the embedded app itself, copy `src/`, `public/` and `app-config.yaml` from `packages/techdocs-cli-embedded-app` at the matching release tag, then add the mermaid module to `src/App.tsx` again.

`preview-app/` is left out of `yarn lint`, because it is Backstage's code. `yarn tsc` type-checks it.
