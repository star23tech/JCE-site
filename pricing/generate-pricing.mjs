import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const directory = dirname(fileURLToPath(import.meta.url));
const pagePath = join(directory, 'index.html');
const dataSource = await readFile(join(directory, 'pricing-data.js'), 'utf8');
const pricingData = Function(dataSource.replace('export const pricingData =', 'return'))();
const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const slugify = value => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function renderSection(section) {
  const items = pricingData.filter(item => item.section === section);
  const groups = [...new Set(items.map(item => item.group))];
  return groups.map(group => {
    const groupId = `${section}-${slugify(group)}`;
    const services = items.filter(item => item.group === group).map(item => {
      const note = item.note ? `<p class="pricing-note"><strong>Good to know:</strong> ${escapeHtml(item.note)}</p>` : '';
      const higher = item.higherFactors ? `<div><h5>What might make the price higher</h5><p>${escapeHtml(item.higherFactors)}</p></div>` : '';
      const lower = item.lowerFactors ? `<div><h5>What might make the price lower</h5><p>${escapeHtml(item.lowerFactors)}</p></div>` : '';
      const link = item.link ? `<a class="pricing-link" href="${escapeHtml(item.link)}">${escapeHtml(item.linkText)} <span aria-hidden="true">→</span></a>` : '';
      const factors = higher || lower ? `<div class="factor-grid">${higher}${lower}</div>` : '';
      return `<article class="pricing-item"><header><h4>${escapeHtml(item.name)}</h4><p class="pricing-price"><span>Typical price</span><strong>${escapeHtml(item.price)}</strong></p></header>${note}${factors}${link}</article>`;
    }).join('');
    return `<section class="pricing-group" aria-labelledby="${groupId}"><h3 id="${groupId}">${escapeHtml(group)}</h3><div class="pricing-list">${services}</div></section>`;
  }).join('');
}

let html = await readFile(pagePath, 'utf8');
for (const section of ['electrical', 'hvac']) {
  const upper = section.toUpperCase();
  const start = `<!-- PRICING:${upper}:START -->`;
  const end = `<!-- PRICING:${upper}:END -->`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!pattern.test(html)) throw new Error(`Missing ${section} pricing markers`);
  html = html.replace(pattern, `${start}\n${renderSection(section)}\n${end}`);
}
await writeFile(pagePath, html, 'utf8');
console.log(`Generated ${pricingData.length} pricing entries in ${pagePath}`);
