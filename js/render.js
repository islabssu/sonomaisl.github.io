async function load(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error('Failed to load ' + path);
  return r.json();
}

function badge(status) {
  const cls = status === 'active' ? 'badge-active' : 'badge-completed';
  const txt = status === 'active' ? 'Active' : 'Completed';
  return `<span class="badge ${cls}">${txt}</span>`;
}

function projectCard(p) {
  const img = p.video
    ? `<video autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover"><source src="${p.video}" type="video/mp4"></video>`
    : p.image
      ? `<img src="${p.image}" alt="${p.title}" loading="lazy">`
      : '';
  const students = '';
  return `
    <article class="project-card" id="${p.id}" data-area="${p.area}" data-status="${p.status}">
      <div class="project-img">${img}</div>
      <div class="project-body">
        <div class="project-meta">
          ${badge(p.status)}
          <span class="project-years">${p.years}</span>
        </div>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        ${students}
        <a class="project-link" href="research.html#${p.id}">View project →</a>
      </div>
    </article>`;
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card => {
        let hide = false;
        if (f === 'active' || f === 'completed') hide = card.dataset.status !== f;
        else if (f !== 'all') hide = card.dataset.area !== f;
        card.dataset.hidden = hide ? 'true' : '';
      });
    });
  });
}

async function renderFeatured() {
  const el = document.getElementById('featured-projects');
  if (!el) return;
  const projects = await load('data/projects.json');
  el.innerHTML = projects.filter(p => p.featured).map(projectCard).join('');
}

async function renderAll() {
  const el = document.getElementById('all-projects');
  if (!el) return;
  const projects = await load('data/projects.json');
  el.innerHTML = projects.map(projectCard).join('');
  initFilters();
}

async function renderUpdates() {
  const el = document.getElementById('updates-list');
  if (!el) return;
  const updates = await load('data/updates.json');
  const items = updates
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  el.innerHTML = items.map(u => {
    const d = new Date(u.date + 'T12:00:00');
    const ds = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const cls = 'cat-' + u.category.toLowerCase();
    return `
      <div class="update-item">
        <div class="update-date">${ds}</div>
        <div>
          <span class="cat-tag ${cls}">${u.category}</span>
          <div class="update-title">${u.title}</div>
          <div class="update-blurb">${u.blurb}</div>
        </div>
      </div>`;
  }).join('');
}

async function renderPublications() {
  const el = document.getElementById('publications-content');
  if (!el) return;
  const pubs = await load('data/publications.json');

  function pubHTML(p, type) {
    let meta = '';
    if (type === 'patent') {
      meta = `Patent No. ${p.number} &mdash; Issued ${p.issued}`;
    } else if (type === 'journal') {
      const doi = p.doi ? ` &mdash; <a href="https://doi.org/${p.doi}" target="_blank" rel="noopener">DOI</a>` : '';
      meta = `<em>${p.journal}</em>, vol.&nbsp;${p.volume}, no.&nbsp;${p.number}, ${p.year}${doi}`;
    } else {
      const pages = p.pages ? `, pp.&nbsp;${p.pages}` : '';
      meta = `${p.venue}${p.location ? ', ' + p.location : ''}, ${p.year}${pages}`;
    }
    const abs = p.abstract
      ? `<div class="pub-abstract">${p.abstract}</div><button class="pub-toggle">▼ Show abstract</button>`
      : '';
    return `
      <div class="pub-item">
        <div class="pub-title">${p.title}</div>
        <div class="pub-meta">${meta}</div>
        <div class="pub-authors">${p.authors.join(', ')}</div>
        ${abs}
      </div>`;
  }

  let html = '';
  if (pubs.patent?.length) html += `<div class="pub-group"><h2 class="pub-group-title">Patent</h2>${pubs.patent.map(p => pubHTML(p,'patent')).join('')}</div>`;
  const jc = [...(pubs.journal||[]).map(p => pubHTML(p,'journal')), ...(pubs.conference||[]).map(p => pubHTML(p,'conference'))];
  if (jc.length) html += `<div class="pub-group"><h2 class="pub-group-title">Journal and Conference Papers</h2>${jc.join('')}</div>`;
  el.innerHTML = html;

  el.querySelectorAll('.pub-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const abs = btn.previousElementSibling;
      if (abs) {
        abs.classList.toggle('open');
        btn.textContent = abs.classList.contains('open') ? '▲ Hide abstract' : '▼ Show abstract';
      }
    });
  });
}

async function renderPeople() {
  const data = await load('data/people.json');

  const dirEl = document.getElementById('director-card');
  if (dirEl) {
    const d = data.director;
    dirEl.innerHTML = `
      <div class="director-avatar">SS</div>
      <div class="director-info">
        <h3>${d.name}</h3>
        <div class="title">${d.title}</div>
        <p>${d.bio}</p>
        <a href="${d.website}" target="_blank" rel="noopener">Personal website →</a>
        <a href="mailto:${d.email}">${d.email}</a>
      </div>`;
  }

  const stuEl = document.getElementById('current-students');
  if (stuEl && data.current_students) {
    stuEl.innerHTML = data.current_students.map(s => {
      const initials = s.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
      return `
        <div class="student-card">
          <div class="student-avatar">${initials}</div>
          <h4>${s.name}</h4>
          <div class="deg">${s.degree}</div>
          ${s.focus ? `<div class="focus">${s.focus}</div>` : ''}
        </div>`;
    }).join('');
  }

  const alumEl = document.getElementById('alumni-list');
  if (alumEl && data.alumni) {
    alumEl.innerHTML = `
      <table class="alumni-table">
        <thead><tr><th>Name</th><th>Degree</th><th>Year</th><th>Project</th></tr></thead>
        <tbody>${data.alumni.map(a => `
          <tr>
            <td>${a.name}</td>
            <td>${a.degree}</td>
            <td>${a.year ?? '—'}</td>
            <td>${a.project}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  const ugEl = document.getElementById('undergrad-list');
  if (ugEl && data.notable_undergrads) {
    ugEl.innerHTML = data.notable_undergrads.map(u => {
      const initials = u.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
      return `
        <div class="student-card">
          <div class="student-avatar" style="background:linear-gradient(135deg,#8a9e99,#5a6b65)">${initials}</div>
          <h4>${u.name}</h4>
          <div class="deg">${u.program}${u.year ? ' · ' + u.year : ''}</div>
        </div>`;
    }).join('');
  }

  const hsEl = document.getElementById('hs-list');
  if (hsEl && data.high_school_contributors) {
    hsEl.innerHTML = `<ul style="list-style:disc;padding-left:1.5rem;color:var(--color-text-muted);font-size:0.9rem;">
      ${data.high_school_contributors.map(h =>
        `<li style="margin-bottom:0.4rem;">${h.name} — ${h.school}${h.year ? ', ' + h.year : ''}</li>`
      ).join('')}
    </ul>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderFeatured().catch(console.error);
  renderAll().catch(console.error);
  renderUpdates().catch(console.error);
  renderPublications().catch(console.error);
  renderPeople().catch(console.error);
});
