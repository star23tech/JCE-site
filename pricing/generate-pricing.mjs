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
      const serviceId = `${section}-${slugify(item.name)}`;
      const note = item.note ? `<p class="pricing-note"><strong>Good to know:</strong> ${escapeHtml(item.note)}</p>` : '';
      const renderFactorGroup = (factors, type, label) => {
        if (!factors) return '';
        const entries = factors
          .split(';')
          .map(entry => entry.trim())
          .filter(Boolean)
          .map(entry => entry.charAt(0).toUpperCase() + entry.slice(1));
        const list = entries.map(entry => `<li>${escapeHtml(entry)}</li>`).join('');
        return `<section class="factor-panel factor-${type}" aria-label="${escapeHtml(label)}"><h5><span aria-hidden="true">${type === 'higher' ? '+' : '−'}</span>${escapeHtml(label)}</h5><ul class="factor-list">${list}</ul></section>`;
      };
      const higher = renderFactorGroup(item.higherFactors, 'higher', 'May cost more when');
      const lower = renderFactorGroup(item.lowerFactors, 'lower', 'May cost less when');
      const link = item.link ? `<a class="pricing-link" href="${escapeHtml(item.link)}">${escapeHtml(item.linkText)} <span aria-hidden="true">→</span></a>` : '';
      const factors = higher || lower ? `<div class="pricing-factors">${higher}${lower}</div>` : '';
      return `<li class="pricing-item" data-service-name="${escapeHtml(item.name)}" data-typical-price="${escapeHtml(item.price)}"><article aria-labelledby="${serviceId}"><div class="pricing-row"><h4 id="${serviceId}">${escapeHtml(item.name)}</h4><p class="pricing-price" aria-label="Typical price: ${escapeHtml(item.price)}"><span>Typical price</span><strong>${escapeHtml(item.price)}</strong></p></div>${note}${factors}${link}</article></li>`;
    }).join('');
    return `<section class="pricing-group" aria-labelledby="${groupId}"><h3 id="${groupId}">${escapeHtml(group)}</h3><ul class="pricing-list">${services}</ul></section>`;
  }).join('');
}

function renderPricingSchema() {
  const catalog = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Residential HVAC and electrical pricing in Roanoke, Virginia',
    url: 'https://johncalhounelectric.com/pricing/',
    itemListElement: pricingData.map(item => ({
      '@type': 'Offer',
      priceCurrency: 'USD',
      description: [
        `Typical price: ${item.price}.`,
        item.higherFactors ? `The price may be higher if: ${item.higherFactors.replaceAll(';', ',')}.` : '',
        item.lowerFactors ? `The price may be lower when: ${item.lowerFactors.replaceAll(';', ',')}.` : ''
      ].filter(Boolean).join(' '),
      itemOffered: {
        '@type': 'Service',
        name: item.name,
        serviceType: item.name,
        category: item.group,
        areaServed: {
          '@type': 'AdministrativeArea',
          name: 'Roanoke Valley, Virginia'
        }
      }
    }))
  };
  return `<script id="pricing-catalog-jsonld" type="application/ld+json">${JSON.stringify(catalog).replaceAll('<', '\\u003c')}</script>`;
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
const schemaStart = '<!-- PRICING:SCHEMA:START -->';
const schemaEnd = '<!-- PRICING:SCHEMA:END -->';
const schemaPattern = new RegExp(`${schemaStart}[\\s\\S]*?${schemaEnd}`);
if (!schemaPattern.test(html)) throw new Error('Missing pricing schema markers');
html = html.replace(schemaPattern, `${schemaStart}${renderPricingSchema()}${schemaEnd}`);
await writeFile(pagePath, html, 'utf8');
console.log(`Generated ${pricingData.length} pricing entries in ${pagePath}`);
