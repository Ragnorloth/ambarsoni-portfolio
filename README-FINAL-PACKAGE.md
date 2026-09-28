# Ambar Soni — Final Portfolio Package

This package is the merged, root-ready version of the existing CMS portfolio plus the V5 special presentation system.

## Upload structure

Upload the **contents of this folder directly into the root of the GitHub repository** (`Ragnorloth/ambarsoni-portfolio`). Do not upload the folder itself as a nested directory.

The package already places the updated files at:

- `/index.html`
- `/script.js`
- `/styles.css`
- `/admin/config.yml`
- `/admin/index.html`
- `/admin/preview.js`
- `/admin/preview.css`
- `/content/site.json`
- `/content/portfolio.json`

Existing assets and CMS files are retained.

## Included presentation updates

- Creative hero/typewriter and pointer interactions from the existing interactive build
- AI Video card-deck presentation
- Talking Head floating/hover-expand presentation controls in CMS
- 3D / Blender layered showcase
- Autoplay/muted controls for uploaded MP4/WebM special-section videos
- External Adobe embeds use thumbnail/click-to-play behavior because iframe playback controls cannot be reliably controlled by the parent page
- Graphic Design interactive/lightbox behavior
- Scroll reveal / shuttle motion
- Envelope reveal near contact
- Favicon field in Site Settings
- Decap CMS Turbo GitHub backend configuration
- CMS portfolio section reorder/add/remove controls
- CMS live preview registration

## Content safety

Existing portfolio media/items were retained. The package also adds an AI Video section using the six Adobe CCV embeds already supplied for the user's Behance AI Videos source. A Talking Head section is pre-created in the CMS with no invented media; add the actual talking-head videos through the CMS.

The existing 3D section is configured to use the 3D / Blender layered showcase.

## Deployment

The connected Cloudflare Pages project should deploy the new `main` commit automatically. Cloudflare Pages' Git integration deploys commits pushed to the connected branch.
