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
      const higher = item.higherFactors ? `<p class="factor-line factor-higher"><strong>Price may be higher when:</strong> ${escapeHtml(item.higherFactors)}</p>` : '';
      const lower = item.lowerFactors ? `<p class="factor-line factor-lower"><strong>Price may be lower when:</strong> ${escapeHtml(item.lowerFactors)}</p>` : '';
      const link = item.link ? `<a class="pricing-link" href="${escapeHtml(item.link)}">${escapeHtml(item.linkText)} <span aria-hidden="true">→</span></a>` : '';
      const factors = higher || lower ? `<div class="pricing-factors">${higher}${lower}</div>` : '';
      return `<li class="pricing-item"><div class="pricing-row"><h4>${escapeHtml(item.name)}</h4><p class="pricing-price"><span>Typical price</span><strong>${escapeHtml(item.price)}</strong></p></div>${note}${factors}${link}</li>`;
    }).join('');
    return `<section class="pricing-group" aria-labelledby="${groupId}"><h3 id="${groupId}">${escapeHtml(group)}</h3><ul class="pricing-list">${services}</ul></section>`;
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
