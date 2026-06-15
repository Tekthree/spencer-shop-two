function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeLineBreaks(value: string) {
  return value.replace(/\r\n/g, '\n');
}

function formatParagraph(text: string) {
  const lines = text.split('\n').map((line) => escapeHtml(line.trim()));
  return `<p>${lines.join('<br />')}</p>`;
}

function formatHeading(text: string) {
  const match = text.match(/^(#{1,3})\s+(.*)$/);
  if (!match) {
    return formatParagraph(text);
  }

  const level = match[1].length;
  const headingText = escapeHtml(match[2].trim());

  if (level === 1) {
    return `<h2>${headingText}</h2>`;
  }

  if (level === 2) {
    return `<h3>${headingText}</h3>`;
  }

  return `<h4>${headingText}</h4>`;
}

function formatQuote(text: string) {
  const withoutMarkers = text
    .split('\n')
    .map((line) => line.replace(/^>\s?/, '').trim())
    .filter(Boolean);

  if (withoutMarkers.length === 0) {
    return '';
  }

  const quoteHtml = withoutMarkers.map((line) => escapeHtml(line)).join('<br />');
  return `<blockquote><p>${quoteHtml}</p></blockquote>`;
}

function extractUrlAndCaption(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { url: '', caption: '' };
  }

  const firstQuote = trimmed.indexOf('"');
  const lastQuote = trimmed.lastIndexOf('"');

  if (firstQuote >= 0 && lastQuote > firstQuote) {
    const url = trimmed.slice(0, firstQuote).trim();
    const caption = trimmed.slice(firstQuote + 1, lastQuote).trim();
    return { url, caption };
  }

  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 1) {
    return { url: '', caption: trimmed.slice(1, -1).trim() };
  }

  return { url: trimmed, caption: '' };
}

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function deriveAltFromUrl(url: string) {
  if (!url) {
    return 'Article image';
  }

  const segments = url.split('/');
  const filename = segments.pop() ?? 'image';
  const withoutQuery = filename.split('?')[0];
  const cleaned = withoutQuery.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim();
  return cleaned || 'Article image';
}

function formatImage(text: string) {
  const match = text.match(/^(!)?\[\s*([^\]]*?)\s*\]\s*\((.+)\)$/);
  if (!match) {
    return '';
  }

  const [, hasBang, bracketContent, parenContent] = match;
  const bracketValue = bracketContent.trim();
  const { url: extractedUrl, caption: extractedCaption } = extractUrlAndCaption(parenContent);

  let url = extractedUrl;
  let caption = extractedCaption;
  let altText = '';

  if (hasBang) {
    altText = bracketValue;
  } else if (looksLikeUrl(bracketValue)) {
    if (!looksLikeUrl(url)) {
      if (!caption && url) {
        caption = url;
      }
      url = bracketValue;
    }
    altText = caption || deriveAltFromUrl(url);
  } else {
    altText = bracketValue;
  }

  const safeUrl = url.trim();
  if (!safeUrl) {
    return '';
  }

  const safeAlt = escapeHtml((altText || caption || deriveAltFromUrl(safeUrl)).trim());
  const figureCaption = caption ? `<figcaption class="rte-image__caption">${escapeHtml(caption.trim())}</figcaption>` : '';

  return `
<figure class="rte-image">
  <div class="rte-image__media">
    <img src="${safeUrl}" alt="${safeAlt}" loading="lazy" decoding="async" />
  </div>
  ${figureCaption}
</figure>`.trim();
}

function formatUnorderedList(text: string) {
  const items = text
    .split('\n')
    .map((line) => line.replace(/^[-*+]\s+/, '').trim())
    .filter(Boolean);

  if (items.length === 0) {
    return '';
  }

  const listItems = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `<ul>${listItems}</ul>`;
}

function formatOrderedList(text: string) {
  const items = text
    .split('\n')
    .map((line) => line.replace(/^\d+\.\s+/, '').trim())
    .filter(Boolean);

  if (items.length === 0) {
    return '';
  }

  const listItems = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `<ol>${listItems}</ol>`;
}

function identifyBlockType(text: string) {
  if (/^!?\s*\[.*\]\s*\(.*\)\s*$/.test(text.trim())) {
    return 'image';
  }

  if (/^>\s?/.test(text.trim())) {
    return 'quote';
  }

  if (/^(#{1,3})\s+/.test(text.trim())) {
    return 'heading';
  }

  const lines = text.split('\n').filter((line) => line.trim().length > 0);

  if (lines.length > 0 && lines.every((line) => /^[-*+]\s+/.test(line.trim()))) {
    return 'unordered-list';
  }

  if (lines.length > 0 && lines.every((line) => /^\d+\.\s+/.test(line.trim()))) {
    return 'ordered-list';
  }

  return 'paragraph';
}

export function createRichTextHtml(rawInput: string) {
  const normalizedRaw = normalizeLineBreaks(rawInput).trim();

  if (!normalizedRaw) {
    return { html: '', raw: '' };
  }

  const segments = normalizedRaw.split(/\n{2,}/);
  const htmlSegments = segments
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const type = identifyBlockType(segment);
      if (type === 'image') {
        return formatImage(segment);
      }
      if (type === 'quote') {
        return formatQuote(segment);
      }
      if (type === 'heading') {
        return formatHeading(segment);
      }
      if (type === 'unordered-list') {
        return formatUnorderedList(segment);
      }
      if (type === 'ordered-list') {
        return formatOrderedList(segment);
      }
      return formatParagraph(segment);
    })
    .filter(Boolean);

  return {
    html: htmlSegments.join(''),
    raw: normalizedRaw,
  };
}
