(function () {
  const CMS = window.CMS;
  if (!CMS) return;

  const h = window.h;
  const createClass = window.createClass;

  const safe = (value) => String(value == null ? '' : value);
  const get = (obj, path, fallback = '') => {
    let cur = obj;
    for (const key of path) {
      if (cur == null || typeof cur.get !== 'function') return fallback;
      cur = cur.get(key);
    }
    return cur == null ? fallback : cur;
  };

  const assetUrl = (value, getAsset) => {
    if (!value) return '';
    try {
      const asset = getAsset(value);
      return asset && asset.toString ? asset.toString() : safe(asset || value);
    } catch (_) {
      return safe(value);
    }
  };

  const Media = ({ item, getAsset }) => {
    const type = safe(item.media_type || 'image');
    const image = assetUrl(item.image, getAsset);
    const video = assetUrl(item.video, getAsset);

    if (type === 'video' && video) {
      return h('video', {
        src: video,
        poster: image || undefined,
        controls: true,
        muted: true,
        playsInline: true,
        preload: 'metadata',
        className: 'preview-media'
      });
    }

    if (type === 'embed' && item.video_url) {
      return h('div', { className: 'preview-embed' },
        h('span', {}, 'EXTERNAL VIDEO'),
        h('small', {}, safe(item.video_url))
      );
    }

    if (image) {
      return h('img', {
        src: image,
        alt: safe(item.title),
        className: 'preview-media'
      });
    }

    return h('div', { className: 'preview-empty' }, 'MEDIA');
  };

  const PortfolioPreview = createClass({
    render: function () {
      const entry = this.props.entry;
      const sectionValue = get(entry, ['data', 'sections'], null);
      const sections = sectionValue && typeof sectionValue.toJS === 'function' ? sectionValue.toJS() : [];
      const getAsset = this.props.getAsset;

      return h('div', { className: 'portfolio-preview' },
        h('header', { className: 'preview-topbar' },
          h('div', {}, h('strong', {}, 'AMBAR / SONI'), h('span', {}, 'LIVE PORTFOLIO PREVIEW')),
          h('span', { className: 'preview-status' }, 'LIVE')
        ),
        h('section', { className: 'preview-hero' },
          h('span', { className: 'preview-eyebrow' }, 'AMBAR SONI / CREATIVE VISUAL PORTFOLIO'),
          h('h1', {}, 'Creative', h('em', {}, ' video editor.')),
          h('p', {}, 'This preview updates as you edit the portfolio. Reorder sections or projects to change the live structure.'),
          h('div', { className: 'preview-chip-row' },
            h('span', {}, sections.length + ' sections'),
            h('span', {}, sections.reduce((n, s) => n + ((s.items || []).length), 0) + ' media items')
          )
        ),
        sections.map((section, sectionIndex) => {
          const items = (section.items || []).filter(item => item.visible !== false);
          return h('section', { className: 'preview-section', key: section.anchor || sectionIndex },
            h('div', { className: 'preview-section-head' },
              h('div', {},
                h('span', { className: 'preview-eyebrow' }, safe(section.eyebrow || ('0' + (sectionIndex + 1)))),
                h('h2', {}, safe(section.heading || 'Untitled section'))
              ),
              h('span', { className: 'preview-count' }, String(items.length).padStart(2, '0') + ' ITEMS')
            ),
            section.description ? h('p', { className: 'preview-description' }, safe(section.description)) : null,
            h('div', { className: 'preview-grid' },
              items.map((item, i) => h('article', { className: 'preview-card', key: safe(item.title) + i },
                h('div', { className: 'preview-media-wrap' }, h(Media, { item, getAsset })),
                h('div', { className: 'preview-card-meta' },
                  h('span', {}, String(i + 1).padStart(2, '0') + ' / ' + safe(item.category || 'VISUAL WORK')),
                  h('strong', {}, safe(item.title || 'Untitled')),
                  item.description ? h('p', {}, safe(item.description)) : null
                )
              ))
            )
          );
        }),
        h('div', { className: 'preview-footer' }, 'Scroll preview · Edit left · See changes here instantly')
      );
    }
  });

  CMS.registerPreviewTemplate('portfolio', PortfolioPreview);
  CMS.registerPreviewStyle('/admin/preview.css');
})();
