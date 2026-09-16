/*
  Frontend boundary for the future Careers backend.

  Future secure resume flow:
  1. requestResumeUpload() asks the backend for a short-lived S3 upload URL.
  2. uploadResume() sends the File directly to private S3.
  3. submitApplication() sends application JSON plus the server-issued resume reference.

  No backend endpoint is configured in this frontend-only phase. Never add binary
  or base64 resume data to the application payload.
*/
(function exposeCareerApplicationService(global) {
  'use strict';

  const POSITIONS = Object.freeze([
    Object.freeze({ value: 'hvac-technician', label: 'HVAC Technician' }),
    Object.freeze({ value: 'experienced-electrician', label: 'Experienced Electrician' }),
    Object.freeze({ value: 'general', label: 'Other / General Application' })
  ]);

  const ALLOWED_RESUME_TYPES = Object.freeze({
    pdf: Object.freeze(['application/pdf']),
    doc: Object.freeze(['application/msword']),
    docx: Object.freeze(['application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
  });
  const MAX_RESUME_BYTES = 5 * 1024 * 1024;

  function normalizePosition(value) {
    return POSITIONS.some(position => position.value === value) ? value : 'general';
  }

  function positionLabel(value) {
    return POSITIONS.find(position => position.value === normalizePosition(value)).label;
  }

  function validateResume(file) {
    if (!file) return { valid: true, message: '' };
    if (file.size > MAX_RESUME_BYTES) {
      return { valid: false, message: 'Resume files must be 5 MB or smaller.' };
    }

    const extension = (file.name.split('.').pop() || '').toLowerCase();
    const allowedMimeTypes = ALLOWED_RESUME_TYPES[extension];
    if (!allowedMimeTypes || (file.type && !allowedMimeTypes.includes(file.type))) {
      return { valid: false, message: 'Please upload a PDF, DOC, or DOCX file.' };
    }
    return { valid: true, message: '' };
  }

  function isLocalDevelopment() {
    return ['localhost', '127.0.0.1', '[::1]'].includes(global.location.hostname);
  }

  async function requestResumeUpload() {
    throw new Error('BACKEND_NOT_CONFIGURED');
  }

  async function uploadResume() {
    throw new Error('BACKEND_NOT_CONFIGURED');
  }

  async function submitApplication(application, resumeFile) {
    if (!isLocalDevelopment()) throw new Error('BACKEND_NOT_CONFIGURED');
    // Local-only UX mock. Intentionally does not transmit, persist, or log data.
    await new Promise(resolve => global.setTimeout(resolve, 700));
    return { accepted: true, mock: true };
  }

  global.JCECareerApplicationService = Object.freeze({
    POSITIONS,
    MAX_RESUME_BYTES,
    normalizePosition,
    positionLabel,
    validateResume,
    isLocalDevelopment,
    requestResumeUpload,
    uploadResume,
    submitApplication
  });
})(window);
