# Ambar Soni Portfolio — CMS v2

This version adds a real Decap CMS content model for managing the portfolio without editing HTML/CSS/JS.

## CMS workflow

Open `/admin/` and use **Portfolio Sections** to:
- add, delete and reorder sections
- change section eyebrow, heading and description
- control navigation visibility
- add, delete and reorder projects/media inside each section
- upload/select images
- upload MP4/WebM files through the CMS media/file widget
- paste external video embed URLs (for Behance/Adobe and similar embeds)
- hide/show projects
- mark projects as featured

The frontend reads `content/site.json` and `content/portfolio.json` at runtime, so CMS changes are reflected after the Cloudflare deployment completes.

## Important for video

Git-backed Decap uploads store media in the repository. Avoid uploading very large production videos to GitHub; for a large portfolio video library, connect an external object/video storage layer later (Cloudflare R2 or a dedicated video host).
