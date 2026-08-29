import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, '$1'));
const siteUrl = 'https://johncalhounelectric.com/';
const sharedSource = fs.readFileSync(path.join(root, 'shared-header.js'), 'utf8');
const schemaStart = sharedSource.indexOf('// Build one connected Schema.org graph');
const iifeStart = sharedSource.indexOf('(() => {', schemaStart);
const iifeEnd = sharedSource.indexOf('})();', iifeStart) + 5;

if (schemaStart < 0 || iifeStart < 0 || iifeEnd < 5) {
  throw new Error('Could not locate the shared schema generator.');
}

const generatorSource = sharedSource.slice(iifeStart, iifeEnd);
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const failures = [];
let faqPageCount = 0;
let serviceCount = 0;

const text = html => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

function visibleFaqs(html) {
  const items = [];
  for (const match of html.matchAll(/<div class="faq-item"[^>]*>[\s\S]*?<button[^>]*>([\s\S]*?)<span>\+<\/span><\/button>[\s\S]*?<div class="faq-answer"[^>]*>([\s\S]*?)<\/div>[\s\S]*?<\/div>/gi)) {
    items.push([text(match[1]), text(match[2])]);
  }
  for (const list of html.matchAll(/<div class="faq-list"[^>]*>([\s\S]*?)<\/div>/gi)) {
    for (const article of list[1].matchAll(/<article[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/article>/gi)) {
      items.push([text(article[1]), text(article[2])]);
    }
  }
  return items;
}

function makeFaqItem([question, answer]) {
  const heading = {
    textContent: question,
    cloneNode() { return this; },
    querySelectorAll() { return []; }
  };
  return {
    querySelector(selector) {
      return selector === 'h3, button' ? heading : { textContent: answer };
    }
  };
}

for (const url of urls) {
  const slug = url.replace(siteUrl, '').replace(/^\/+|\/+$/g, '');
  const filename = path.join(root, slug, 'index.html');
  const file = slug ? filename : path.join(root, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const canonical = html.match(/<link\s+[\s\S]*?rel="canonical"[\s\S]*?href="([^"]+)"[\s\S]*?>/i)?.[1]
    || html.match(/<link\s+[\s\S]*?href="([^"]+)"[\s\S]*?rel="canonical"[\s\S]*?>/i)?.[1];
  const title = text(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] || '';
  const h1 = text(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || title);
  const faqs = visibleFaqs(html);
  let output = '';

  const document = {
    title,
    head: { appendChild(node) { output = node.textContent; } },
    querySelector(selector) {
      if (selector.startsWith('meta[name="robots"')) return null;
      if (selector === 'link[rel="canonical"]') return canonical ? { href: canonical } : null;
      if (selector === 'meta[name="description"]') return { content: description };
      if (selector === 'h1') return { textContent: h1 };
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '.faq-item, .faq-list article') return faqs.map(makeFaqItem);
      return [];
    },
    createElement() { return { dataset: {}, textContent: '', type: '' }; }
  };

  try {
    vm.runInNewContext(generatorSource, { document, URL });
    const schema = JSON.parse(output);
    const graph = schema['@graph'];
    const ids = graph.map(node => node['@id']).filter(Boolean);
    const types = graph.flatMap(node => Array.isArray(node['@type']) ? node['@type'] : [node['@type']]);
    if (schema['@context'] !== 'https://schema.org') failures.push(`${slug || 'home'}: invalid @context`);
    if (!types.some(type => ['WebPage', 'AboutPage', 'ContactPage', 'CollectionPage'].includes(type))) failures.push(`${slug || 'home'}: missing page entity`);
    if (new Set(ids).size !== ids.length) failures.push(`${slug || 'home'}: duplicate @id`);
    if (slug && !types.includes('BreadcrumbList')) failures.push(`${slug}: missing BreadcrumbList`);
    if (!slug && (!types.includes('WebSite') || !types.includes('Electrician') || !types.includes('HVACBusiness'))) failures.push('home: missing website or business entity');
    if (types.includes('Service')) serviceCount += 1;
    if (faqs.length) {
      faqPageCount += 1;
      const faq = graph.find(node => node['@type'] === 'FAQPage');
      if (!faq || faq.mainEntity.length !== faqs.length) failures.push(`${slug || 'home'}: FAQ count mismatch`);
    } else if (types.includes('FAQPage')) failures.push(`${slug || 'home'}: FAQ markup without visible FAQs`);
  } catch (error) {
    failures.push(`${slug || 'home'}: ${error.message}`);
  }
}

if (serviceCount !== 18) failures.push(`Expected 18 Service graphs; found ${serviceCount}`);
if (faqPageCount !== 10) failures.push(`Expected 10 visible FAQ pages; found ${faqPageCount}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${urls.length} indexable pages, ${serviceCount} service graphs, and ${faqPageCount} FAQ pages.`);
}
