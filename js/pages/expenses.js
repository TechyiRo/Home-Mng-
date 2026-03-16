/* ══════════════════════════════════════════
   EXPENSES.JS — Ghar Kharch Management
══════════════════════════════════════════ */

const EXPENSE_CATEGORIES = [
  { name: 'किराणा', emoji: '🛒', color: '#D4520A' },
  { name: 'वीज बिल', emoji: '⚡', color: '#D4A017' },
  { name: 'पाणी बिल', emoji: '💧', color: '#1565C0' },
  { name: 'गॅस', emoji: '🔥', color: '#E53935' },
  { name: 'शाळा फी', emoji: '📚', color: '#2E7D32' },
  { name: 'वैद्यकीय', emoji: '🏥', color: '#AD1457' },
  { name: 'प्रवास', emoji: '🚌', color: '#00695C' },
  { name: 'कपडे', emoji: '👗', color: '#6A1B9A' },
  { name: 'मनोरंजन', emoji: '🎭', color: '#F57F17' },
  { name: 'इतर', emoji: '📦', color: '#546E7A' },
];

let expFilter = { month: new Date().getMonth(), year: new Date().getFullYear(), cat: 'all' };

async function renderExpenses(container) {
  container.className = 'page-content page-enter';
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>💰 घर खर्च</h2>
        <p>तुमच्या कुटुंबाचे आर्थिक व्यवस्थापन</p>
      </div>
      <button class="btn btn-primary" onclick="_openExpModal()" id="addExpBtn">➕ खर्च जोडा</button>
    </div>

    <!-- Filter Bar -->
    <div class="exp-filter-bar card mb-4">
      <div class="flex gap-2 flex-wrap items-center">
        <select id="expMonthSel" onchange="setExpFilter()" class="filter-select">
          ${Array.from({ length: 12 }, (_, i) => `<option value="${i}" ${i === expFilter.month ? 'selected' : ''}>${new Date(2000, i).toLocaleString('mr-IN', { month: 'long' })}</option>`).join('')}
        </select>
        <select id="expYearSel" onchange="setExpFilter()" class="filter-select">
          ${[2023, 2024, 2025, 2026].map(y => `<option value="${y}" ${y === expFilter.year ? 'selected' : ''}>${y}</option>`).join('')}
        </select>
        <select id="expCatSel" onchange="setExpFilter()" class="filter-select">
          <option value="all">सर्व श्रेणी</option>
          ${EXPENSE_CATEGORIES.map(c => `<option value="${c.name}" ${c.name === expFilter.cat ? 'selected' : ''}>${c.emoji} ${c.name}</option>`).join('')}
        </select>
        <button class="btn btn-secondary btn-sm" onclick="resetExpFilter()">🔄 रीसेट</button>
      </div>
    </div>

    <!-- Summary Stats -->
    <div id="expStats" class="grid-4 mb-4"></div>

    <!-- Chart + Category Breakdown -->
    <div class="grid-2 mb-4" style="grid-template-columns:1fr 1.2fr">
      <div class="card">
        <div class="card-title mb-3">📊 श्रेणी विभाजन</div>
        <canvas id="expPieChart" width="200" height="200" style="max-width:200px;margin:0 auto;display:block"></canvas>
        <div id="expPieLegend" class="mt-3"></div>
      </div>
      <div class="card">
        <div class="card-title mb-3">📈 मासिक बार चार्ट</div>
        <canvas id="expBarChart" width="300" height="200" style="width:100%;max-height:200px"></canvas>
      </div>
    </div>

    <!-- Expense Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">📋 खर्चाची यादी</div>
        <span id="expCount" class="badge badge-member"></span>
      </div>
      <div class="table-wrap">
        <table id="expTable">
          <thead>
            <tr>
              <th>श्रेणी</th><th>रक्कम</th><th>तारीख</th><th>नोंद</th><th>जोडले</th>
              ${isAdmin() ? '<th>क्रिया</th>' : ''}
            </tr>
          </thead>
          <tbody id="expTbody"></tbody>
        </table>
      </div>
      <div id="expEmpty" class="empty-state hidden">
        <div class="empty-icon">💸</div>
        <div class="empty-title">कोणताही खर्च नाही</div>
        <div class="empty-text">या महिन्यासाठी कोणताही खर्च नोंदवलेला नाही</div>
      </div>
    </div>
  `;

  window._openExpModal = openAddExpModal;
  injectExpenseCSS();
  await refreshExpenses();
}

async function setExpFilter() {
  expFilter.month = parseInt(document.getElementById('expMonthSel').value);
  expFilter.year = parseInt(document.getElementById('expYearSel').value);
  expFilter.cat = document.getElementById('expCatSel').value;
  await refreshExpenses();
}

async function resetExpFilter() {
  const now = new Date();
  expFilter = { month: now.getMonth(), year: now.getFullYear(), cat: 'all' };
  document.getElementById('expMonthSel').value = expFilter.month;
  document.getElementById('expYearSel').value = expFilter.year;
  document.getElementById('expCatSel').value = 'all';
  await refreshExpenses();
}

async function getFilteredExpenses() {
  const expenses = await DB.getExpenses();
  return expenses.filter(e => {
    const d = new Date(e.date);
    const monthMatch = d.getMonth() === expFilter.month && d.getFullYear() === expFilter.year;
    const catMatch = expFilter.cat === 'all' || e.category === expFilter.cat;
    return monthMatch && catMatch;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function refreshExpenses() {
  const filtered = await getFilteredExpenses();
  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);

  // Category breakdown
  const catMap = {};
  filtered.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount); });
  const catArr = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  // Stats
  const maxExp = filtered.length ? Math.max(...filtered.map(e => Number(e.amount))) : 0;
  document.getElementById('expStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(212,82,10,.1)">💰</div>
      <div class="stat-info"><div class="stat-value">${formatINR(total)}</div><div class="stat-label">एकूण खर्च</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(46,125,50,.1)">📊</div>
      <div class="stat-info"><div class="stat-value">${filtered.length}</div><div class="stat-label">व्यवहार</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(212,160,23,.1)">📈</div>
      <div class="stat-info"><div class="stat-value">${formatINR(filtered.length ? Math.round(total / filtered.length) : 0)}</div><div class="stat-label">सरासरी खर्च</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:rgba(139,26,26,.1)">🔝</div>
      <div class="stat-info"><div class="stat-value">${formatINR(maxExp)}</div><div class="stat-label">सर्वात जास्त</div></div>
    </div>
  `;

  // Pie chart
  drawPieChart('expPieChart', catArr);
  document.getElementById('expPieLegend').innerHTML = catArr.slice(0, 5).map((c, i) => `
    <div class="legend-item"><span class="legend-dot" style="background:${CHART_COLORS[i]}"></span><span>${c[0]}</span><span class="legend-val">${formatINR(c[1])}</span></div>
  `).join('');

  // Bar chart
  await drawBarChart('expBarChart');

  // Table
  const tbody = document.getElementById('expTbody');
  const empty = document.getElementById('expEmpty');
  document.getElementById('expCount').textContent = `${filtered.length} व्यवहार`;

  if (!filtered.length) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  tbody.innerHTML = filtered.map(e => {
    const cat = EXPENSE_CATEGORIES.find(c => c.name === e.category) || { emoji: '📦', color: '#546E7A' };
    return `
      <tr>
        <td>
          <span style="display:flex;align-items:center;gap:6px">
            <span style="font-size:18px">${cat.emoji}</span>
            <span style="color:${cat.color};font-weight:600">${e.category}</span>
          </span>
        </td>
        <td><strong style="color:var(--primary)">${formatINR(e.amount)}</strong></td>
        <td>${formatDate(e.date)}</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.note || '—'}</td>
        <td>${e.addedBy || '—'}</td>
        ${isAdmin() ? `
          <td>
            <div class="flex gap-1">
              <button class="btn btn-sm btn-secondary btn-icon" onclick="openEditExpModal('${e.id}')">✏️</button>
              <button class="btn btn-sm btn-danger  btn-icon" onclick="deleteExpense('${e.id}')">🗑️</button>
            </div>
          </td>
        ` : ''}
      </tr>
    `;
  }).join('');
}

async function openAddExpModal(editId) {
  const expenses = await DB.getExpenses();
  const exp = editId ? expenses.find(e => e.id === editId) : null;

  openModal(`
    <div class="modal-title">${exp ? '✏️ खर्च संपादन' : '➕ नवа खर्च जोडा'}</div>
    <form onsubmit="saveExpense(event,'${editId || ''}')">
      <div class="form-row">
        <div class="form-group">
          <label>📋 श्रेणी</label>
          <select id="eCat" required>
            <option value="">निवडा</option>
            ${EXPENSE_CATEGORIES.map(c => `<option value="${c.name}" ${exp && exp.category === c.name ? 'selected' : ''}>${c.emoji} ${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>💰 रक्कम (₹)</label>
          <input type="number" id="eAmount" min="1" step="0.01" placeholder="0.00" value="${exp ? exp.amount : ''}" required/>
        </div>
      </div>
      <div class="form-group">
        <label>📅 तारीख</label>
        <input type="date" id="eDate" value="${exp ? exp.date : todayStr()}" required/>
      </div>
      <div class="form-group">
        <label>📝 नोंद (ऐच्छिक)</label>
        <textarea id="eNote" placeholder="खर्चाबद्दल नोंद...">${exp ? exp.note : ''}</textarea>
      </div>
      <div class="flex gap-2">
        <button type="submit" class="btn btn-primary w-full">💾 जतन करा</button>
        <button type="button" class="btn btn-secondary" onclick="closeModal()">रद्द करा</button>
      </div>
    </form>
  `);
}

window.openEditExpModal = openAddExpModal;

async function saveExpense(e, editId) {
  e.preventDefault();
  const cat = document.getElementById('eCat').value;
  const amount = parseFloat(document.getElementById('eAmount').value);
  const date = document.getElementById('eDate').value;
  const note = document.getElementById('eNote').value.trim();

  const expenses = await DB.getExpenses();
  if (editId) {
    const idx = expenses.findIndex(e => e.id === editId);
    if (idx >= 0) expenses[idx] = { ...expenses[idx], category: cat, amount, date, note };
  } else {
    expenses.push({ id: genId(), category: cat, amount, date, note, addedBy: currentUser.name });
  }
  await DB.saveExpenses(expenses);
  closeModal();
  showToast(editId ? 'खर्च अपडेट झाला!' : 'खर्च जोडला!', 'success');
  await refreshExpenses();
}

async function deleteExpense(id) {
  confirmAction('हा खर्च हटवायचा आहे का?', async () => {
    const expenses = await DB.getExpenses();
    await DB.saveExpenses(expenses.filter(e => e.id !== id));
    showToast('खर्च हटवला!', 'success');
    await refreshExpenses();
  });
}

// ── Bar chart (last 6 months)
async function drawBarChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 300;
  const H = 200;
  canvas.width = W; canvas.height = H;

  const allExp = await DB.getExpenses();
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleString('mr-IN', { month: 'short' }), month: d.getMonth(), year: d.getFullYear() });
  }

  const totals = months.map(m => {
    return allExp.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === m.month && d.getFullYear() === m.year;
    }).reduce((s, e) => s + Number(e.amount), 0);
  });

  const max = Math.max(...totals, 1);
  const barW = (W - 60) / months.length - 8;
  const padL = 50, padB = 30, padT = 16;
  const chartH = H - padB - padT;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(128,128,128,.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W, y); ctx.stroke();
    ctx.fillStyle = 'rgba(128,128,128,.6)';
    ctx.font = '10px Poppins';
    ctx.textAlign = 'right';
    ctx.fillText(formatINR(Math.round(max * (1 - i / 4))), padL - 4, y + 4);
  }

  // Bars
  months.forEach((m, i) => {
    const x = padL + i * (barW + 8);
    const bH = (totals[i] / max) * chartH;
    const y = padT + chartH - bH;

    const grad = ctx.createLinearGradient(0, y, 0, y + bH);
    grad.addColorStop(0, '#D4520A');
    grad.addColorStop(1, '#9A3906');
    ctx.fillStyle = grad;

    const radius = 4;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + barW - radius, y);
    ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
    ctx.lineTo(x + barW, y + bH);
    ctx.lineTo(x, y + bH);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(128,128,128,.7)';
    ctx.font = '9px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText(m.label, x + barW / 2, H - 8);
  });
}

function injectExpenseCSS() {
  if (document.getElementById('exp-css')) return;
  const s = document.createElement('style');
  s.id = 'exp-css';
  s.textContent = `
  .exp-filter-bar { padding: 14px 16px; }
  .filter-select {
    padding: 8px 12px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    color: var(--text-primary);
    background: var(--bg-card);
    outline: none;
    cursor: pointer;
    transition: border-color var(--tr);
  }
  .filter-select:focus { border-color: var(--primary); }
  `;
  document.head.appendChild(s);
}
