/* ==========================================================================
   کنار | Konar — main.js
   رفتارهای عمومی سایت: منوی موبایل، تب‌ها، تولید موج صوتی تزئینی
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initTabs();
  generateWaveforms();
  initCounters();
  initComments();
  initDashboard();
  initPagination();
});

/* ---------- منوی موبایل ---------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const panel = document.querySelector('.mobile-nav-panel');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    panel.classList.toggle('is-open');
    const isOpen = panel.classList.contains('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => panel.classList.remove('is-open'));
  });
}

/* ---------- سیستم تب (لاگین/ثبت‌نام، جزئیات موزیک) ---------- */
function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach((group) => {
    const buttons = [...group.querySelectorAll(':scope > .tab-btn')];
    // پنل‌های تب، فرزند مستقیم .tabs نیستند؛ خواهرِ آن هستند (هر دو زیرِ همان والد)
    const scope = group.parentElement || group;
    const panels = [...scope.querySelectorAll(':scope > .tab-panel')];
    if (!buttons.length || !panels.length) return;

    const activate = (target) => {
      buttons.forEach((btn) => {
        const active = btn.dataset.tabTarget === target;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', String(active));
      });
      panels.forEach((panel) => {
        const active = panel.dataset.tabPanel === target;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    };

    buttons.forEach((btn) => {
      btn.type = 'button';
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        activate(btn.dataset.tabTarget);
      });
    });

    const initial = buttons.find(b => b.classList.contains('is-active')) || buttons[0];
    activate(initial.dataset.tabTarget);
  });
}

/* ---------- تولید نوارهای موج صوتی ----------
   هر عنصر با data-waveform به تعداد مشخص، خط تولید می‌کند
   و درصدی از آن را به عنوان «پخش‌شده» علامت می‌زند (data-progress)
------------------------------------------------------------------ */
function generateWaveforms() {
  document.querySelectorAll('[data-waveform]').forEach((el) => {
    if (el.dataset.waveformBuilt) return;

    const barCount = parseInt(el.dataset.bars || '48', 10);
    const progress = parseFloat(el.dataset.progress || '0');
    const seed = hashString(el.dataset.seed || el.id || String(Math.random()));

    const bars = [];
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('span');
      const h = 18 + Math.round(pseudoRandom(seed + i) * 82);
      bar.style.height = h + '%';
      if (i / barCount * 100 < progress) bar.classList.add('is-played');
      bars.push(bar);
      el.appendChild(bar);
    }

    el.dataset.waveformBuilt = 'true';
  });
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pseudoRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/* ---------- شمارنده‌ی آماری ساده برای هیرو/داشبورد ---------- */
function initCounters() {
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const target = parseInt(el.dataset.counter, 10);
    if (Number.isNaN(target)) return;
    let current = 0;
    const step = Math.max(1, Math.round(target / 40));
    const tick = () => {
      current = Math.min(target, current + step);
      el.textContent = current.toLocaleString('fa-IR');
      if (current < target) requestAnimationFrame(() => setTimeout(tick, 16));
    };
    tick();
  });
}


/* ---------- دیدگاه‌های صفحه‌ی جزئیات ---------- */
function initComments() {
  const form = document.querySelector('#comment-form');
  const panel = document.querySelector('[data-tab-panel="comments"]');
  if (!form || !panel) return;

  let list = panel.querySelector('.comment-list');
  if (!list) {
    list = document.createElement('div');
    list.className = 'comment-list';
    panel.insertBefore(list, form);
    panel.querySelectorAll(':scope > .comment').forEach(comment => list.appendChild(comment));
  }

  const message = document.querySelector('#comment-message');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameInput = form.querySelector('#comment-name');
    const textInput = form.querySelector('#comment-text');
    const name = nameInput?.value.trim();
    const text = textInput?.value.trim();

    if (!name || !text) {
      if (message) {
        message.className = 'form-message';
        message.textContent = 'لطفاً نام و متن دیدگاه را وارد کنید.';
      }
      return;
    }

    const item = document.createElement('article');
    item.className = 'comment comment-new';
    item.innerHTML = `
      <img src="assets/images/avatar-01.svg" alt="">
      <div>
        <div class="head"><h5></h5><span>همین حالا</span></div>
        <p></p>
      </div>
    `;
    item.querySelector('h5').textContent = name;
    item.querySelector('p').textContent = text;
    list.prepend(item);

    form.reset();
    if (message) {
      message.className = 'form-message is-success';
      message.textContent = 'دیدگاه شما با موفقیت ثبت شد.';
      setTimeout(() => { message.textContent = ''; }, 3000);
    }
  });
}

/* ---------- ناوبری پنل کاربری ---------- */
function initDashboard() {
  const dashboard = document.querySelector('.dashboard-wrap');
  if (!dashboard) return;

  const links = dashboard.querySelectorAll('[data-dashboard-target]');
  const sections = dashboard.querySelectorAll('[data-dashboard-section]');
  if (!links.length || !sections.length) return;

  const activate = (target) => {
    links.forEach(link => link.classList.toggle('is-active', link.dataset.dashboardTarget === target));
    sections.forEach(section => section.classList.toggle('is-active', section.dataset.dashboardSection === target));
  };

  links.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      activate(link.dataset.dashboardTarget);
      history.replaceState(null, '', `#${link.dataset.dashboardTarget}`);
    });
  });

  const hash = location.hash.replace('#', '');
  activate([...sections].some(s => s.dataset.dashboardSection === hash) ? hash : 'overview');
}

/* ---------- صفحه‌بندی لیست آهنگ‌ها ---------- */
function initPagination() {
  document.querySelectorAll('[data-pagination]').forEach((wrapper) => {
    const items = [...wrapper.querySelectorAll('[data-page-item]')];
    const controls = wrapper.querySelector('[data-pagination-controls]');
    const perPage = parseInt(wrapper.dataset.perPage || '6', 10);
    if (!items.length || !controls) return;

    let page = 1;
    const pages = Math.ceil(items.length / perPage);

    const render = () => {
      const visibleItems = items.filter(item => item.dataset.filtered !== '0');
      const totalPages = Math.max(1, Math.ceil(visibleItems.length / perPage));
      if (page > totalPages) page = totalPages;

      items.forEach(item => item.hidden = true);
      visibleItems.forEach((item, index) => {
        item.hidden = index < (page - 1) * perPage || index >= page * perPage;
      });

      controls.innerHTML = '';
      const addButton = (label, target, disabled = false, active = false) => {
        const button = document.createElement('button');
        button.className = active ? 'is-active' : '';
        button.type = 'button';
        button.textContent = label;
        button.disabled = disabled;
        button.addEventListener('click', () => { page = target; render(); });
        controls.appendChild(button);
      };

      addButton('→', page - 1, page === 1 || totalPages === 1);
      for (let i = 1; i <= totalPages; i++) addButton(String(i).padStart(2, '0'), i, false, i === page);
      addButton('←', page + 1, page === totalPages || totalPages === 1);
    };
    wrapper._renderPagination = render;
    render();
  });
}
