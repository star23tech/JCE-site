document.querySelectorAll('.faq-item button').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const wasOpen = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(other => {
      other.classList.remove('active');
      other.querySelector('button').setAttribute('aria-expanded', 'false');
      other.querySelector('button span').textContent = '+';
    });
    if (!wasOpen) {
      item.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
      button.querySelector('span').textContent = '−';
    }
  });
});

const testimonialSlides = [...document.querySelectorAll('.testimonial-slide')];
let activeTestimonial = 0;

function showTestimonial(index) {
  activeTestimonial = (index + testimonialSlides.length) % testimonialSlides.length;
  testimonialSlides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeTestimonial;
    slide.classList.toggle('active', isActive);
    slide.setAttribute('aria-hidden', String(!isActive));
  });
  document.querySelectorAll('.testimonial-pagination button').forEach((button, buttonIndex) => {
    const isActive = buttonIndex === activeTestimonial;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-current', String(isActive));
  });
}

document.querySelectorAll('.testimonial-pagination button').forEach((button, index) => button.addEventListener('click', () => showTestimonial(index)));

const testimonialCarousel = document.querySelector('.testimonial-carousel');
let testimonialTimer;

function startTestimonialLoop() {
  clearInterval(testimonialTimer);
  testimonialTimer = setInterval(() => showTestimonial(activeTestimonial + 1), 6000);
}

function stopTestimonialLoop() {
  clearInterval(testimonialTimer);
}

if (testimonialCarousel && testimonialSlides.length > 1) {
  startTestimonialLoop();
  testimonialCarousel.addEventListener('mouseenter', stopTestimonialLoop);
  testimonialCarousel.addEventListener('mouseleave', startTestimonialLoop);
  testimonialCarousel.addEventListener('focusin', stopTestimonialLoop);
  testimonialCarousel.addEventListener('focusout', startTestimonialLoop);
  document.addEventListener('visibilitychange', () => document.hidden ? stopTestimonialLoop() : startTestimonialLoop());
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

document.getElementById('contact-form').addEventListener('submit', event => {
  event.preventDefault();
  event.currentTarget.querySelector('.form-message').textContent = 'Thanks! This demo form is ready to connect to your preferred form service.';
});

document.getElementById('year').textContent = new Date().getFullYear();
