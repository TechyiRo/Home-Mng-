/* ══════════════════════════════════════════
   DASHBOARD.JS — Home Dashboard page
══════════════════════════════════════════ */

async function renderDashboard(container) {
  const expenses = await DB.getExpenses();
  const members = await DB.getMembers();
  const tasks = await DB.getTasks();
  const settings = await DB.getSettings();

  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();

  // This month expenses
  const monthExp = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === curMonth && d.getFullYear() === curYear;
  });
  const totalMonth = monthExp.reduce((s, e) => s + Number(e.amount), 0);

  // Today tasks
  const todayTasks = tasks.filter(t => t.date === todayStr() && !t.done);
  const doneTasks = tasks.filter(t => t.done).length;

  // Category totals for mini-chart
  const catTotals = {};
  monthExp.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount);
  });
  const topCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // Upcoming festivals
  const festivals = getUpcomingFestivals(3);

  // Greeting
  const hour = now.getHours();
  const greeting = hour < 12 ? 'शुभ सकाळ' : hour < 17 ? 'शुभ दुपार' : 'शुभ संध्याकाळ';

  container.className = 'page-content page-enter';
  container.innerHTML = `
    <!-- Greeting Banner -->
    <div class="dashboard-banner">
      <div class="banner-left">
        <div class="banner-greeting">${greeting}, ${currentUser.name.split(' ')[0]}! 🙏</div>
        <div class="banner-family">${settings.familyName || 'आमचे कुटुंब'}</div>
        <div class="banner-date">${now.toLocaleDateString('mr-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
      <div class="banner-right">
        <div class="banner-emoji">🏠</div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid-4 mb-4">
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(212,82,10,.1)">👨‍👩‍👧‍👦</div>
        <div class="stat-info">
          <div class="stat-value">${members.length}</div>
          <div class="stat-label">कुटुंब सदस्य</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(139,26,26,.1)">💰</div>
        <div class="stat-info">
          <div class="stat-value">${formatINR(totalMonth)}</div>
          <div class="stat-label">या महिन्याचा खर्च</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(46,125,50,.1)">📅</div>
        <div class="stat-info">
          <div class="stat-value">${todayTasks.length}</div>
          <div class="stat-label">आजची कार्ये</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(212,160,23,.1)">✅</div>
        <div class="stat-info">
          <div class="stat-value">${doneTasks}</div>
          <div class="stat-label">पूर्ण झालेली</div>
        </div>
      </div>
    </div>

    <!-- Row 2: Family Overview + Quick Actions -->
    <div class="grid-2 mb-4" style="grid-template-columns:1.5fr 1fr">

      <!-- Family Members -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">👨‍👩‍👧‍👦 कुटुंब</div>
          <button class="btn btn-sm btn-secondary" onclick="navigateTo('family',null)">सर्व पहा</button>
        </div>
        <div class="members-row">
          ${members.slice(0, 6).map(m => `
            <div class="member-chip">
              <div class="member-avatar">
                ${m.avatar && m.avatar.length > 2 ? `<img src="${m.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>` : (m.avatar || m.name.charAt(0))}
              </div>
              <div class="member-name">${m.name.split(' ')[0]}</div>
              <div class="member-role">${m.familyRole}</div>
            </div>
          `).join('')}
          ${members.length > 6 ? `<div class="member-chip"><div class="member-avatar">+${members.length - 6}</div><div class="member-name">अधिक</div></div>` : ''}
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">⚡ त्वरित कृती</div>
        </div>
        <div class="quick-actions">
          <button class="qa-btn" onclick="openAddExpenseModal()">
            <span class="qa-icon">💸</span><span>खर्च जोडा</span>
          </button>
          <button class="qa-btn" onclick="navigateTo('meals',null)">
            <span class="qa-icon">🍛</span><span>आजचे जेवण</span>
          </button>
          <button class="qa-btn" onclick="openAddTaskModal()">
            <span class="qa-icon">📋</span><span>कार्य जोडा</span>
          </button>
          <button class="qa-btn" onclick="navigateTo('katta',null)">
            <span class="qa-icon">💬</span><span>कट्टा</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Row 3: Expense Chart + Today's Tasks + Festival -->
    <div class="grid-3 mb-4" style="grid-template-columns:1.2fr 1fr 0.8fr">

      <!-- Expense breakdown -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">💰 खर्च विभाजन</div>
          <button class="btn btn-sm btn-secondary" onclick="navigateTo('expenses',null)">तपशील</button>
        </div>
        ${topCats.length ? `
          <div class="exp-chart-wrap">
            <canvas id="dashExpChart" width="180" height="180"></canvas>
            <div class="exp-legend">
              ${topCats.map((c, i) => `
                <div class="legend-item">
                  <span class="legend-dot" style="background:${CHART_COLORS[i]}"></span>
                  <span>${c[0]}</span>
                  <span class="legend-val">${formatINR(c[1])}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="text-center mt-2" style="font-size:13px">
            <strong>एकूण:</strong> ${formatINR(totalMonth)}
          </div>
        ` : '<div class="empty-state" style="padding:30px"><div class="empty-icon">📊</div><div class="empty-title">कोणताही खर्च नाही</div></div>'}
      </div>

      <!-- Today's Tasks -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📅 आजची कार्ये</div>
          <button class="btn btn-sm btn-secondary" onclick="navigateTo('planner',null)">सर्व</button>
        </div>
        ${todayTasks.length ? todayTasks.slice(0, 5).map(t => `
          <div class="task-item">
            <span class="task-type-dot task-${t.type}"></span>
            <div style="flex:1;min-width:0">
              <div style="font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.title}</div>
              ${t.time ? `<div class="text-sm text-muted">⏰ ${t.time}</div>` : ''}
            </div>
            <span class="badge badge-${t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'success'}" style="font-size:10px">${t.priority}</span>
          </div>
        `).join('') : '<div class="empty-state" style="padding:30px"><div class="empty-icon">✅</div><div class="empty-title">सर्व कार्ये पूर्ण!</div></div>'}
      </div>

      <!-- Festivals -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🪔 येणारे सण</div>
          <button class="btn btn-sm btn-secondary" onclick="navigateTo('festivals',null)">सर्व</button>
        </div>
        <div class="festival-list">
          ${festivals.map(f => `
            <div class="festival-item">
              <div class="festival-emoji">${f.emoji}</div>
              <div>
                <div style="font-size:13px;font-weight:600">${f.name}</div>
                <div class="text-sm text-muted">${f.daysLeft === 0 ? '🎉 आज!' : f.daysLeft === 1 ? 'उद्या' : `${f.daysLeft} दिवसांत`}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Today's Meal -->
    <div class="card mb-4">
      <div class="card-header">
        <div class="card-title">🍛 आजचे जेवण</div>
        <button class="btn btn-sm btn-secondary" onclick="navigateTo('meals',null)">नियोजन बदला</button>
      </div>
      ${await renderTodayMeal()}
    </div>

  `;

  // Draw pie chart
  if (topCats.length) {
    setTimeout(() => drawPieChart('dashExpChart', topCats), 100);
  }

  // Quick add expense – needs expenses module
  window.openAddExpenseModal = function () { navigateTo('expenses', null); setTimeout(() => { if (window._openExpModal) _openExpModal(); }, 200); };
  window.openAddTaskModal = function () { navigateTo('planner', null); setTimeout(() => { if (window._openTaskModal) _openTaskModal(); }, 200); };
}

// ── Today's meal card
async function renderTodayMeal() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[new Date().getDay()];
  const ws = getWeekStart();
  const meals = await DB.getMeals();
  const today = meals[ws] && meals[ws][dayName];

  if (!today) return '<div class="text-center text-muted" style="padding:16px">आज जेवण नियोजन नाही &nbsp;<button class="btn btn-sm btn-primary" onclick="navigateTo(\'meals\',null)">योजना करा</button></div>';

  return `
    <div class="meal-today-grid">
      <div class="meal-slot"><div class="meal-slot-label">🌅 न्याहारी</div><div class="meal-slot-dish">${today.breakfast || '—'}</div></div>
      <div class="meal-slot"><div class="meal-slot-label">☀️ दुपार जेवण</div><div class="meal-slot-dish">${today.lunch || '—'}</div></div>
      <div class="meal-slot"><div class="meal-slot-label">🌙 रात्री जेवण</div><div class="meal-slot-dish">${today.dinner || '—'}</div></div>
    </div>
  `;
}

// ── Chart helpers
const CHART_COLORS = ['#D4520A', '#8B1A1A', '#D4A017', '#2E7D32', '#1565C0', '#AD1457'];

function drawPieChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const total = data.reduce((s, d) => s + d[1], 0);
  const cx = canvas.width / 2, cy = canvas.height / 2, r = Math.min(cx, cy) - 10;
  let startAngle = -Math.PI / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  data.forEach((d, i) => {
    const slice = (d[1] / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = CHART_COLORS[i];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    startAngle += slice;
  });

  // Center hole
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, 2 * Math.PI);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#fff';
  ctx.fill();
}

// CSS is in static css/pages.css
