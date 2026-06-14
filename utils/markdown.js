/**
 * 简易 Markdown 转 HTML 工具
 */

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inlineFormat(text) {
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return text;
}

function md2html(md) {
  if (!md) return '';
  const lines = md.split('\n');
  let html = '';
  let inUl = false;
  let inTable = false;
  let tableRows = [];

  function closeUl() {
    if (inUl) { html += '</ul>'; inUl = false; }
  }

  function flushTable() {
    if (!inTable || tableRows.length === 0) return;
    html += '<table style="border-collapse:collapse;width:100%;margin:16rpx 0;">';
    tableRows.forEach((row, i) => {
      const tag = i === 0 ? 'th' : 'td';
      const bg = i === 0 ? ' style="background:#f1f5f9;font-weight:bold;"' : '';
      html += '<tr' + bg + '>';
      row.forEach(cell => {
        html += '<' + tag + ' style="border:1px solid #e2e8f0;padding:12rpx 16rpx;">' + inlineFormat(cell.trim()) + '</' + tag + '>';
      });
      html += '</tr>';
    });
    html += '</table>';
    tableRows = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // table
    if (line.trim().startsWith('|')) {
      closeUl();
      const cells = line.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cells.every(c => /^[\s:-]+$/.test(c))) continue;
      inTable = true;
      tableRows.push(cells);
      continue;
    } else {
      flushTable();
    }

    // horizontal rule
    if (/^-{3,}$/.test(line.trim())) {
      closeUl();
      html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:24rpx 0;"/>';
      continue;
    }

    // heading
    const hMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (hMatch) {
      closeUl();
      const level = hMatch[1].length;
      const sizes = { 1: '40rpx', 2: '36rpx', 3: '32rpx', 4: '30rpx', 5: '28rpx', 6: '26rpx' };
      // h1 居中
      const align = level === 1 ? 'text-align:center;' : '';
      html += '<h' + level + ' style="font-size:' + (sizes[level] || '28rpx') + ';font-weight:bold;margin:32rpx 0 16rpx;color:#1e293b;' + align + '">' + inlineFormat(hMatch[2]) + '</h' + level + '>';
      continue;
    }

    // blockquote
    if (line.trim().startsWith('>')) {
      closeUl();
      const text = line.replace(/^>\s?/, '');
      html += '<blockquote style="border-left:6rpx solid #00cccc;padding:12rpx 24rpx;margin:16rpx 0;background:#f0fdfa;color:#475569;border-radius:0 8rpx 8rpx 0;">' + inlineFormat(text) + '</blockquote>';
      continue;
    }

    // unordered list
    if (/^-\s+/.test(line.trim())) {
      if (!inUl) { html += '<ul style="padding-left:40rpx;margin:16rpx 0;">'; inUl = true; }
      const text = line.trim().replace(/^-\s+/, '');
      html += '<li style="margin:8rpx 0;color:#334155;">' + inlineFormat(text) + '</li>';
      continue;
    }

    // empty line
    if (line.trim() === '') {
      closeUl();
      continue;
    }

    // paragraph
    closeUl();
    html += '<p style="margin:16rpx 0;color:#334155;line-height:1.8;">' + inlineFormat(line) + '</p>';
  }

  closeUl();
  flushTable();
  return html;
}

module.exports = { md2html };
