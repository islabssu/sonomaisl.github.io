function initVideoAutoplay() {
  const videos = document.querySelectorAll('video');
  if (!videos.length) return;

  videos.forEach(v => {
    v.muted = true;
    v.playsInline = true;
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const v = entry.target;
        if (entry.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    videos.forEach(v => observer.observe(v));
  } else {
    videos.forEach(v => v.play().catch(() => {}));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initVideoAutoplay();
  const nav       = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobile    = document.querySelector('.nav-mobile');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  if (hamburger && mobile) {
    hamburger.addEventListener('click', () => {
      const open = mobile.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (mobile) mobile.classList.remove('open');
        if (hamburger) hamburger.classList.remove('open');
      }
    });
  });
});
