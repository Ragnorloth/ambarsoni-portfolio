# Ambar Soni Portfolio V4

## What changed
- Kept the V2-style "Ideas in motion." hero direction.
- Added the supplied professional portrait as a compact hero profile card.
- Removed the broken/repeated asset markup from V3.
- Structured Behance video work into a dedicated Selected Films section.
- Structured graphics, 3D/Blender, motion workflow and archive sections.
- Added the supplied contact details.
- Added `/editor/` as a browser-based quick organizer (local only).
- Added `/admin/` as a Decap CMS starter for a real web editing dashboard.

## Important: real CMS setup
The current Cloudflare project was created with Direct Upload. Cloudflare states that a Pages project using Direct Upload cannot later be switched to Git integration. For a real persistent CMS, create/connect a GitHub-backed Pages project and deploy this repository from GitHub.

Recommended editing stack:
1. GitHub repository stores the website and content.
2. Cloudflare Pages Git integration auto-deploys on every push.
3. Decap CMS provides `/admin/` with web editing, lists, visibility controls and media uploads.
4. Decap Turbo can provide hosted authentication and a GitHub proxy; its current public preview has a Free plan.

The `admin/config.yml` intentionally contains `REPLACE_WITH_DECAP_TURBO_SITE_ID`. After creating a Decap Turbo site, replace that one value with the site's ID.

## Current media limitation
The supplied Google Drive folder URL can be opened as a folder shell from this environment, but its individual files/subfolders are not exposed to the browser session, so the V4 build does not pretend to have downloaded the Drive videos. The Behance-hosted Adobe video embeds are included directly.

If the Drive's best-work subfolder is downloaded as a ZIP and uploaded here, those original videos can be added to the Films section.
