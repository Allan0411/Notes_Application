
export function formatNoteAsHTML({
  noteTitle = '',
  noteText = '',
  checklistItems = [],
  drawings = [],
  updatedAt = Date.now(),
  fontSize = 16,
  fontFamily = 'System',
  isBold = false,
  isItalic = false,
  textAlign = 'left',
  attachmentsList = [],
  canvasImageUri // <-- pass the saved canvas image URI here
}) {
  // Reduce font size for export to help fit more on a page
  const exportFontSize = Math.max(12, Math.min(fontSize, 16));
  const fontStyle = `
    font-family: ${fontFamily === 'System' ? 'Arial, sans-serif' : fontFamily};
    font-size: ${exportFontSize}px;
    font-weight: ${isBold ? 'bold' : 'normal'};
    font-style: ${isItalic ? 'italic' : 'normal'};
    text-align: ${textAlign};
    line-height: 1.5;
  `;
  const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate image sizing to fit all on one or two pages
  // We'll use a grid and smaller max-widths for images
  // For A4 at 96dpi: ~794x1123px, so keep images small
  const maxImageWidth = 160; // px
  const maxImageHeight = 160; // px
  const maxCanvasWidth = 220; // px
  const maxCanvasHeight = 220; // px

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${noteTitle || 'Note'}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 32px; color: #333; background: white; }
        .header { border-bottom: 2px solid #4a5568; padding-bottom: 12px; margin-bottom: 18px; }
        .title { font-size: 20px; font-weight: bold; color: #2d3748; margin-bottom: 8px; }
        .meta { font-size: 11px; color: #718096; font-style: italic; }
        .content { ${fontStyle} margin-bottom: 18px; white-space: pre-wrap; }
        .section-title { font-size: 15px; font-weight: bold; color: #4a5568; margin: 18px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
        .checklist { list-style: none; padding: 0; }
        .checklist-item { margin-bottom: 5px; padding: 2px 0; display: flex; align-items: center; }
        .checkbox { margin-right: 8px; font-weight: bold; }
        .checked { text-decoration: line-through; color: #718096; }
        .drawings-info { background: #f7fafc; padding: 10px; border-radius: 6px; border-left: 3px solid #4a5568; margin: 12px 0; font-size: 12px; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #a0aec0; text-align: center; }
        .canvas-section { margin: 18px 0; }
        .canvas-title { font-size: 15px; font-weight: bold; color: #4a5568; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
        .canvas-image { max-width: ${maxCanvasWidth}px; max-height: ${maxCanvasHeight}px; border-radius: 6px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: block; margin-bottom: 6px; }
        .generated-images-section { margin: 18px 0; }
        .generated-images-title { font-size: 15px; font-weight: bold; color: #4a5568; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
        .generated-images-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: flex-start;
        }
        .generated-image-container {
          margin-bottom: 10px;
          width: ${maxImageWidth + 10}px;
          text-align: center;
        }
        .generated-image {
          max-width: ${maxImageWidth}px;
          max-height: ${maxImageHeight}px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          display: block;
          margin: 0 auto 4px auto;
        }
        @media print {
          body { margin: 0.5in; }
          .header, .footer { page-break-inside: avoid; }
          .generated-images-list, .canvas-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${noteTitle || 'Untitled Note'}</div>
        <div class="meta">Last Updated: ${formattedDate}</div>
      </div>
  `;
  if (noteText.trim()) {
    html += `
      <div class="section-title">Content</div>
      <div class="content">${noteText.trim().replace(/\n/g, '<br>')}</div>
    `;
  }
  if (checklistItems.length > 0) {
    html += `<div class="section-title">Checklist</div><ul class="checklist">`;
    checklistItems.forEach((item) => {
      const checkbox = item.checked ? '✓' : '☐';
      const itemClass = item.checked ? 'checked' : '';
      html += `
        <li class="checklist-item">
          <span class="checkbox">${checkbox}</span>
          <span class="${itemClass}">${item.text || 'Untitled Item'}</span>
        </li>
      `;
    });
    html += '</ul>';
  }
  if (drawings.length > 0) {
    html += `
      <div class="drawings-info">
        <strong>📝 Drawings:</strong> This note contains ${drawings.length} strokes(s). 
        Drawings are not included in the PDF export but are preserved in the original note.
      </div>
    `;
  }

  // Show canvas and attachments together in a single grid section
  const imagesWithPath = attachmentsList && Array.isArray(attachmentsList)
    ? attachmentsList.filter(att => att && att.storagePath)
    : [];

  if (
    (canvasImageUri && typeof canvasImageUri === 'string') ||
    (imagesWithPath.length > 0)
  ) {
    html += `
      <div class="generated-images-section">
        <div class="generated-images-title">Canvas & Attachments</div>
        <div class="generated-images-list">
    `;

    // Canvas first, if present
    if (canvasImageUri && typeof canvasImageUri === 'string') {
      html += `
        <div class="generated-image-container">
          <img class="canvas-image" src="${canvasImageUri}" alt="Canvas Snapshot" />
          <div style="font-size:12px; color:#718096; margin-top:2px;">Canvas Snapshot</div>
        </div>
      `;
    }

    // Then all attachments, reduced size
    imagesWithPath.forEach((att, idx) => {
      html += `
        <div class="generated-image-container">
          <img class="generated-image" src="${att.storagePath}" alt="Generated Image ${idx + 1}" />
          ${att.name ? `<div style="font-size:11px; color:#718096; margin-top:2px;">${att.name}</div>` : ''}
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;
  }

  html += `
      <div class="footer">
        Generated by Notes App
      </div>
    </body>
    </html>
  `;
  return html;
}

export function formatNoteAsPlainText({
  noteTitle = '',
  noteText = '',
  checklistItems = [],
  drawings = [],
  updatedAt = Date.now(),
  attachmentsList = []
}) {
  let content = '';
  if (noteTitle.trim()) {
    content += `${noteTitle.trim()}\n`;
    content += '='.repeat(noteTitle.trim().length) + '\n\n';
  }
  const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  content += `Last Updated: ${formattedDate}\n\n`;
  if (noteText.trim()) {
    content += 'Content:\n';
    content += '-'.repeat(8) + '\n';
    content += noteText.trim() + '\n\n';
  }
  if (checklistItems.length > 0) {
    content += 'Checklist:\n';
    content += '-'.repeat(9) + '\n';
    checklistItems.forEach((item, index) => {
      const checkbox = item.checked ? '[✓]' : '[ ]';
      content += `${checkbox} ${item.text || `Item ${index + 1}`}\n`;
    });
    content += '\n';
  }
  if (drawings.length > 0) {
    content += `Drawings: ${drawings.length} drawing(s) attached\n`;
    content += '(Drawings are not available in plain text format)\n\n';
  }
  // Add generated images section for plain text
  if (attachmentsList && Array.isArray(attachmentsList) && attachmentsList.length > 0) {
    const imagesWithPath = attachmentsList.filter(att => att && att.storagePath);
    if (imagesWithPath.length > 0) {
      content += 'Generated Images:\n';
      content += '-'.repeat(16) + '\n';
      imagesWithPath.forEach((att, idx) => {
        content += `Image ${idx + 1}: ${att.storagePath}\n`;
        if (att.name) {
          content += `  Name: ${att.name}\n`;
        }
      });
      content += '\n';
    }
  }
  content += `\n--- End of Note ---\nExported from Notes App`;
  return content;
}
