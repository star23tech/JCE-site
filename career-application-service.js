/* Careers API boundary. Resume bytes go directly to S3; application JSON carries only resumeId. */
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
  const API_BASE = 'https://b4da2omenf.execute-api.us-east-1.amazonaws.com/Prod/careers';

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

  function resumeContentType(file) {
    const extension = (file.name.split('.').pop() || '').toLowerCase();
    return file.type || ALLOWED_RESUME_TYPES[extension]?.[0];
  }

  async function postJson(path, payload) {
    const response = await global.fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`CAREERS_API_${response.status}`);
    const result = await response.json();
    if (result.success === false) throw new Error('CAREERS_API_REJECTED');
    return result;
  }

  async function requestResumeUpload(file) {
    const validation = validateResume(file);
    if (!file || !validation.valid) throw new Error(validation.message || 'RESUME_REQUIRED');
    const result = await postJson('/resume-upload-url', {
      fileName: file.name,
      contentType: resumeContentType(file),
      size: file.size
    });
    if (!result.resumeId || !result.upload?.url || result.upload.method !== 'PUT') {
      throw new Error('INVALID_UPLOAD_AUTHORIZATION');
    }
    return result;
  }

  async function uploadResume(file, upload) {
    const response = await global.fetch(upload.url, {
      method: upload.method,
      headers: upload.headers,
      body: file
    });
    if (!response.ok) throw new Error(`RESUME_UPLOAD_${response.status}`);
  }

  async function submitApplication(application, resumeFile) {
    const payload = { ...application };
    for (const field of ['validDriversLicense', 'reliableTransportation', 'canWorkInRoanoke', 'authorizedToWorkInUS', 'currentlyEmployed']) {
      payload[field] = application[field] === true || application[field] === 'yes';
    }
    if (resumeFile) {
      const authorization = await requestResumeUpload(resumeFile);
      await uploadResume(resumeFile, authorization.upload);
      payload.resumeId = authorization.resumeId;
    }
    const result = await postJson('/application', payload);
    if (result.accepted === false) throw new Error('SUBMISSION_REJECTED');
    return { ...result, accepted: true };
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
