/* ---------------------------------------------------------------------------
   Google Analytics 4 — John Calhoun Electric

   TO ACTIVATE: paste the GA4 Measurement ID below (format: G-XXXXXXXXXX).
   Get it from Google Analytics > Admin > Data Streams > your web stream.

   While this constant is empty, gtag.js is never loaded and no network requests
   are made — safe to ship on the demo. All event wiring below stays inert until
   an ID is present, so nothing else needs to change when you switch it on.

   Events sent once active:
     contact_call   a tel: link was clicked  (header / sticky / footer / body)
     form_submit    a contact form was submitted (engagement signal)
     generate_lead  the /thank-you/ page loaded (THE conversion — mark this one
                    as a key event in GA4 > Admin > Events)
     review_click   an outbound click to the Google reviews listing

   Note: form_submit and generate_lead are deliberately separate. Submit events
   are unreliable when the browser navigates away mid-request, so the thank-you
   pageview is what actually counts leads. Do not mark form_submit as a key
   event or leads will be double counted.
--------------------------------------------------------------------------- */

const GA4_MEASUREMENT_ID = '';

if (GA4_MEASUREMENT_ID) {
  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(gtagScript);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID);
}

// No-ops until a Measurement ID is set, so the wiring below is always safe.
function trackEvent(name, params) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params || {});
  }
}

// Where on the page a link lives, so calls from the sticky bar, header, and
// footer can be compared against calls from page content.
function linkLocation(link) {
  if (link.closest('.sticky-call')) return 'sticky_bar';
  if (link.closest('header')) return 'header';
  if (link.closest('footer')) return 'footer';
  if (link.closest('.top-service-bar')) return 'top_bar';
  return 'body';
}

document.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href') || '';

  if (href.startsWith('tel:')) {
    trackEvent('contact_call', {
      link_location: linkLocation(link),
      page_path: window.location.pathname
    });
  } else if (href.includes('google.com/maps')) {
    trackEvent('review_click', {
      link_location: linkLocation(link),
      page_path: window.location.pathname
    });
  }
});

document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', () => {
    trackEvent('form_submit', {
      form_id: form.getAttribute('id') || 'contact_form',
      page_path: window.location.pathname
    });
  });
});

// The thank-you page is the reliable conversion point: it only loads after a
// successful form post (Formspree redirects there via the _next field).
if (window.location.pathname.replace(/\/$/, '').endsWith('/thank-you')) {
  trackEvent('generate_lead', {
    currency: 'USD',
    value: 0,
    page_path: window.location.pathname
  });
}
