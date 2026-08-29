document.body.classList.add('homepage-theme');

if (!document.querySelector('link[href$="homepage-theme.css"]')) {
  const sharedThemeLink = document.createElement('link');
  sharedThemeLink.rel = 'stylesheet';
  sharedThemeLink.href = document.body.classList.contains('subpage-shell') ? '../homepage-theme.css' : 'homepage-theme.css';
  document.head.appendChild(sharedThemeLink);
}

// Build one connected Schema.org graph from each page's canonical URL and
// visible content. Keeping this centralized prevents business facts and
// service relationships from drifting between templates.
(() => {
  if (document.querySelector('meta[name="robots"][content*="noindex"]')) return;

  const siteUrl = 'https://johncalhounelectric.com/';
  const businessId = `${siteUrl}#business`;
  const websiteId = `${siteUrl}#website`;
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  if (!canonical?.startsWith(siteUrl)) return;

  const slug = new URL(canonical).pathname.replace(/^\/+|\/+$/g, '');
  const pageId = `${canonical}#webpage`;
  const title = document.title.replace(/\s*\|\s*John Calhoun Electric(?:\s*&amp;\s*HVAC)?$/i, '');
  const description = document.querySelector('meta[name="description"]')?.content || '';
  const serviceArea = [
    ['City', 'Roanoke'], ['City', 'Salem'], ['City', 'Vinton'],
    ['AdministrativeArea', 'Botetourt County'], ['City', 'Daleville'],
    ['City', 'Troutville'], ['City', 'Cloverdale'], ['City', 'Blue Ridge'],
    ['City', 'Bedford'], ['AdministrativeArea', 'Franklin County'],
    ['City', 'Rocky Mount'], ['City', 'Floyd'], ['City', 'Christiansburg'],
    ['City', 'Radford'], ['City', 'Forest']
  ].map(([type, name]) => ({ '@type': type, name }));

  const services = {
    'ac-repair': ['AC Repair', 'Air conditioning repair', 'hvac-services', 'HVAC Services'],
    'ac-installation-replacement': ['AC Installation & Replacement', 'Air conditioning installation and replacement', 'hvac-services', 'HVAC Services'],
    'ac-maintenance-tune-ups': ['AC Maintenance & Tune-Ups', 'Air conditioning maintenance and tune-ups', 'hvac-services', 'HVAC Services'],
    'ductless-mini-splits': ['Ductless Mini Splits', 'Ductless mini-split installation and service', 'hvac-services', 'HVAC Services'],
    'commercial-hvac-services': ['Commercial HVAC Services', 'Commercial heating and air conditioning service', 'hvac-services', 'HVAC Services'],
    'heating-repair': ['Heating Repair', 'Heating system repair', 'hvac-services', 'HVAC Services'],
    'heating-installation-replacement': ['Heating Installation & Replacement', 'Heating system installation and replacement', 'hvac-services', 'HVAC Services'],
    'heat-pump-services': ['Heat Pump Services', 'Heat pump repair, installation, and maintenance', 'hvac-services', 'HVAC Services'],
    'furnace-services': ['Furnace Services', 'Furnace repair, installation, and maintenance', 'hvac-services', 'HVAC Services'],
    'heating-maintenance-tune-ups': ['Heating Maintenance & Tune-Ups', 'Heating system maintenance and tune-ups', 'hvac-services', 'HVAC Services'],
    'electrical-repair-troubleshooting': ['Electrical Repair & Troubleshooting', 'Electrical repair and troubleshooting', 'electrical-services', 'Electrical Services'],
    'panel-replacement': ['Electrical Panel Replacement', 'Electrical panel replacement and upgrades', 'electrical-services', 'Electrical Services'],
    'residential-electrical-installation-upgrades': ['Residential Electrical Installation & Upgrades', 'Residential electrical installation and upgrades', 'electrical-services', 'Electrical Services'],
    'outdoor-service-replacement': ['Outdoor Electrical Service Replacement', 'Outdoor electrical service replacement', 'electrical-services', 'Electrical Services'],
    'wiring-rewiring': ['Home Wiring & Rewiring', 'Residential wiring and rewiring', 'electrical-services', 'Electrical Services'],
    'generators': ['Home Generator Services', 'Home generator installation, connection, maintenance, and troubleshooting', 'electrical-services', 'Electrical Services'],
    'ev-chargers': ['EV Charger Installation', 'Electric vehicle charger installation', 'electrical-services', 'Electrical Services'],
    'commercial-electrical-services': ['Commercial Electrical Services', 'Commercial electrical service, installation, and upgrades', 'electrical-services', 'Electrical Services']
  };

  const graph = [];
  const webpage = {
    '@type': slug === 'about' ? 'AboutPage' : slug === 'contact' ? 'ContactPage' : ['hvac-services', 'electrical-services'].includes(slug) ? 'CollectionPage' : 'WebPage',
    '@id': pageId,
    url: canonical,
    name: title,
    description,
    isPartOf: { '@id': websiteId },
    about: { '@id': businessId },
    inLanguage: 'en-US'
  };
  graph.push(webpage);

  if (!slug) {
    webpage.mainEntity = { '@id': businessId };
    graph.push({
      '@type': 'WebSite',
      '@id': websiteId,
      url: siteUrl,
      name: 'John Calhoun Electric',
      alternateName: 'John Calhoun Electric & HVAC',
      publisher: { '@id': businessId },
      inLanguage: 'en-US'
    });
    graph.push({
      '@type': ['Electrician', 'HVACBusiness'],
      '@id': businessId,
      name: 'John Calhoun Electric',
      legalName: 'John Calhoun Electric, LLC',
      url: siteUrl,
      telephone: '+1-540-300-1982',
      foundingDate: '2016',
      founder: { '@type': 'Person', name: 'John W. Calhoun' },
      logo: {
        '@type': 'ImageObject',
        '@id': `${siteUrl}#logo`,
        url: `${siteUrl}assets/john-calhoun-electric-logo.png`,
        contentUrl: `${siteUrl}assets/john-calhoun-electric-logo.png`
      },
      image: `${siteUrl}assets/JCE_About_Hero.jpg`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '3 8th Street SW',
        addressLocality: 'Roanoke',
        addressRegion: 'VA',
        postalCode: '24016',
        addressCountry: 'US'
      },
      openingHoursSpecification: [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00'
      }],
      contactPoint: [{
        '@type': 'ContactPoint',
        contactType: 'emergency service',
        telephone: '+1-540-300-1982',
        availableLanguage: 'English',
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00',
          closes: '23:59'
        }
      }],
      areaServed: serviceArea,
      identifier: {
        '@type': 'PropertyValue',
        propertyID: 'Virginia contractor license',
        value: '2705169579'
      },
      sameAs: [
        'https://www.facebook.com/JohnCalhounElectric',
        'https://www.instagram.com/john_calhoun_electric/',
        'https://www.linkedin.com/company/john-calhoun-electric/',
        'https://twitter.com/JCE_Official'
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Electrical and HVAC Services',
        itemListElement: Object.entries(services).map(([path, service]) => ({
          '@type': 'Offer',
          url: `${siteUrl}${path}/`,
          itemOffered: { '@id': `${siteUrl}${path}/#service`, '@type': 'Service', name: service[0] }
        }))
      }
    });
  }

  if (slug === 'service-area') {
    graph.push({
      '@type': 'Place',
      '@id': `${canonical}#area`,
      name: 'John Calhoun Electric service area',
      description: 'Roanoke and nearby communities in Southwest Virginia served by John Calhoun Electric.',
      containsPlace: serviceArea
    });
    webpage.mainEntity = { '@id': `${canonical}#area` };
  }

  if (services[slug]) {
    const [name, serviceType] = services[slug];
    graph.push({
      '@type': 'Service',
      '@id': `${canonical}#service`,
      name,
      serviceType,
      url: canonical,
      description,
      provider: { '@id': businessId },
      areaServed: serviceArea,
      mainEntityOfPage: { '@id': pageId }
    });
    webpage.mainEntity = { '@id': `${canonical}#service` };
  }

  const categoryServices = Object.entries(services).filter(([, service]) => service[2] === slug);
  if (categoryServices.length) {
    const listId = `${canonical}#services`;
    graph.push({
      '@type': 'ItemList',
      '@id': listId,
      name: slug === 'hvac-services' ? 'HVAC services' : 'Electrical services',
      numberOfItems: categoryServices.length,
      itemListElement: categoryServices.map(([path, service], index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: service[0],
        url: `${siteUrl}${path}/`
      }))
    });
    webpage.mainEntity = { '@id': listId };
  }

  if (slug) {
    const service = services[slug];
    const crumbs = [{ name: 'Home', url: siteUrl }];
    if (service) crumbs.push({ name: service[3], url: `${siteUrl}${service[2]}/` });
    crumbs.push({ name: service?.[0] || document.querySelector('h1')?.textContent.trim() || title, url: canonical });
    const breadcrumbId = `${canonical}#breadcrumb`;
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem', position: index + 1, name: crumb.name, item: crumb.url
      }))
    });
    webpage.breadcrumb = { '@id': breadcrumbId };
  }

  const faqItems = [...document.querySelectorAll('.faq-item, .faq-list article')].map(item => {
    const heading = item.querySelector('h3, button');
    const answer = item.querySelector('.faq-answer, p');
    if (!heading || !answer) return null;
    const headingCopy = heading.cloneNode(true);
    headingCopy.querySelectorAll('span').forEach(span => span.remove());
    return {
      '@type': 'Question',
      name: headingCopy.textContent.trim(),
      acceptedAnswer: { '@type': 'Answer', text: answer.textContent.trim() }
    };
  }).filter(item => item?.name && item.acceptedAnswer.text);

  if (faqItems.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      url: canonical,
      isPartOf: { '@id': pageId },
      mainEntity: faqItems
    });
  }

  document.querySelectorAll('script[type="application/ld+json"][data-site-schema]').forEach(script => script.remove());
  const schema = document.createElement('script');
  schema.type = 'application/ld+json';
  schema.dataset.siteSchema = 'true';
  schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  document.head.appendChild(schema);
})();

const sharedAssetPrefix = document.body.classList.contains('subpage-shell') ? '../' : '';
const sharedWordmark = document.querySelector('.standard-header .header-wordmark');
if (sharedWordmark) {
  sharedWordmark.innerHTML = `<img class="header-brand-logo" src="${sharedAssetPrefix}assets/john-calhoun-electric-logo.png" alt="John Calhoun Electric and HVAC">`;
}

const sharedMenuButton = document.querySelector('.menu-toggle');
const sharedNav = document.querySelector('.main-nav');
const sharedHeaderCall = document.querySelector('.standard-header .header-call');

if (!document.querySelector('.sticky-call')) {
  document.body.insertAdjacentHTML('beforeend', '<a class="sticky-call" href="tel:+15403001982" aria-label="Call John Calhoun Electric at 540-300-1982"><span class="sticky-call-icon" aria-hidden="true">☎</span><span><small>Call Now</small><strong>(540) 300-1982</strong></span></a>');
}

if (sharedHeaderCall) {
  sharedHeaderCall.setAttribute('aria-label', 'Call John Calhoun Electric at 540-300-1982');
  sharedHeaderCall.innerHTML = '<span class="header-call-icon" aria-hidden="true">☎</span><span class="header-call-copy"><small>Call Now</small><strong>(540) 300-1982</strong></span>';
}

if (sharedNav && !sharedNav.querySelector('.nav-dropdown')) {
  const airLink = sharedNav.querySelector('a');
  if (airLink) {
    const prefix = document.body.classList.contains('subpage-shell') ? '../' : '';
    const dropdown = document.createElement('div');
    dropdown.className = 'nav-dropdown';
    dropdown.innerHTML = `<a href="${prefix}hvac-services/">Air Conditioning</a><ul class="nav-submenu"><li><a href="${prefix}ac-repair/">AC Repair</a></li><li><a href="${prefix}ac-installation-replacement/">AC Installation &amp; Replacement</a></li><li><a href="${prefix}ac-maintenance-tune-ups/">AC Maintenance &amp; Tune-Ups</a></li><li><a href="${prefix}ductless-mini-splits/">Ductless Mini Splits</a></li><li><a href="${prefix}commercial-hvac-services/">Commercial HVAC Services</a></li></ul>`;
    airLink.replaceWith(dropdown);
  }
}

if (sharedNav && !sharedNav.querySelector('.heating-dropdown')) {
  const heatingLink = [...sharedNav.children].find(item => item.tagName === 'A' && item.textContent.trim() === 'Heating');
  if (heatingLink) {
    const prefix = document.body.classList.contains('subpage-shell') ? '../' : '';
    const dropdown = document.createElement('div');
    dropdown.className = 'nav-dropdown heating-dropdown';
    dropdown.innerHTML = `<a href="${prefix}hvac-services/">Heating</a><ul class="nav-submenu"><li><a href="${prefix}heating-repair/">Heating Repair</a></li><li><a href="${prefix}heating-installation-replacement/">Heating Installation & Replacement</a></li><li><a href="${prefix}heat-pump-services/">Heat Pump Services</a></li><li><a href="${prefix}furnace-services/">Furnace Services</a></li><li><a href="${prefix}heating-maintenance-tune-ups/">Heating Maintenance & Tune-Ups</a></li><li><a href="${prefix}commercial-hvac-services/">Commercial HVAC Services</a></li></ul>`;
    heatingLink.replaceWith(dropdown);
  }
}

if (sharedNav && !sharedNav.querySelector('.electrical-dropdown')) {
  const electricalLink = [...sharedNav.children].find(item => item.tagName === 'A' && item.textContent.trim() === 'Electrical');
  if (electricalLink) {
    const prefix = document.body.classList.contains('subpage-shell') ? '../' : '';
    const dropdown = document.createElement('div');
    dropdown.className = 'nav-dropdown electrical-dropdown';
    dropdown.innerHTML = `<a href="${prefix}electrical-services/">Electrical</a><ul class="nav-submenu"><li><a href="${prefix}electrical-repair-troubleshooting/">Electrical Repair & Troubleshooting</a></li><li><a href="${prefix}panel-replacement/">Panel Replacement</a></li><li><a href="${prefix}residential-electrical-installation-upgrades/">Residential Electrical Installation & Upgrades</a></li><li><a href="${prefix}outdoor-service-replacement/">Outdoor Service Replacement</a></li><li><a href="${prefix}wiring-rewiring/">Wiring & Rewiring</a></li><li><a href="${prefix}generators/">Generators</a></li><li><a href="${prefix}ev-chargers/">EV Chargers</a></li><li><a href="${prefix}commercial-electrical-services/">Commercial Electrical Services</a></li></ul>`;
    electricalLink.replaceWith(dropdown);
  }
}

if (sharedNav) {
  const aboutLink = [...sharedNav.querySelectorAll('a')].find(link => link.textContent.trim() === 'About Us');
  if (aboutLink) aboutLink.classList.add('no-menu-arrow');
  const contactLink = [...sharedNav.querySelectorAll('a')].find(link => link.textContent.trim() === 'Contact');
  if (contactLink) contactLink.classList.add('no-menu-arrow');
}

if (sharedMenuButton && sharedNav) {
  sharedMenuButton.addEventListener('click', () => {
    const isOpen = sharedMenuButton.getAttribute('aria-expanded') === 'true';
    sharedMenuButton.setAttribute('aria-expanded', String(!isOpen));
    sharedNav.classList.toggle('open');
  });

  sharedNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    sharedNav.classList.remove('open');
    sharedMenuButton.setAttribute('aria-expanded', 'false');
  }));
}

const sharedFooter = document.querySelector('footer');
const pagePath = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
// The contextual internal links these blocks used to inject now live in the page
// HTML itself, so crawlers that do not execute JavaScript can see them.
if (sharedFooter) {
  const footerPrefix = document.body.classList.contains('subpage-shell') ? '../' : '';
  // The footer is authored statically in every page so crawlers that do not run
  // JavaScript still see the sitemap links, NAP, and license number. This block is
  // only a fallback for a page that has not been converted to a static footer.
  const hasStaticFooter = !!sharedFooter.querySelector('.footer-sitemap');
  if (!hasStaticFooter) {
    sharedFooter.className = 'standard-site-footer';
    sharedFooter.innerHTML = `<div class="footer-main footer-sitemap"><div><h3>Air Conditioning</h3><a href="${footerPrefix}ac-repair/">AC Repair</a><a href="${footerPrefix}ac-installation-replacement/">AC Installation & Replacement</a><a href="${footerPrefix}ac-maintenance-tune-ups/">AC Maintenance & Tune-Ups</a><a href="${footerPrefix}ductless-mini-splits/">Ductless Mini Splits</a><a href="${footerPrefix}commercial-hvac-services/">Commercial HVAC Services</a></div><div><h3>Heating</h3><a href="${footerPrefix}heating-repair/">Heating Repair</a><a href="${footerPrefix}heating-installation-replacement/">Heating Installation & Replacement</a><a href="${footerPrefix}heat-pump-services/">Heat Pump Services</a><a href="${footerPrefix}furnace-services/">Furnace Services</a><a href="${footerPrefix}heating-maintenance-tune-ups/">Heating Maintenance & Tune-Ups</a><a href="${footerPrefix}commercial-hvac-services/">Commercial HVAC Services</a></div><div><h3>Electrical</h3><a href="${footerPrefix}electrical-repair-troubleshooting/">Electrical Repair & Troubleshooting</a><a href="${footerPrefix}panel-replacement/">Panel Replacement</a><a href="${footerPrefix}residential-electrical-installation-upgrades/">Residential Installation & Upgrades</a><a href="${footerPrefix}outdoor-service-replacement/">Outdoor Service Replacement</a><a href="${footerPrefix}wiring-rewiring/">Wiring & Rewiring</a><a href="${footerPrefix}generators/">Generators</a><a href="${footerPrefix}ev-chargers/">EV Chargers</a><a href="${footerPrefix}commercial-electrical-services/">Commercial Electrical Services</a></div><div><h3>Company</h3><a href="${footerPrefix}about/">About Us</a><a href="${footerPrefix}service-area/">Service Area</a><div class="footer-socials" aria-label="John Calhoun Electric social media"><a href="https://www.facebook.com/JohnCalhounElectric" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><span aria-hidden="true">f</span></a><a href="https://www.instagram.com/john_calhoun_electric/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><span aria-hidden="true">ig</span></a><a href="https://www.linkedin.com/company/john-calhoun-electric/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><span aria-hidden="true">in</span></a><a href="https://twitter.com/JCE_Official" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><span aria-hidden="true">X</span></a></div></div></div><div class="footer-bottom"><span>&copy; <span class="shared-year"></span> John Calhoun Electric. <b>|</b> All Rights Reserved</span></div>`;
  }

  const yearTarget = sharedFooter.querySelector('.shared-year');
  if (yearTarget) yearTarget.textContent = new Date().getFullYear();
  const socialLogos = {
    Facebook: 'facebook',
    Instagram: 'instagram',
    LinkedIn: 'https://img.icons8.com/ios-filled/50/ffffff/linkedin.png',
    'X (Twitter)': 'x'
  };
  sharedFooter.querySelectorAll('.footer-socials a').forEach(link => {
    const brand = socialLogos[link.getAttribute('aria-label')];
    if (brand) {
      const logoUrl = brand.startsWith('https://') ? brand : `https://cdn.simpleicons.org/${brand}/ffffff`;
      link.innerHTML = `<img src="${logoUrl}" alt="">`;
    }
  });
  if (!hasStaticFooter) {
    const companyColumn = sharedFooter.querySelector('.footer-socials')?.parentElement;
    if (companyColumn) {
      companyColumn.insertAdjacentHTML('beforeend', '<div class="footer-licenses"><span>Virginia Contractor License</span><strong>#2705169579</strong><address>3 8th Street SW<br>Roanoke, VA 24016</address><a class="footer-phone" href="tel:+15403001982">(540) 300-1982</a></div>');
    }
  }

  if (pagePath.endsWith('/ac-maintenance-tune-ups')) {
    const maintenanceTiming = Array.from(document.querySelectorAll('main p')).find((paragraph) =>
      paragraph.textContent.includes('Homes with older equipment')
    );

    if (maintenanceTiming && !maintenanceTiming.querySelector('a[href*="commercial-hvac-services"]')) {
      maintenanceTiming.insertAdjacentHTML(
        'beforeend',
        ' Businesses and facility managers can review our <a href="../commercial-hvac-services/">commercial HVAC maintenance and service options</a>.'
      );
    }
  }
}
