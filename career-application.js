(function initializeCareerApplication() {
  'use strict';

  const service = window.JCECareerApplicationService;
  const form = document.getElementById('career-application-form');
  if (!service || !form) return;

  const positionSelect = form.elements.namedItem('position');
  const applyingForIndicator = document.getElementById('applying-for-indicator');
  const applyingForPosition = document.getElementById('applying-for-position');
  const availabilitySelect = form.elements.namedItem('availability');
  const availabilityOtherWrap = document.getElementById('availability-other-wrap');
  const availabilityOther = form.elements.namedItem('availabilityOther');
  const resumeInput = form.elements.namedItem('resume');
  const submitButton = form.querySelector('button[type="submit"]');
  const statusMessage = document.getElementById('application-status');
  const validationSummary = document.getElementById('validation-summary');
  const formPanel = document.getElementById('application-form-panel');
  const successPanel = document.getElementById('application-success');
  const resumeDevelopmentNote = document.getElementById('resume-development-note');
  let submitting = false;

  service.POSITIONS.forEach(position => {
    const option = document.createElement('option');
    option.value = position.value;
    option.textContent = position.label;
    positionSelect.appendChild(option);
  });
  const requestedPosition = new URLSearchParams(window.location.search).get('position');
  positionSelect.value = service.normalizePosition(requestedPosition);
  resumeDevelopmentNote.hidden = !service.isLocalDevelopment();

  function updateApplyingForIndicator() {
    const showIndicator = positionSelect.value !== 'general';
    applyingForIndicator.hidden = !showIndicator;
    applyingForPosition.textContent = showIndicator ? service.positionLabel(positionSelect.value) : '';
  }

  function setFieldError(field, message) {
    const error = document.getElementById(`${field.name}-error`);
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message;
  }

  function updateCounter(field) {
    const counter = document.getElementById(`${field.name}-counter`);
    if (counter) counter.textContent = `${field.value.length} / ${field.maxLength}`;
  }

  function toggleAvailabilityOther() {
    const visible = availabilitySelect.value === 'other';
    availabilityOtherWrap.hidden = !visible;
    availabilityOther.required = visible;
    if (!visible) setFieldError(availabilityOther, '');
  }

  function fieldMessage(field) {
    if (field.name === 'resume') return service.validateResume(field.files[0]).message;
    if (field.name === 'availabilityOther' && availabilitySelect.value !== 'other') return '';
    if (field.type === 'radio') {
      const requiredRadio = form.querySelector(`input[type="radio"][name="${field.name}"][required]`);
      const checkedRadio = form.querySelector(`input[type="radio"][name="${field.name}"]:checked`);
      return requiredRadio && !checkedRadio ? requiredRadio.dataset.requiredMessage || 'Select an option.' : '';
    }
    if (field.validity.valueMissing) return field.dataset.requiredMessage || 'This field is required.';
    if (field.validity.typeMismatch && field.type === 'email') return 'Enter a valid email address.';
    if (field.validity.tooLong) return `Keep this response to ${field.maxLength} characters or fewer.`;
    return '';
  }

  function validateField(field) {
    const message = fieldMessage(field);
    setFieldError(field, message);
    return !message;
  }

  function validateForm() {
    const fields = [...form.querySelectorAll('input, select, textarea')].filter(field => field.name !== 'website');
    const invalidFields = fields.filter(field => !validateField(field));
    validationSummary.hidden = invalidFields.length === 0;
    validationSummary.textContent = invalidFields.length ? 'Please correct the highlighted fields before submitting your application.' : '';
    if (invalidFields.length) {
      validationSummary.focus();
      invalidFields[0].focus();
    }
    return invalidFields.length === 0;
  }

  function applicationPayload() {
    const value = name => form.elements.namedItem(name)?.value.trim() || '';
    return {
      fullName: value('fullName'), phone: value('phone'), email: value('email'),
      city: value('city'), state: value('state'), position: value('position'),
      validDriversLicense: value('validDriversLicense'), reliableTransportation: value('reliableTransportation'),
      canWorkInRoanoke: value('canWorkInRoanoke'), authorizedToWorkInUS: value('authorizedToWorkInUS'),
      yearsExperience: value('yearsExperience'), experienceDescription: value('experienceDescription'),
      certifications: value('certifications'), currentlyEmployed: value('currentlyEmployed'),
      availability: value('availability'), availabilityOther: value('availabilityOther'),
      additionalInformation: value('additionalInformation'),
      consent: form.elements.namedItem('consent').checked,
      website: value('website')
    };
  }

  availabilitySelect.addEventListener('change', toggleAvailabilityOther);
  positionSelect.addEventListener('change', updateApplyingForIndicator);
  form.querySelectorAll('textarea[maxlength]').forEach(field => {
    updateCounter(field);
    field.addEventListener('input', () => updateCounter(field));
  });
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('change', () => validateField(field));
  });
  form.addEventListener('focusin', () => {
    document.dispatchEvent(new CustomEvent('career-application:start', { detail: { position: positionSelect.value } }));
  }, { once: true });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !validateForm()) return;
    if (form.elements.namedItem('website').value) return;

    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    statusMessage.textContent = '';
    try {
      const result = await service.submitApplication(applicationPayload(), resumeInput.files[0] || null);
      if (!result.accepted) throw new Error('SUBMISSION_REJECTED');
      form.reset();
      positionSelect.value = service.normalizePosition(requestedPosition);
      updateApplyingForIndicator();
      toggleAvailabilityOther();
      formPanel.hidden = true;
      successPanel.hidden = false;
      successPanel.focus();
    } catch (error) {
      statusMessage.textContent = service.isLocalDevelopment()
        ? "We couldn't submit your application. Please review the form and try again."
        : 'Online application submission is temporarily unavailable. Please try again later.';
    } finally {
      submitting = false;
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Application';
    }
  });

  toggleAvailabilityOther();
  updateApplyingForIndicator();
})();
