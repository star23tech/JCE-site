document.body.classList.add('homepage-theme');

if (!document.querySelector('link[href$="homepage-theme.css"]')) {
  const sharedThemeLink = document.createElement('link');
  sharedThemeLink.rel = 'stylesheet';
  sharedThemeLink.href = document.body.classList.contains('subpage-shell') ? '../homepage-theme.css' : 'homepage-theme.css';
  document.head.appendChild(sharedThemeLink);
}

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
    dropdown.innerHTML = `<a href="${prefix}hvac-services/index.html">Air Conditioning</a><ul class="nav-submenu"><li><a href="${prefix}ac-repair/index.html">AC Repair</a></li><li><a href="${prefix}ac-installation-replacement/index.html">AC Installation &amp; Replacement</a></li><li><a href="${prefix}ac-maintenance-tune-ups/index.html">AC Maintenance &amp; Tune-Ups</a></li><li><a href="${prefix}ductless-mini-splits/index.html">Ductless Mini Splits</a></li><li><a href="${prefix}commercial-hvac-services/index.html">Commercial HVAC Services</a></li></ul>`;
    airLink.replaceWith(dropdown);
  }
}

if (sharedNav && !sharedNav.querySelector('.heating-dropdown')) {
  const heatingLink = [...sharedNav.children].find(item => item.tagName === 'A' && item.textContent.trim() === 'Heating');
  if (heatingLink) {
    const prefix = document.body.classList.contains('subpage-shell') ? '../' : '';
    const dropdown = document.createElement('div');
    dropdown.className = 'nav-dropdown heating-dropdown';
    dropdown.innerHTML = `<a href="${prefix}hvac-services/index.html">Heating</a><ul class="nav-submenu"><li><a href="${prefix}heating-repair/index.html">Heating Repair</a></li><li><a href="${prefix}heating-installation-replacement/index.html">Heating Installation & Replacement</a></li><li><a href="${prefix}heat-pump-services/index.html">Heat Pump Services</a></li><li><a href="${prefix}furnace-services/index.html">Furnace Services</a></li><li><a href="${prefix}heating-maintenance-tune-ups/index.html">Heating Maintenance & Tune-Ups</a></li><li><a href="${prefix}commercial-hvac-services/index.html">Commercial HVAC Services</a></li></ul>`;
    heatingLink.replaceWith(dropdown);
  }
}

if (sharedNav && !sharedNav.querySelector('.electrical-dropdown')) {
  const electricalLink = [...sharedNav.children].find(item => item.tagName === 'A' && item.textContent.trim() === 'Electrical');
  if (electricalLink) {
    const prefix = document.body.classList.contains('subpage-shell') ? '../' : '';
    const dropdown = document.createElement('div');
    dropdown.className = 'nav-dropdown electrical-dropdown';
    dropdown.innerHTML = `<a href="${prefix}electrical-services/index.html">Electrical</a><ul class="nav-submenu"><li><a href="${prefix}electrical-repair-troubleshooting/index.html">Electrical Repair & Troubleshooting</a></li><li><a href="${prefix}panel-replacement/index.html">Panel Replacement</a></li><li><a href="${prefix}residential-electrical-installation-upgrades/index.html">Residential Electrical Installation & Upgrades</a></li><li><a href="${prefix}outdoor-service-replacement/index.html">Outdoor Service Replacement</a></li><li><a href="${prefix}wiring-rewiring/index.html">Wiring & Rewiring</a></li><li><a href="${prefix}generators/index.html">Generators</a></li><li><a href="${prefix}ev-chargers/index.html">EV Chargers</a></li><li><a href="${prefix}commercial-electrical-services/index.html">Commercial Electrical Services</a></li></ul>`;
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
if (pagePath.endsWith('/ac-repair')) {
  const closingParagraph = [...document.querySelectorAll('.service-close p')].find(paragraph => paragraph.textContent.startsWith('If your AC is not cooling'));
  if (closingParagraph) closingParagraph.innerHTML = 'If your AC is not cooling, leaking, freezing, making noise, or not turning on, contact John Calhoun Electric &amp; HVAC to schedule service. If a major failure makes continued repair impractical, we can also explain your <a href="../ac-installation-replacement/index.html">AC installation and replacement options</a>. To help catch smaller issues before another breakdown, consider regular <a href="../ac-maintenance-tune-ups/index.html">AC maintenance and tune-ups</a>. Businesses, property managers, and multi-unit properties can learn more about our <a href="../commercial-hvac-services/index.html">commercial HVAC repair and troubleshooting</a>.';
}
  if (pagePath.endsWith('/ac-installation-replacement')) {
  const repairParagraph = [...document.querySelectorAll('.details .content p')].find(paragraph => paragraph.textContent.startsWith('Not every broken air conditioner'));
  if (repairParagraph) repairParagraph.innerHTML = 'Not every broken air conditioner needs a new system. Many calls can be solved with professional <a href="../ac-repair/index.html">AC repair in Roanoke</a>, such as replacing a capacitor, motor, or contactor or correcting a drain or electrical problem. Other systems have failed compressors, leaking evaporator coils, repeated refrigerant loss, major control problems, or older R-22 equipment where continued repairs may not be a good investment. After new equipment is installed, regular <a href="../ac-maintenance-tune-ups/index.html">AC maintenance and tune-ups</a> can help protect system performance and identify developing problems early.';
  const equipmentParagraph = [...document.querySelectorAll('.process-list p')].find(paragraph => paragraph.textContent.startsWith('We look at the existing equipment'));
  if (equipmentParagraph) equipmentParagraph.innerHTML = 'We look at the existing equipment, system type, home, and installation. For rooms or additions where new ductwork is impractical, we can also discuss <a href="../ductless-mini-splits/index.html">ductless mini split installation</a>. Business and property-management projects are supported through our <a href="../commercial-hvac-services/index.html">commercial HVAC services</a>. The goal is equipment that keeps the property comfortable without paying for more system than you need.';
}
if (sharedFooter) {
  const footerPrefix = document.body.classList.contains('subpage-shell') ? '../' : '';
  sharedFooter.className = 'standard-site-footer';
  sharedFooter.innerHTML = `<div class="footer-main footer-sitemap"><div><h3>Air Conditioning</h3><a href="${footerPrefix}ac-repair/index.html">AC Repair</a><a href="${footerPrefix}ac-installation-replacement/index.html">AC Installation & Replacement</a><a href="${footerPrefix}ac-maintenance-tune-ups/index.html">AC Maintenance & Tune-Ups</a><a href="${footerPrefix}ductless-mini-splits/index.html">Ductless Mini Splits</a><a href="${footerPrefix}commercial-hvac-services/index.html">Commercial HVAC Services</a></div><div><h3>Heating</h3><a href="${footerPrefix}heating-repair/index.html">Heating Repair</a><a href="${footerPrefix}heating-installation-replacement/index.html">Heating Installation & Replacement</a><a href="${footerPrefix}heat-pump-services/index.html">Heat Pump Services</a><a href="${footerPrefix}furnace-services/index.html">Furnace Services</a><a href="${footerPrefix}heating-maintenance-tune-ups/index.html">Heating Maintenance & Tune-Ups</a><a href="${footerPrefix}commercial-hvac-services/index.html">Commercial HVAC Services</a></div><div><h3>Electrical</h3><a href="${footerPrefix}electrical-repair-troubleshooting/index.html">Electrical Repair & Troubleshooting</a><a href="${footerPrefix}panel-replacement/index.html">Panel Replacement</a><a href="${footerPrefix}residential-electrical-installation-upgrades/index.html">Residential Installation & Upgrades</a><a href="${footerPrefix}outdoor-service-replacement/index.html">Outdoor Service Replacement</a><a href="${footerPrefix}wiring-rewiring/index.html">Wiring & Rewiring</a><a href="${footerPrefix}generators/index.html">Generators</a><a href="${footerPrefix}ev-chargers/index.html">EV Chargers</a><a href="${footerPrefix}commercial-electrical-services/index.html">Commercial Electrical Services</a></div><div><h3>Company</h3><a href="${footerPrefix}about/index.html">About Us</a><a href="${footerPrefix}service-area/index.html">Service Area</a><div class="footer-socials" aria-label="John Calhoun Electric social media"><a href="https://www.facebook.com/JohnCalhounElectric" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><span aria-hidden="true">f</span></a><a href="https://www.instagram.com/john_calhoun_electric/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><span aria-hidden="true">ig</span></a><a href="https://www.linkedin.com/company/john-calhoun-electric/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><span aria-hidden="true">in</span></a><a href="https://twitter.com/JCE_Official" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><span aria-hidden="true">X</span></a></div></div></div><div class="footer-bottom"><span>&copy; <span class="shared-year"></span> John Calhoun Electric. <b>|</b> 3 8th Street SW, Roanoke, VA 24016 <b>|</b> <a href="tel:+15403001982">(540) 300-1982</a> <b>|</b> All Rights Reserved</span></div>`;
  sharedFooter.querySelector('.shared-year').textContent = new Date().getFullYear();
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
  const companyColumn = sharedFooter.querySelector('.footer-socials')?.parentElement;
  if (companyColumn) {
    companyColumn.insertAdjacentHTML('beforeend', '<div class="footer-licenses"><span>Virginia Contractor License</span><strong>#2705169579</strong></div>');
  }

  if (pagePath.endsWith('/ac-maintenance-tune-ups')) {
    const maintenanceTiming = Array.from(document.querySelectorAll('main p')).find((paragraph) =>
      paragraph.textContent.includes('Homes with older equipment')
    );

    if (maintenanceTiming && !maintenanceTiming.querySelector('a[href*="commercial-hvac-services"]')) {
      maintenanceTiming.insertAdjacentHTML(
        'beforeend',
        ' Businesses and facility managers can review our <a href="../commercial-hvac-services/index.html">commercial HVAC maintenance and service options</a>.'
      );
    }
  }
}
