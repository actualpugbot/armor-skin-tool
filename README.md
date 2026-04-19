# Armor Skin Tool

Armor Skin Tool is a static browser app for turning regular Minecraft skins into
armor-stand statue textures for the resource-pack workflow commonly used
alongside Armor Poser.

## What It Does

- Loads a skin from a Minecraft username or a dragged-in PNG.
- Handles both standard and slim arm layouts.
- Shows a live source preview and a live exported texture preview.
- Lets you customize the output file name, starting with `wood001.png`.
- Exports a ready-to-save PNG directly in the browser.

## Export Format

This repo intentionally exports `64x155` `woodNNN.png` files.

The current app, preview canvas, and downloaded PNG all target that `64x155`
layout, so the README should stay aligned with that unless the exporter code is
changed too.

This workflow assumes:

- Armor Poser handles the posing.
- The resource pack handles the custom armor-stand texture sheet.
- Numbered files such as `wood001.png` usually need matching `wood.properties`
  entries inside the pack.

## Run Locally

Serve the repo root as static files, then open `index.html`.

Example:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## GitHub Pages

This repo includes [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml),
so pushes to `main` deploy the static site through GitHub Actions.

## Notes

- No build step is required.
- Username lookups use `mc-heads.net` so the app stays fully client-side.
- Legacy `64x32` skins are normalized into the modern `64x64` layout before export.
