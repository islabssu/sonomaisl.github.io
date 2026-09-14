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

function initInterestForm() {
  const form = document.getElementById('interest-form');
  if (!form) return;

  const level        = document.getElementById('level');
  const collegeGroup = document.getElementById('group-college');
  const hsGroup       = document.getElementById('group-hs');
  const majorField    = document.getElementById('major');
  const gradField      = document.getElementById('expected_graduation');
  const schoolField    = document.getElementById('school_name');
  const gradeField     = document.getElementById('grade');

  function updateLevelGroups() {
    const isCollege = level.value === 'Graduate' || level.value === 'Undergraduate';
    const isHS       = level.value === 'High School';

    collegeGroup.classList.toggle('visible', isCollege);
    hsGroup.classList.toggle('visible', isHS);

    majorField.required = isCollege;
    gradField.required   = isCollege;
    schoolField.required = isHS;
    gradeField.required  = isHS;

    if (!isCollege) { majorField.value = ''; gradField.value = ''; }
    if (!isHS)       { schoolField.value = ''; gradeField.value = ''; }
  }

  if (level) {
    level.addEventListener('change', updateLevelGroups);
    updateLevelGroups();
  }

  // Block copy/paste/cut on the essay field so answers are typed by hand.
  const essay = document.getElementById('essay');
  if (essay) {
    ['paste', 'copy', 'cut', 'drop'].forEach(evt => {
      essay.addEventListener(evt, e => e.preventDefault());
    });
  }

  // Prevent the same rank (1-4) being assigned to more than one project.
  const rankSelects = form.querySelectorAll('select[name^="rank_"]');
  const rankError    = document.getElementById('rank-error');

  function ranksValid() {
    const used = [];
    let ok = true;
    rankSelects.forEach(sel => {
      if (sel.value && used.includes(sel.value)) ok = false;
      if (sel.value) used.push(sel.value);
    });
    return ok;
  }

  form.addEventListener('submit', e => {
    if (!ranksValid()) {
      e.preventDefault();
      rankError.classList.add('visible');
      rankError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (rankError) {
      rankError.classList.remove('visible');
    }
  });

  rankSelects.forEach(sel => {
    sel.addEventListener('change', () => {
      if (ranksValid() && rankError) rankError.classList.remove('visible');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initVideoAutoplay();
  initInterestForm();
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
