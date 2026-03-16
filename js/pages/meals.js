/* ══════════════════════════════════════════
   MEALS.JS — Swayampak Niyojan (Meal Planning)
══════════════════════════════════════════ */

const MARATHI_DISHES = {
  breakfast: ['पोहे', 'उपमा', 'साबुदाणा खिचडी', 'थालीपीठ', 'इडली-सांबार', 'ढोकळा', 'शिरा', 'दलिया', 'उकडे तांदूळ', 'मेथी पराठा'],
  lunch: ['वरण भात', 'मसाले भात', 'पुरण पोळी', 'खिचडी', 'बिर्याणी', 'पालक पनीर', 'मटकी उसळ', 'चना मसाला', 'दाल तडका', 'मिसळ पाव'],
  dinner: ['भाकरी + पिठला', 'भाजणीचे थालीपीठ', 'वरण भात', 'खिचडी', 'रोटी + भाजी', 'आमटी भात', 'डाळ भात', 'सोलकढी', 'ज्वारीची भाकरी', 'नाचणीची भाकरी'],
};


let currentWeekStart = getWeekStart();

async function renderMeals(container) {
  container.className = 'page-content page-enter';
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>🍛 स्वयंपाक नियोजन</h2>
        <p>आठवड्याचे जेवण नियोजन करा</p>
      </div>
      <button class="btn btn-primary" onclick="generateGroceryList()">🛒 किराणा यादी</button>
    </div>

    <!-- Week nav -->
    <div class="week-nav card mb-4">
      <button class="btn btn-secondary btn-sm" onclick="changeWeek(-1)">◀ मागील</button>
      <div id="weekLabel" class="week-label"></div>
      <button class="btn btn-secondary btn-sm" onclick="changeWeek(1)">पुढील ▶</button>
    </div>

    <!-- Meal Grid -->
    <div class="meal-grid-wrap card">
      <div id="mealGrid" class="meal-grid"></div>
    </div>
  `;

  injectMealCSS();
  await renderMealGrid();
}

async function changeWeek(dir) {
  const d = new Date(currentWeekStart);
  d.setDate(d.getDate() + dir * 7);
  currentWeekStart = d.toISOString().slice(0, 10);
  await renderMealGrid();
}

async function renderMealGrid() {
  const meals = await DB.getMeals();
  const week = meals[currentWeekStart] || {};
  const ws = new Date(currentWeekStart);
  const we = new Date(currentWeekStart); we.setDate(we.getDate() + 6);

  document.getElementById('weekLabel').textContent =
    `${ws.toLocaleDateString('mr-IN', { day: '2-digit', month: 'short' })} — ${we.toLocaleDateString('mr-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;

  const isToday = (idx) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + idx);
    return d.toISOString().slice(0, 10) === todayStr();
  };

  const grid = document.getElementById('mealGrid');
  grid.innerHTML = `
    <!-- Header row -->
    <div class="meal-header-cell empty"></div>
    ${DAY_LABELS.map((d, i) => `<div class="meal-header-cell ${isToday(i) ? 'today' : ''}">${d}${isToday(i) ? '<span class="today-dot"></span>' : ''}</div>`).join('')}

    <!-- Breakfast row -->
    <div class="meal-row-label">🌅 न्याहारी</div>
    ${DAY_NAMES.map((day, i) => mealCell(day, 'breakfast', week, i)).join('')}

    <!-- Lunch row -->
    <div class="meal-row-label">☀️ दुपार</div>
    ${DAY_NAMES.map((day, i) => mealCell(day, 'lunch', week, i)).join('')}

    <!-- Dinner row -->
    <div class="meal-row-label">🌙 रात्री</div>
    ${DAY_NAMES.map((day, i) => mealCell(day, 'dinner', week, i)).join('')}
  `;
}

function mealCell(day, mealType, week, idx) {
  const dish = week[day] && week[day][mealType];
  return `
    <div class="meal-cell ${dish ? 'has-dish' : ''}" onclick="openMealEdit('${day}','${mealType}')">
      ${dish ? `<span class="dish-text">${dish}</span>` : `<span class="add-dish-hint">+ जोडा</span>`}
    </div>
  `;
}

async function openMealEdit(day, mealType) {
  const meals = await DB.getMeals();
  const week = meals[currentWeekStart] || {};
  const current = week[day] && week[day][mealType] || '';
  const dayIdx = DAY_NAMES.indexOf(day);
  const mealLabels = { breakfast: 'न्याहारी', lunch: 'दुपारचे जेवण', dinner: 'रात्रीचे जेवण' };
  const suggestions = MARATHI_DISHES[mealType];
  
  // Split current value to check existing selections
  const currentSelections = current.split(',').map(s => s.trim()).filter(s => s);

  openModal(`
    <div class="modal-title">🍛 जेवण निवडा — ${DAY_LABELS[dayIdx]} (${mealLabels[mealType]})</div>
    
    <div class="form-group">
      <label>अनेक पदार्थ निवडा:</label>
      <div class="sugg-chips-multi mb-3" id="multiSugg">
        ${suggestions.map(d => `
          <button type="button" 
            class="sugg-chip-multi ${currentSelections.includes(d) ? 'selected' : ''}" 
            onclick="toggleMealSelection(this, '${d}')"
          >${d}</button>
        `).join('')}
      </div>
    </div>

    <div class="form-group">
      <label>📝 इतर काही किंवा सानुकूल (Custom):</label>
      <input type="text" id="customMealInput" placeholder="उदा. फळे, बिस्किटे..." value="${currentSelections.filter(s => !suggestions.includes(s)).join(', ')}" oninput="updateFinalMealInput()"/>
    </div>

    <div class="form-group">
      <label>एकूण निवडलेले (संपादन करा):</label>
      <input type="text" id="finalMealInput" value="${current}" placeholder="येथे तुम्ही फायनल डिश लिहू शकता"/>
    </div>

    <div class="flex gap-2">
      <button class="btn btn-primary w-full" onclick="saveMealCell('${day}','${mealType}')">💾 जतन करा</button>
      ${current ? `<button class="btn btn-danger btn-sm" onclick="clearMealCell('${day}','${mealType}')">🗑️</button>` : ''}
      <button class="btn btn-secondary" onclick="closeModal()">रद्द करा</button>
    </div>
  `, 550);
}

window.toggleMealSelection = function(el, dish) {
    el.classList.toggle('selected');
    updateFinalMealInput();
};

window.updateFinalMealInput = function() {
    const selected = Array.from(document.querySelectorAll('.sugg-chip-multi.selected')).map(el => el.textContent);
    const custom = document.getElementById('customMealInput').value.trim();
    const finalInput = document.getElementById('finalMealInput');
    
    let all = [...selected];
    if (custom) {
        const customItems = custom.split(',').map(s => s.trim()).filter(s => s);
        all = [...all, ...customItems];
    }
    finalInput.value = [...new Set(all)].join(', ');
}

async function saveMealCell(day, mealType) {
  const val = document.getElementById('finalMealInput').value.trim();
  if (!val) return clearMealCell(day, mealType);

  const meals = await DB.getMeals();
  if (!meals[currentWeekStart]) meals[currentWeekStart] = {};
  if (!meals[currentWeekStart][day]) meals[currentWeekStart][day] = {};
  meals[currentWeekStart][day][mealType] = val;
  await DB.saveMeals(meals);
  closeModal();
  showToast('जेवण जतन झाले!', 'success');
  await renderMealGrid();
}

async function clearMealCell(day, mealType) {
  const meals = await DB.getMeals();
  if (meals[currentWeekStart] && meals[currentWeekStart][day]) {
    delete meals[currentWeekStart][day][mealType];
  }
  await DB.saveMeals(meals);
  closeModal();
  await renderMealGrid();
}

async function generateGroceryList() {
  const meals = await DB.getMeals();
  const week = meals[currentWeekStart] || {};
  const dishes = [];
  DAY_NAMES.forEach(day => {
    if (week[day]) {
      ['breakfast', 'lunch', 'dinner'].forEach(t => {
        if (week[day][t]) {
           // Split by comma if multiple items are listed
           const items = week[day][t].split(',').map(s => s.trim());
           dishes.push(...items);
        }
      });
    }
  });

  const ingredientMap = {
    'पोहे': ['पोहे', 'कांदा', 'मोहरी', 'लिंबू'],
    'उपमा': ['रवा', 'कांदा', 'टोमॅटो', 'भाज्या'],
    'साबुदाणा खिचडी': ['साबुदाणा', 'दाणे', 'बटाटे', 'जिरे'],
    'थालीपीठ': ['भाजणी पीठ', 'कांदा', 'लोणी'],
    'इडली-सांबार': ['तांदूळ', 'उडीद डाळ', 'डाळी', 'भाज्या'],
    'वरण भात': ['तूर डाळ', 'तांदूळ', 'तूप', 'जिरे'],
    'पुरण पोळी': ['चणा डाळ', 'गुळ', 'मैदा', 'वेलची'],
    'भाकरी + पिठला': ['ज्वारी', 'बेसन', 'कांदा', 'मिरची'],
    'मिसळ': ['मटकी', 'फरसाण', 'कांदा', 'लिंबू'],
  };

  const grocerySet = new Set(['मीठ', 'तेल', 'तिखट', 'हळद', 'कोथिंबीर']);
  dishes.forEach(d => {
    const ings = ingredientMap[d];
    if (ings) ings.forEach(i => grocerySet.add(i));
    else grocerySet.add(d);
  });

  const items = [...grocerySet];
  
  openModal(`
    <div class="modal-title">🛒 किराणा यादी</div>
    <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px">खालील यादी तुम्ही बदलू शकता किंवा नवीन वस्तू जोडू शकता.</p>
    
    <div class="grocery-edit-area card" style="padding:10px; background:var(--bg); margin-bottom:12px">
        <div id="groceryItemsList" class="grocery-items-edit">
          ${items.map((item, i) => `
            <div class="grocery-edit-row" data-id="${i}">
              <input type="text" value="${item}" class="grocery-item-input"/>
              <button class="btn-del" onclick="this.parentElement.remove()">🗑️</button>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-secondary btn-sm w-full mt-2" onclick="addGroceryRow()">+ वस्तू जोडा</button>
    </div>

    <div class="flex gap-2">
      <button class="btn btn-primary w-full" onclick="shareGroceryListUI()">📤 सदस्याला पाठवा</button>
      <button class="btn btn-secondary" onclick="closeModal()">पूर्ण झाले</button>
    </div>
  `, 480);
}

window.addGroceryRow = function() {
    const list = document.getElementById('groceryItemsList');
    const div = document.createElement('div');
    div.className = 'grocery-edit-row';
    div.innerHTML = `
        <input type="text" placeholder="वस्तूचे नाव..." class="grocery-item-input"/>
        <button class="btn-del" onclick="this.parentElement.remove()">🗑️</button>
    `;
    list.appendChild(div);
    div.querySelector('input').focus();
};

async function shareGroceryListUI() {
    const inputs = document.querySelectorAll('.grocery-item-input');
    const items = Array.from(inputs).map(i => i.value.trim()).filter(i => i);
    if (!items.length) {
        showToast('यादी रिकामी आहे!', 'error');
        return;
    }

    const members = await DB.getMembers();
    
    openModal(`
        <div class="modal-title">📤 कोणाला पाठवायचे?</div>
        <p style="font-size:14px;margin-bottom:12px">यादी कोणाला पाठवायची आहे ते निवडा:</p>
        <div class="member-select-list">
            ${members.map(m => `
                <div class="member-select-item" onclick="sendGroceryToMember('${m.id}', '${m.name}')">
                    <div class="m-sel-avatar">${m.avatar && m.avatar.length > 2 ? `<img src="${m.avatar}"/>` : (m.avatar || m.name.charAt(0))}</div>
                    <div class="m-sel-info">
                        <strong>${m.name}</strong>
                        <div>${m.familyRole}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        <input type="hidden" id="pendingGroceryList" value="${items.join(', ')}"/>
        <button class="btn btn-secondary w-full mt-2" onclick="generateGroceryList()">◀ मागे</button>
    `, 400);
}

window.sendGroceryToMember = async function(memberId, name) {
    const itemsText = document.getElementById('pendingGroceryList').value;
    const items = itemsText.split(', ');
    
    // 1. Post to Katta (Family Chat)
    const msgs = await DB.getMessages();
    const listItems = items.map(it => `◽ ${it}`).join('\n');
    msgs.push({
        id: genId(),
        userId: currentUser.id,
        userName: currentUser.name,
        avatar: currentUser.avatar || currentUser.name.charAt(0),
        text: `🛒 *किराणा यादी - @${name}*\n━━━━━━━━━━━━━\n${listItems}\n━━━━━━━━━━━━━\nकृपया वरील सामान घेऊन या. 🙏`,
        time: new Date().toISOString(),
        reactions: []
    });
    await DB.saveMessages(msgs);

    // 2. Assign as a Task in Planner for that day
    const tasks = await DB.getTasks();
    tasks.push({
        id: genId(),
        title: `किराणा सामान आणणे (${name})`,
        type: 'task',
        priority: 'high',
        date: todayStr(),
        time: '',
        note: `यादी: ${itemsText}`,
        done: false,
        addedBy: currentUser.name
    });
    await DB.saveTasks(tasks);

    closeModal();
    showToast(`${name} ला यादी पाठवली आणि कार्य दिले! ✅`, 'success');
};

function injectMealCSS() {
  if (document.getElementById('meal-css')) return;
  const s = document.createElement('style');
  s.id = 'meal-css';
  s.textContent = `
  .week-nav { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
  .week-label { font-size: 15px; font-weight: 700; color: var(--text-primary); font-family:'Tiro Devanagari Marathi',serif; }

  .meal-grid-wrap { overflow-x: auto; padding: 0; }
  .meal-grid {
    display: grid;
    grid-template-columns: 90px repeat(7, 1fr);
    gap: 0;
    min-width: 700px;
  }

  .meal-header-cell {
    background: var(--bg);
    padding: 10px 6px;
    text-align: center;
    font-size: 11.5px;
    font-weight: 700;
    color: var(--text-secondary);
    border: 1px solid var(--border);
    position: relative;
    font-family:'Tiro Devanagari Marathi',serif;
  }
  .meal-header-cell.empty { background: transparent; border: none; }
  .meal-header-cell.today { background: rgba(212,82,10,.12); color: var(--primary); }
  .today-dot { display: block; width:6px;height:6px;border-radius:50%;background:var(--primary);margin:3px auto 0; }

  .meal-row-label {
    display: flex; align-items: center; justify-content: center;
    text-align: center;
    font-size: 11px; font-weight: 700;
    color: var(--text-muted);
    border: 1px solid var(--border);
    padding: 8px 4px;
    background: var(--bg);
    writing-mode: horizontal-tb;
    font-family:'Tiro Devanagari Marathi',serif;
  }

  .meal-cell {
    border: 1px solid var(--border);
    min-height: 70px;
    padding: 10px 8px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    text-align: center;
    transition: background var(--tr);
    background: var(--bg-card);
  }
  .meal-cell:hover { background: rgba(212,82,10,.06); }
  .meal-cell.has-dish { background: rgba(212,82,10,.05); }

  .dish-text { font-size: 12px; font-weight: 600; color: var(--text-primary); font-family:'Tiro Devanagari Marathi',serif; }
  .add-dish-hint { font-size: 11px; color: var(--text-muted); }

  .sugg-chips-multi { display: flex; flex-wrap: wrap; gap: 6px; }
  .sugg-chip-multi {
    padding: 6px 12px; border-radius: 99px;
    background: var(--bg); border: 1.5px solid var(--border);
    font-size: 12px; cursor: pointer; font-family:'Tiro Devanagari Marathi',serif;
    color: var(--text-primary); transition: all 0.2s;
  }
  .sugg-chip-multi:hover { border-color: var(--primary); }
  .sugg-chip-multi.selected { background: var(--primary); color: #fff; border-color: var(--primary); box-shadow: 0 2px 6px rgba(212,82,10,.3); }

  .grocery-edit-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .grocery-item-input { flex: 1; padding: 8px 10px; border: 1.5px solid var(--border); border-radius: 6px; font-family:'Tiro Devanagari Marathi',serif; background: var(--bg-card); color: var(--text-primary); }
  .btn-del { background: none; border: none; font-size: 16px; cursor: pointer; }

  .member-select-list { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; }
  .member-select-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--bg); border-radius: 8px; cursor: pointer; transition: background 0.2s; }
  .member-select-item:hover { background: var(--border); }
  .m-sel-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: 18px; color: #fff; }
  .m-sel-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .m-sel-info { font-size: 13px; line-height: 1.2; }
  .m-sel-info div { font-size: 11px; color: var(--text-muted); }
  `;
  document.head.appendChild(s);
}
