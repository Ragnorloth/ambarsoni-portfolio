# Ambar Soni Portfolio — Advanced Section Layout Update

This patch keeps the existing Decap/Turbo CMS and adds three visual presentation modes.

## CMS setup

In **Portfolio Sections → Sections**, add/reorder these sections:

1. **AI Videos**
   - Section ID / anchor: `ai-videos`
   - Visual Presentation: `AI Video Card Deck`
   - Heading: your preferred heading
   - Add projects as **Uploaded Video** for muted autoplay.
   - Upload a thumbnail if desired.

2. **Talking Head**
   - Section ID / anchor: `talking-head`
   - Visual Presentation: `Talking Head — Floating`
   - Add projects as **Uploaded Video**.
   - Videos autoplay muted, loop, and show an UNMUTE/MUTE controller.
   - Hovering enlarges the frame and pointer movement adds subtle 3D tilt.

3. **3D / Blender**
   - Section ID / anchor: `3d`
   - Visual Presentation: `3D / Blender — Layered Showcase`
   - Existing `3d` sections are automatically detected even if the presentation field is blank.
   - Images are displayed in a layered, rotating 3D-style card gallery.

Reorder the sections in the CMS list so the order is:
**AI Videos → Talking Head → 3D / Blender → the remaining existing sections.**

## Important video note

For true autoplay-muted behaviour, use **Uploaded Video (MP4/WebM)**. External Adobe/CCV embeds are kept behind their CMS thumbnail and load only after clicking Play. This avoids forcing an external iframe to autoplay and preserves the thumbnail experience.

The rest of the existing portfolio sections, graphics lightbox, hero effects, envelope interaction, favicon setting, and CMS structure remain intact.
