/* ══════════════════════════════════════════
   APP.JS — Core App Shell: navigation,
   dark mode, toasts, modal helpers
══════════════════════════════════════════ */

let currentUser = null;
let currentPage = 'dashboard';

const PAGE_TITLES = {
    dashboard: 'डॅशबोर्ड',
    family: 'कुटुंब व्यवस्थापन',
    expenses: 'घर खर्च',
    meals: 'स्वयंपाक नियोजन',
    planner: 'आठवड्याचे नियोजन',
    location: 'स्थान ट्रॅकिंग',
    katta: 'फॅमिली कट्टा',
    festivals: 'सण-उत्सव',
    settings: 'सेटिंग्ज',
};

window.DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
window.DAY_LABELS = ['सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार', 'रविवार'];
window.DAY_SHORT = ['सो', 'मं', 'बु', 'गु', 'शु', 'श', 'र'];

const getRenderers = () => ({
    dashboard: window.renderDashboard,
    family: window.renderFamily,
    expenses: window.renderExpenses,
    meals: window.renderMeals,
    planner: window.renderPlanner,
    location: window.renderLocation,
    katta: window.renderKatta,
    festivals: window.renderFestivals,
    settings: window.renderSettings,
});

// ── Init app after login
async function initApp(user) {
    currentUser = user;
    updateUIForUser(user);
    await navigateTo('dashboard', null);
    await updateNotifBadge();
}

// ── Update topbar & sidebar user info
function updateUIForUser(user) {
    // Sidebar user card
    document.getElementById('sidebarUser').innerHTML = `
    <div class="sidebar-user-card">
      <div class="sidebar-user-avatar">
        ${user.avatar && user.avatar.length > 2 ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>` : (user.avatar || user.name.charAt(0))}
      </div>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${user.name}</div>
        <div class="sidebar-user-role">${user.role === 'admin' ? '👑 Admin' : '👤 सदस्य'}</div>
      </div>
    </div>
  `;

    // Topbar avatar
    const av = document.getElementById('topbarAvatar');
    if (user.avatar && user.avatar.length > 2) {
        av.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
    } else {
        av.textContent = user.name.charAt(0).toUpperCase();
    }
}

// ── Navigate to a page
async function navigateTo(page, linkEl) {
    currentPage = page;
    document.getElementById('topbarTitle').textContent = PAGE_TITLES[page] || page;

    // Update active nav link
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (linkEl) {
        linkEl.classList.add('active');
    } else {
        const found = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (found) found.classList.add('active');
    }

    // Render page
    const container = document.getElementById('pageContent');
    container.innerHTML = '';
    const renderer = getRenderers()[page];
    if (renderer) {
        await renderer(container);
    } else {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">🚧</div><div class="empty-title">लवकरच येणार...</div></div>`;
    }

    // Close sidebar on mobile
    if (window.innerWidth <= 768) closeSidebar();

    window.scrollTo(0, 0);
}

// ── Toggle sidebar (mobile)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const isOpen = sidebar.classList.contains('open');
    if (isOpen) closeSidebar();
    else openSidebar();
}

function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

// ── Dark Mode
async function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark-mode');
    await DB.setDarkMode(isDark);
    const btn = document.getElementById('darkModeToggle');
    if (btn) btn.textContent = isDark ? '☀️' : '🌙';
    showToast(isDark ? 'डार्क मोड चालू' : 'लाइट मोड चालू', 'success');
}

// Apply saved dark mode state
(async function () {
    if (await DB.getDarkMode()) {
        document.documentElement.classList.add('dark-mode');
        const btn = document.getElementById('darkModeToggle');
        if (btn) btn.textContent = '☀️';
    }
})();

// ── Modal
function openModal(html, maxWidth) {
    const overlay = document.getElementById('modalOverlay');
    const box = document.getElementById('modalBox');
    document.getElementById('modalContent').innerHTML = html;
    overlay.classList.remove('hidden');
    if (maxWidth) box.style.maxWidth = maxWidth + 'px';
    else box.style.maxWidth = '';
}

function closeModal(e) {
    if (!e || e.target === document.getElementById('modalOverlay') || e.currentTarget === document.querySelector('.modal-close')) {
        document.getElementById('modalOverlay').classList.add('hidden');
        document.getElementById('modalContent').innerHTML = '';
    }
}

// ── Toast notifications
function showToast(message, type = 'default', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', warning: '⚠️', default: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fade-out 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ── Notification badge (demo)
async function updateNotifBadge() {
    const tasks = await DB.getTasks();
    const activeTasks = tasks.filter(t => !t.done);
    const badge = document.getElementById('notifBadge');
    const count = Math.min(activeTasks.length, 9);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

async function showNotifications() {
    const tasks = await DB.getTasks();
    const activeTasks = tasks.filter(t => !t.done).slice(0, 5);
    const items = activeTasks.length
        ? activeTasks.map(t => `
        <div class="flex items-center gap-2 mb-3">
          <span>${t.type === 'appointment' ? '📅' : t.type === 'festival' ? '🪔' : '✅'}</span>
          <div>
            <div style="font-size:13.5px;font-weight:600">${t.title}</div>
            <div class="text-sm text-muted">${formatDate(t.date)} ${t.time ? '• ' + t.time : ''}</div>
          </div>
          <span class="badge badge-${t.priority === 'high' ? 'danger' : 'warning'}" style="margin-left:auto">${t.priority}</span>
        </div>
      `).join('')
        : '<div class="text-center text-muted" style="padding:20px">📭 कोणत्याही सूचना नाहीत</div>';

    openModal(`
    <div class="modal-title">🔔 सूचना</div>
    ${items}
    ${activeTasks.length > 0 ? `<button class="btn btn-primary btn-sm w-full mt-2" onclick="navigateTo('planner',null);closeModal()">सर्व कार्ये पहा</button>` : ''}
  `);
}

// ── Role check helper
function isAdmin() { return currentUser && currentUser.role === 'admin'; }

// ── Confirm helper
function confirmAction(message, callback) {
    if (confirm(message)) callback();
}

// ── Shake animation (CSS is in main.css via @keyframes)
if (!document.querySelector('style[data-shake]')) {
    const s = document.createElement('style');
    s.dataset.shake = '1';
    s.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }`;
    document.head.appendChild(s);
}
