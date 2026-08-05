const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('open');
});

nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

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
}

document.querySelector('.testimonial-prev').addEventListener('click', () => showTestimonial(activeTestimonial - 1));
document.querySelector('.testimonial-next').addEventListener('click', () => showTestimonial(activeTestimonial + 1));

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
