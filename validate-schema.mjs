import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, '$1'));
const siteUrl = 'https://www.johncalhounelectric.com/';
const sharedSource = fs.readFileSync(path.join(root, 'shared-header.js'), 'utf8');
const schemaStart = sharedSource.indexOf('// Build one connected Schema.org graph');
const iifeStart = sharedSource.indexOf('(() => {', schemaStart);
const iifeEnd = sharedSource.indexOf('})();', iifeStart) + 5;

if (schemaStart < 0 || iifeStart < 0 || iifeEnd < 5) {
  throw new Error('Could not locate the shared schema generator.');
}

const generatorSource = sharedSource.slice(iifeStart, iifeEnd);
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const failures = [];
const urlBlocks = [...sitemap.matchAll(/<url>\s*<loc>([^<]*)<\/loc>\s*<\/url>/g)];
const urls = urlBlocks.map(match => match[1].trim());
const sitemapUrlSet = new Set(urls);
let faqPageCount = 0;
let serviceCount = 0;

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match?.[2] ?? '';
}

function getCanonical(html) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    if (getAttribute(match[0], 'rel').toLowerCase().split(/\s+/).includes('canonical')) {
      return getAttribute(match[0], 'href');
    }
  }
  return '';
}

function isNoindex(html) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].some(match => {
    const name = getAttribute(match[0], 'name').toLowerCase();
    const content = getAttribute(match[0], 'content').toLowerCase();
    return name === 'robots' && content.split(/[\s,]+/).includes('noindex');
  });
}

function findIndexPages(directory) {
  const pages = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !['.git', 'node_modules'].includes(entry.name)) {
      pages.push(...findIndexPages(path.join(directory, entry.name)));
    } else if (entry.isFile() && entry.name === 'index.html') {
      pages.push(path.join(directory, entry.name));
    }
  }
  return pages;
}

if (!/^<\?xml version="1\.0" encoding="UTF-8"\?>/.test(sitemap)) {
  failures.push('Sitemap is missing a valid XML declaration.');
}
if (!/<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(sitemap)) {
  failures.push('Sitemap is missing the required sitemap protocol namespace.');
}
if ((sitemap.match(/<url>/g) || []).length !== urlBlocks.length
    || (sitemap.match(/<loc>/g) || []).length !== urlBlocks.length
    || (sitemap.match(/<\/url>/g) || []).length !== urlBlocks.length) {
  failures.push('Sitemap contains a malformed <url> or <loc> entry.');
}
if (urls.some(url => !url)) failures.push('Sitemap contains an empty <loc> element.');
if (sitemapUrlSet.size !== urls.length) failures.push('Sitemap contains duplicate URLs.');

for (const url of urls) {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== siteUrl.slice(0, -1)) failures.push(`${url}: must use the canonical www origin`);
    if (!parsed.pathname.endsWith('/')) failures.push(`${url}: must use the trailing-slash URL`);
    if (parsed.search || parsed.hash) failures.push(`${url}: sitemap URLs cannot contain a query string or fragment`);
  } catch {
    failures.push(`${url}: invalid absolute URL`);
  }
}

const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
if (!/^User-agent:\s*\*$/im.test(robots) || !/^Allow:\s*\/$/im.test(robots)) {
  failures.push('robots.txt must allow public crawling.');
}
if (/^Disallow:\s*\S+/im.test(robots)) failures.push('robots.txt contains an unexpected crawl restriction.');
if (!new RegExp(`^Sitemap:\\s*${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}sitemap\\.xml$`, 'im').test(robots)) {
  failures.push('robots.txt does not reference the canonical www sitemap URL.');
}

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
  if (!fs.existsSync(file)) {
    failures.push(`${url}: no matching index.html file`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const canonical = getCanonical(html);
  if (canonical !== url) failures.push(`${slug || 'home'}: canonical does not match sitemap URL`);
  if (isNoindex(html)) failures.push(`${slug || 'home'}: sitemap page contains a noindex directive`);
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

for (const file of findIndexPages(root)) {
  const html = fs.readFileSync(file, 'utf8');
  if (isNoindex(html)) continue;
  const canonical = getCanonical(html);
  const label = path.relative(root, file) || 'index.html';
  if (!canonical) failures.push(`${label}: indexable page has no canonical URL`);
  else if (!sitemapUrlSet.has(canonical)) failures.push(`${label}: indexable canonical is missing from sitemap`);
}

for (const slug of ['electrical-services', 'hvac-services']) {
  const url = `${siteUrl}${slug}/`;
  if (!sitemapUrlSet.has(url)) failures.push(`${slug}: overview page is missing from sitemap`);
}

const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const slug of ['electrical-services', 'hvac-services']) {
  const target = `${siteUrl}${slug}/`;
  const linkCount = [...homepage.matchAll(/<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>/gi)]
    .filter(match => {
      try { return new URL(match[2], siteUrl).href === target; } catch { return false; }
    }).length;
  if (linkCount < 2) failures.push(`${slug}: expected homepage navigation and contextual internal links`);
  if (!sharedSource.includes(`${slug}/`)) failures.push(`${slug}: missing from shared navigation`);
}

if (serviceCount !== 18) failures.push(`Expected 18 Service graphs; found ${serviceCount}`);
if (faqPageCount !== 10) failures.push(`Expected 10 visible FAQ pages; found ${faqPageCount}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated sitemap XML, robots.txt, ${urls.length} canonical indexable pages, ${serviceCount} service graphs, and ${faqPageCount} FAQ pages.`);
}
