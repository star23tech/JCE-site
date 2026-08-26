/* ---------------------------------------------------------------------------
   Google Analytics 4 — John Calhoun Electric

   TO ACTIVATE: paste the GA4 Measurement ID below (format: G-XXXXXXXXXX).
   Get it from Google Analytics > Admin > Data Streams > your web stream.

   While this constant is empty, gtag.js is never loaded and no network requests
   are made — safe to ship on the demo. All event wiring below stays inert until
   an ID is present, so nothing else needs to change when you switch it on.

   Events sent once active:
     click_to_call  a tel: link was clicked  (header / sticky / footer / body)
     form_start     the first interaction with a contact form
     generate_lead  the contact API confirmed a successful submission
     form_error     the contact API rejected or could not send a submission
     review_click   an outbound click to the Google reviews listing

   generate_lead fires only after the contact API confirms success. Mark it as
   the primary key event. Do not send personal form values to GA4.
--------------------------------------------------------------------------- */

const GA4_MEASUREMENT_ID = 'G-4WDLZ1PB0M';

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
    trackEvent('click_to_call', {
      link_location: linkLocation(link),
      page_path: window.location.pathname,
      lead_method: 'phone'
    });
  } else if (href.includes('google.com/maps')) {
    trackEvent('review_click', {
      link_location: linkLocation(link),
      page_path: window.location.pathname
    });
  }
});

document.querySelectorAll('form').forEach(form => {
  form.addEventListener('focusin', () => {
    trackEvent('form_start', {
      form_id: form.getAttribute('id') || 'contact_form',
      page_path: window.location.pathname
    });
  }, { once: true });
});

// contact-form.js emits these only after the contact API has answered.
document.addEventListener('contact-form:success', event => {
  trackEvent('generate_lead', {
    form_id: event.detail?.formId || 'contact_form',
    service_category: event.detail?.serviceCategory || 'not_selected',
    lead_method: 'form',
    page_path: window.location.pathname
  });
});

document.addEventListener('contact-form:error', event => {
  trackEvent('form_error', {
    form_id: event.detail?.formId || 'contact_form',
    error_type: event.detail?.errorType || 'submission_failed',
    page_path: window.location.pathname
  });
});
