const CONTACT_FORM_ENDPOINT = 'https://b4da2omenf.execute-api.us-east-1.amazonaws.com/Prod/submit';
const CONTACT_FORM_SUCCESS_MESSAGE = 'Thanks. Your request has been sent. A member of the John Calhoun Electric team will contact you soon.';
const CONTACT_FORM_ERROR_MESSAGE = "We couldn't send your request. Please try again or call us directly.";

const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formMessage = contactForm.querySelector('.form-message');
    const fieldValue = name => contactForm.elements.namedItem(name)?.value.trim() || '';

    const payload = {
      clientId: 'jce',
      name: fieldValue('name'),
      phone: fieldValue('phone'),
      email: fieldValue('email'),
      zip: fieldValue('zip'),
      service: fieldValue('service'),
      message: fieldValue('message'),
      website: fieldValue('website')
    };
    const analyticsDetail = {
      formId: contactForm.id || 'contact_form',
      serviceCategory: payload.service || 'not_selected'
    };

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    formMessage.textContent = '';

    try {
      const response = await fetch(CONTACT_FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Form submission failed with status ${response.status}`);
      }

      formMessage.textContent = CONTACT_FORM_SUCCESS_MESSAGE;
      document.dispatchEvent(new CustomEvent('contact-form:success', {
        detail: analyticsDetail
      }));
      contactForm.reset();
    } catch (error) {
      formMessage.textContent = CONTACT_FORM_ERROR_MESSAGE;
      document.dispatchEvent(new CustomEvent('contact-form:error', {
        detail: {
          formId: analyticsDetail.formId,
          errorType: error instanceof TypeError ? 'network_error' : 'api_error'
        }
      }));
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Request Service';
    }
  });
}
