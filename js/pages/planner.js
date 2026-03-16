/* ══════════════════════════════════════════
   PLANNER.JS — Weekly Family Planner
══════════════════════════════════════════ */

const TASK_TYPES = [
  { value: 'task', label: 'कार्य', emoji: '✅', color: '#2E7D32' },
  { value: 'appointment', label: 'भेट / अपॉईंटमेंट', emoji: '📅', color: '#D4520A' },
  { value: 'reminder', label: 'आठवण', emoji: '🔔', color: '#1565C0' },
  { value: 'festival', label: 'सण / कार्यक्रम', emoji: '🪔', color: '#D4A017' },
  { value: 'family', label: 'कुटुंब कार्य', emoji: '👨‍👩‍👧‍👦', color: '#AD1457' },
];

let plannerView = 'week'; // 'week' or 'list'
let currentPlannerWeekStart = getWeekStart();

async function renderPlanner(container) {
  container.className = 'page-content page-enter';
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>📅 आठवड्याचे नियोजन</h2>
        <p>कुटुंबाचे साप्ताहिक कार्य नियोजन</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-secondary btn-sm" onclick="setPlannerView('week')">📆 आठवडा</button>
        <button class="btn btn-secondary btn-sm" onclick="setPlannerView('list')">📋 यादी</button>
        <button class="btn btn-primary" onclick="_openTaskModal()">➕ कार्य जोडा</button>
      </div>
    </div>

    <!-- Week nav (Visible only in week view) -->
    <div id="plannerWeekNav" class="planner-week-nav card mb-4 ${plannerView === 'week' ? '' : 'hidden'}">
      <button class="btn btn-secondary btn-sm" onclick="changePlannerWeek(-1)">◀ मागील</button>
      <div id="plannerWeekLabel" class="week-label" style="font-weight:700;font-family:'Tiro Devanagari Marathi',serif"></div>
      <button class="btn btn-secondary btn-sm" onclick="changePlannerWeek(1)">पुढील ▶</button>
    </div>

    <div id="plannerBody"></div>
  `;

  window._openTaskModal = openAddTaskModal;
  injectPlannerCSS();
  await renderPlannerView();
}

async function setPlannerView(v) { 
    plannerView = v; 
    const nav = document.getElementById('plannerWeekNav');
    if (nav) nav.classList.toggle('hidden', v !== 'week');
    await renderPlannerView(); 
}

async function changePlannerWeek(dir) {
    const d = new Date(currentPlannerWeekStart);
    d.setDate(d.getDate() + dir * 7);
    currentPlannerWeekStart = d.toISOString().slice(0, 10);
    await renderPlannerView();
}

async function renderPlannerView() {
  const body = document.getElementById('plannerBody');
  if (!body) return;
  if (plannerView === 'week') await renderWeekView(body);
  else await renderListView(body);
}

// ── Week View
async function renderWeekView(body) {
  const tasks = await DB.getTasks();
  const ws = new Date(currentPlannerWeekStart);
  
  // Update week label
  const we = new Date(currentPlannerWeekStart); we.setDate(we.getDate() + 6);
  const label = document.getElementById('plannerWeekLabel');
  if (label) {
      label.textContent = `${ws.toLocaleDateString('mr-IN', { day: '2-digit', month: 'short' })} — ${we.toLocaleDateString('mr-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  }

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentPlannerWeekStart); d.setDate(d.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }

  body.innerHTML = `
    <div class="planner-week-grid">
      ${days.map((day, i) => {
    const dayTasks = tasks.filter(t => t.date === day).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const isT = day === todayStr();
    return `
          <div class="planner-day-col ${isT ? 'today' : ''}">
            <div class="planner-day-header ${isT ? 'today' : ''}">
              <div class="pl-day-name">${DAY_LABELS[i]}</div>
              <div class="pl-day-date">${new Date(day).getDate()}</div>
              ${isT ? '<div class="pl-today-badge">आज</div>' : ''}
            </div>
            <div class="planner-day-tasks" id="pd-${day}">
              ${dayTasks.map(t => taskPill(t)).join('')}
              <button class="add-task-day" onclick="openAddTaskModal('${day}')">+</button>
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;
}

function taskPill(t) {
  const type = TASK_TYPES.find(x => x.value === t.type) || TASK_TYPES[0];
  const done = t.done ? 'done-task' : '';
  return `
    <div class="task-pill ${done}" style="border-left:3px solid ${type.color}">
      <div class="task-pill-header">
        <span class="task-pill-emoji">${type.emoji}</span>
        <span class="task-pill-title">${t.title}</span>
      </div>
      ${t.time ? `<div class="task-pill-time">⏰ ${t.time}</div>` : ''}
      <div class="task-pill-actions">
        <button onclick="toggleTask('${t.id}')" title="${t.done ? 'Undo' : 'Done'}">${t.done ? '↩️' : '✅'}</button>
        ${isAdmin() ? `<button onclick="deleteTask('${t.id}')">🗑️</button>` : ''}
      </div>
    </div>
  `;
}

// ── List View
async function renderListView(body) {
  const tasks = (await DB.getTasks()).sort((a, b) => {
    const dc = new Date(a.date) - new Date(b.date);
    if (dc !== 0) return dc;
    return (a.time || '').localeCompare(b.time || '');
  });
  const grouped = {};
  tasks.forEach(t => { if (!grouped[t.date]) grouped[t.date] = []; grouped[t.date].push(t); });

  const rows = Object.entries(grouped).map(([date, dayTasks]) => {
    const isT = date === todayStr();
    return `
      <div class="card mb-3">
        <div class="card-header">
          <div class="card-title" style="${isT ? 'color:var(--primary)' : ''}">
            ${isT ? '⭐ ' : ''}${formatDate(date)} ${isT ? '(आज)' : ''}
          </div>
          <span class="badge badge-member">${dayTasks.length} कार्ये</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${dayTasks.map(t => listTaskItem(t)).join('')}
        </div>
      </div>
    `;
  }).join('');

  body.innerHTML = rows || `<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-title">कोणतेही कार्य नाही</div><button class="btn btn-primary mt-2" onclick="openAddTaskModal()">कार्य जोडा</button></div>`;
}

function listTaskItem(t) {
  const type = TASK_TYPES.find(x => x.value === t.type) || TASK_TYPES[0];
  const pri = { high: 'danger', medium: 'warning', low: 'success' }[t.priority] || 'member';

  return `
    <div class="list-task-item ${t.done ? 'done-task' : ''}">
      <button class="list-task-check ${t.done ? 'checked' : ''}" onclick="toggleTask('${t.id}')">
        ${t.done ? '✅' : '⬜'}
      </button>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:14px;${t.done ? 'text-decoration:line-through;color:var(--text-muted)' : ''}">${t.title}</div>
        <div class="flex gap-2 mt-1 flex-wrap">
          <span class="text-sm text-muted">${type.emoji} ${type.label}</span>
          ${t.time ? `<span class="text-sm text-muted">⏰ ${t.time}</span>` : ''}
          <span class="badge badge-${pri}">${t.priority}</span>
        </div>
        ${t.note ? `<div class="text-sm text-muted mt-1">📝 ${t.note}</div>` : ''}
      </div>
      ${isAdmin() ? `<button class="btn btn-sm btn-danger btn-icon" onclick="deleteTask('${t.id}')">🗑️</button>` : ''}
    </div>
  `;
}

// ── CRUD
function openAddTaskModal(defaultDate) {
  openModal(`
    <div class="modal-title">➕ नवे कार्य जोडा</div>
    <form onsubmit="saveTask(event, null)">
      <div class="form-group">
        <label>📝 कार्याचे नाव</label>
        <input type="text" id="tTitle" placeholder="कार्य / आठवण / भेट..." required/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>📋 प्रकार</label>
          <select id="tType">
            ${TASK_TYPES.map(x => `<option value="${x.value}">${x.emoji} ${x.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>🚨 प्राधान्य</label>
          <select id="tPriority">
            <option value="low">🟢 कमी</option>
            <option value="medium" selected>🟡 मध्यम</option>
            <option value="high">🔴 जास्त</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>📅 तारीख</label>
          <input type="date" id="tDate" value="${defaultDate || todayStr()}" required/>
        </div>
        <div class="form-group">
          <label>⏰ वेळ (ऐच्छिक)</label>
          <input type="time" id="tTime"/>
        </div>
      </div>
      <div class="form-group">
        <label>📝 नोंद</label>
        <textarea id="tNote" placeholder="अतिरिक्त माहिती..." style="min-height:60px"></textarea>
      </div>
      <div class="flex gap-2">
        <button type="submit" class="btn btn-primary w-full">💾 जतन करा</button>
        <button type="button" class="btn btn-secondary" onclick="closeModal()">रद्द करा</button>
      </div>
    </form>
  `);
}

async function saveTask(e, editId) {
  e.preventDefault();
  const task = {
    id: editId || genId(),
    title: document.getElementById('tTitle').value.trim(),
    type: document.getElementById('tType').value,
    priority: document.getElementById('tPriority').value,
    date: document.getElementById('tDate').value,
    time: document.getElementById('tTime').value,
    note: document.getElementById('tNote').value.trim(),
    done: false,
    addedBy: currentUser.name,
  };
  const tasks = await DB.getTasks();
  if (editId) { const i = tasks.findIndex(t => t.id === editId); if (i >= 0) tasks[i] = task; }
  else tasks.push(task);
  await DB.saveTasks(tasks);
  closeModal();
  showToast('कार्य जोडले!', 'success');
  await updateNotifBadge();
  await renderPlannerView();
}

async function toggleTask(id) {
  const tasks = await DB.getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx >= 0) tasks[idx].done = !tasks[idx].done;
  await DB.saveTasks(tasks);
  await updateNotifBadge();
  await renderPlannerView();
}

async function deleteTask(id) {
  confirmAction('हे कार्य हटवायचे आहे का?', async () => {
    const tasks = await DB.getTasks();
    await DB.saveTasks(tasks.filter(t => t.id !== id));
    await updateNotifBadge();
    await renderPlannerView();
    showToast('कार्य हटवले!', 'success');
  });
}

function injectPlannerCSS() {
  if (document.getElementById('planner-css')) return;
  const s = document.createElement('style');
  s.id = 'planner-css';
  s.textContent = `
  .planner-week-nav { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }

  .planner-week-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
  }

  .planner-day-col {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    min-height: 300px;
    transition: box-shadow var(--tr);
  }
  .planner-day-col.today { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(212,82,10,.15); }

  .planner-day-header {
    padding: 10px 8px; background: var(--bg);
    border-bottom: 1px solid var(--border);
    text-align: center;
  }
  .planner-day-header.today { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); }
  .planner-day-header.today .pl-day-name,
  .planner-day-header.today .pl-day-date { color: #FFF; }

  .pl-day-name { font-size: 10px; font-weight: 700; color: var(--text-muted); font-family:'Tiro Devanagari Marathi',serif; }
  .pl-day-date { font-size: 20px; font-weight: 800; color: var(--text-primary); }
  .pl-today-badge { font-size: 9px; background: rgba(255,255,255,.3); color: #fff; border-radius: 99px; padding: 1px 6px; display: inline-block; margin-top: 2px; }

  .planner-day-tasks { padding: 8px 6px; display: flex; flex-direction: column; gap: 4px; }

  .task-pill {
    background: var(--bg);
    border-radius: 6px;
    padding: 6px 8px;
    font-size: 11.5px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .task-pill:hover { transform: scale(1.02); }
  .task-pill.done-task { opacity: 0.5; }
  .task-pill-header { display: flex; align-items: center; gap: 4px; margin-bottom: 2px; }
  .task-pill-emoji  { font-size: 13px; }
  .task-pill-title  { font-weight: 600; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
  .task-pill-time   { font-size: 10px; color: var(--text-muted); }
  .task-pill-actions { display: flex; gap: 4px; margin-top: 4px; }
  .task-pill-actions button { background: none; border: none; cursor: pointer; font-size: 12px; padding: 0 2px; }

  .add-task-day {
    display: block; width: 100%;
    padding: 5px;
    background: none; border: 1.5px dashed var(--border);
    border-radius: 6px; cursor: pointer;
    font-size: 18px; color: var(--text-muted);
    transition: all 0.2s;
    font-family:'Poppins',sans-serif;
  }
  .add-task-day:hover { border-color: var(--primary); color: var(--primary); }

  .list-task-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px; background: var(--bg); border-radius: var(--radius-sm); }
  .list-task-check { background: none; border: none; font-size: 18px; cursor: pointer; padding: 0; flex-shrink: 0; }
  .list-task-item.done-task { opacity: 0.6; }

  @media(max-width:1024px) { .planner-week-grid { grid-template-columns: repeat(4, 1fr); } }
  @media(max-width:768px)  { .planner-week-grid { grid-template-columns: repeat(2, 1fr); } }
  @media(max-width:480px)  { .planner-week-grid { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(s);
}
