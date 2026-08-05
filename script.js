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

const tabContent = {
  inspection: { label: 'Every step of the way', title: 'Customer focused', copy: 'From assessing your needs to delivering the service you want, we pride ourselves on our commitment to customer satisfaction every step of the way.' },
  install: { label: 'Every project is unique', title: 'Innovative specialized solutions', copy: 'We recognize that every project and every situation is unique, so we work with you to achieve your goals in the best way possible.' },
  management: { label: '20+ years across the field', title: 'Expert electricians', copy: 'With over 20 years of experience across the electrical field, we provide expert solutions for your electrical needs.' },
  aftercare: { label: 'From first meeting to completion', title: 'Professionalism', copy: 'Our clients can expect a high level of professionalism from the very first meeting through completion of the project.' }
};

document.querySelectorAll('.tabs button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    const content = tabContent[button.dataset.tab];
    document.getElementById('tab-label').textContent = content.label;
    document.getElementById('tab-title').textContent = content.title;
    document.getElementById('tab-copy').textContent = content.copy;
  });
});

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
