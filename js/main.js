function initVideoAutoplay() {
  const videos = document.querySelectorAll('video');
  if (!videos.length) return;

  videos.forEach(v => {
    v.muted = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.load();
    v.play().catch(() => {});
  });

  // Hero video: play eagerly on load without waiting for scroll/touch
  const heroVideo = document.querySelector('video[data-hero]');
  if (heroVideo) {
    const playHero = () => heroVideo.play().catch(() => {});
    playHero();
    heroVideo.addEventListener('canplay', playHero, { once: true });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const v = entry.target;
        if (v.dataset.hero) return; // hero plays independently
        if (entry.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.1 });
    videos.forEach(v => observer.observe(v));
  }

  const unlock = () => {
    document.querySelectorAll('video').forEach(v => v.play().catch(() => {}));
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('touchend', unlock);
  };
  document.addEventListener('touchstart', unlock, { passive: true });
  document.addEventListener('touchend', unlock, { passive: true });
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
