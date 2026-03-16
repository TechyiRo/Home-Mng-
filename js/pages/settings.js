/* ══════════════════════════════════════════
   SETTINGS.JS — App Settings
══════════════════════════════════════════ */

async function renderSettings(container) {
  container.className = 'page-content page-enter';
  const settings = await DB.getSettings();
  const user = currentUser;
  const isDark = DB.getDarkMode();
  const totalExp = (await DB.getExpenses()).reduce((s, e) => s + Number(e.amount), 0);
  const totalMsg = (await DB.getMessages()).length;
  const totalPhot = (await DB.getPhotos()).length;
  const membersCount = (await DB.getMembers()).length;
  const tasksCount = (await DB.getTasks()).length;

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>⚙️ सेटिंग्ज</h2>
        <p>ॲप आणि प्रोफाइल सेटिंग्ज</p>
      </div>
    </div>

    <div class="grid-2" style="grid-template-columns:1fr 1.2fr">

      <!-- Profile Card -->
      <div>
        <div class="card mb-4">
          <div class="profile-card">
            <div class="profile-avatar-big" id="profileDisplayAvatar">
              ${user.avatar && user.avatar.length > 2 ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>` : (user.avatar || user.name.charAt(0))}
            </div>
            <div class="profile-info">
              <div class="profile-name">${user.name}</div>
              <div class="profile-email">📧 ${user.email}</div>
              <div class="profile-role-badge">
                <span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-member'}">
                  ${user.role === 'admin' ? '👑 Admin' : '👤 सदस्य'} — ${user.familyRole || ''}
                </span>
              </div>
              ${user.phone ? `<div class="profile-phone">📱 ${user.phone}</div>` : ''}
            </div>
          </div>
          <button class="btn btn-secondary btn-sm w-full mt-3" onclick="openEditProfileModal()">✏️ प्रोफाइल संपादन</button>
        </div>

        <!-- App Stats -->
        <div class="card">
          <div class="card-title mb-3">📊 ॲप आकडेवारी</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            ${[
      ['👨‍👩‍👧‍👦 कुटुंब सदस्य', membersCount],
      ['💰 एकूण खर्च', formatINR(totalExp)],
      ['💬 संदेश', totalMsg],
      ['📷 फोटो', totalPhot],
      ['📅 कार्ये', tasksCount],
    ].map(([label, val]) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
                <span style="font-size:13.5px">${label}</span>
                <strong style="color:var(--primary)">${val}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Settings Panels -->
      <div style="display:flex;flex-direction:column;gap:16px">

        <!-- Family Settings -->
        <div class="card">
          <div class="card-title mb-3">🏠 कुटुंब सेटिंग्ज</div>
          <div class="form-group">
            <label>कुटुंबाचे नाव</label>
            <input type="text" id="familyNameInput" value="${settings.familyName || 'आमचे कुटुंब'}" placeholder="तुमच्या कुटुंबाचे नाव"/>
          </div>
          <button class="btn btn-primary btn-sm" onclick="saveFamilySettings()">💾 जतन करा</button>
        </div>

        <!-- Appearance -->
        <div class="card">
          <div class="card-title mb-3">🎨 दिसणे</div>
          <div class="settings-row">
            <div>
              <div style="font-weight:600;font-size:14px">डार्क मोड</div>
              <div class="text-sm text-muted">रात्री वापरण्यासाठी डार्क थीम</div>
            </div>
            <div class="toggle-wrap">
              <input type="checkbox" id="darkToggle" class="toggle-input" ${isDark ? 'checked' : ''} onchange="toggleDarkMode()"/>
              <label for="darkToggle" class="toggle-label"></label>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="card">
          <div class="card-title mb-3">🔔 सूचना</div>
          ${[
      ['सण आठवण', 'festival-notif', true],
      ['खर्च आठवण', 'expense-notif', true],
      ['कार्य आठवण', 'task-notif', true],
      ['स्थान अलर्ट', 'location-notif', false],
    ].map(([label, id, checked]) => `
            <div class="settings-row mb-2">
              <div style="font-size:13.5px">${label}</div>
              <div class="toggle-wrap">
                <input type="checkbox" id="${id}" class="toggle-input" ${checked ? 'checked' : ''}
                  onchange="showToast('${label} सेटिंग्ज जतन!','success')"/>
                <label for="${id}" class="toggle-label"></label>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Data Management -->
        <div class="card">
          <div class="card-title mb-3">💾 डेटा व्यवस्थापन</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn btn-secondary btn-sm" onclick="exportData()">📤 डेटा निर्यात (JSON)</button>
            <button class="btn btn-secondary btn-sm" onclick="clearExpenses()">🗑️ खर्च साफ करा</button>
            ${isAdmin() ? `<button class="btn btn-danger btn-sm" onclick="resetAllData()">⚠️ सर्व डेटा मिटवा</button>` : ''}
          </div>
        </div>

        <!-- Password Change -->
        <div class="card">
          <div class="card-title mb-3">🔒 पासवर्ड बदला</div>
          <form onsubmit="changePassword(event)">
            <div class="form-group">
              <label>जुना पासवर्ड</label>
              <input type="password" id="oldPw" placeholder="जुना पासवर्ड" required/>
            </div>
            <div class="form-group">
              <label>नवा पासवर्ड</label>
              <input type="password" id="newPw" placeholder="किमान 8 अक्षरे" required minlength="8"/>
            </div>
            <button type="submit" class="btn btn-primary btn-sm">🔄 पासवर्ड बदला</button>
          </form>
        </div>

      </div>
    </div>

    <!-- App Info -->
    <div class="card mt-4 text-center">
      <div style="font-size:32px">🏠</div>
      <div style="font-family:'Tiro Devanagari Marathi',serif;font-weight:700;font-size:18px;margin-top:8px">घर व्यवस्थापन</div>
      <div class="text-sm text-muted mt-1">आवृत्ती 1.0.0 • महाराष्ट्रीयन कुटुंबासाठी बनवले</div>
      <div class="text-sm text-muted">❤️ मराठी कुटुंबाच्या प्रेमाने</div>
    </div>
  `;

  injectSettingsCSS();
}

// ── Profile Edit
function openEditProfileModal() {
  const user = currentUser;
  openModal(`
    <div class="modal-title">✏️ प्रोफाइल संपादन</div>
    <div class="form-group">
      <label>👤 नाव</label>
      <input type="text" id="editName" value="${user.name}" required/>
    </div>
    <div class="form-group">
      <label>📱 फोन</label>
      <input type="tel" id="editPhone" value="${user.phone || ''}"/>
    </div>
    <div class="form-group">
      <label>🖼️ प्रोफाइल फोटो</label>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <div id="editAvatarPreview" style="width:50px;height:50px;border-radius:50%;background:var(--border);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;border:2px solid var(--primary)">
          ${user.avatar && user.avatar.length > 2 ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover"/>` : (user.avatar || '👤')}
        </div>
        <input type="file" id="editAvatarFile" accept="image/*" style="font-size:12px" onchange="handleProfilePicChange(event)"/>
      </div>
      <input type="hidden" id="editAvatar" value="${user.avatar || '👤'}"/>
    </div>
    <div class="form-group">
      <label>😊 किंवा इमोजी निवडा</label>
      <div class="avatar-picker" id="avatarPicker">
        ${['👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👨‍🦱', '👩‍🦱', '🧒', '👶', '🧓'].map(a =>
    `<span class="avatar-opt ${a === (user.avatar || '👤') ? 'selected' : ''}" onclick="selectAvatar(this,'${a}')">${a}</span>`
  ).join('')}
      </div>
    </div>
    <div class="flex gap-2">
      <button class="btn btn-primary w-full" onclick="saveProfile()">💾 जतन करा</button>
      <button class="btn btn-secondary" onclick="closeModal()">रद्द करा</button>
    </div>
  `);
}

window.handleProfilePicChange = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const base64 = ev.target.result;
    document.getElementById('editAvatar').value = base64;
    document.getElementById('editAvatarPreview').innerHTML = `<img src="${base64}" style="width:100%;height:100%;object-fit:cover"/>`;
    document.querySelectorAll('.avatar-opt').forEach(opt => opt.classList.remove('selected'));
  };
  reader.readAsDataURL(file);
};

async function saveProfile() {
  const name = document.getElementById('editName').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const avatar = document.getElementById('editAvatar').value;

  const users = await DB.getUsers();
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], name, phone, avatar };
    await DB.saveUsers(users);

    // Also update this person in family members list
    const members = await DB.getMembers();
    const mIdx = members.findIndex(m => m.userId === currentUser.id);
    if (mIdx >= 0) {
        members[mIdx].name = name;
        members[mIdx].phone = phone;
        members[mIdx].avatar = avatar;
        await DB.saveMembers(members);
    }

    DB.setSession(users[idx]);
    currentUser = users[idx];
    updateUIForUser(currentUser);
  }

  closeModal();
  showToast('प्रोफाइल अपडेट झाले! ✅', 'success');
  await navigateTo('settings', null);
}

async function saveFamilySettings() {
  const settings = await DB.getSettings();
  settings.familyName = document.getElementById('familyNameInput').value.trim();
  await DB.saveSettings(settings);
  showToast('कुटुंब सेटिंग्ज जतन! ✅', 'success');
}

async function changePassword(e) {
  e.preventDefault();
  const oldPw = document.getElementById('oldPw').value;
  const newPw = document.getElementById('newPw').value;
  const users = await DB.getUsers();
  const idx = users.findIndex(u => u.id === currentUser.id);

  if (users[idx].password !== hashPassword(oldPw)) {
    showToast('जुना पासवर्ड चुकीचा आहे!', 'error');
    return;
  }

  users[idx].password = hashPassword(newPw);
  await DB.saveUsers(users);
  showToast('पासवर्ड बदलला! 🔒', 'success');
  e.target.reset();
}

async function exportData() {
  const data = {
    members: await DB.getMembers(),
    expenses: await DB.getExpenses(),
    tasks: await DB.getTasks(),
    meals: await DB.getMeals(),
    settings: await DB.getSettings(),
    exported: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'ghar-data.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('डेटा निर्यात झाला! 📤', 'success');
}

async function clearExpenses() {
  confirmAction('या महिन्याचे सर्व खर्च हटवायचे आहेत का? (हे पूर्ववत होणार नाही)', async () => {
    await DB.saveExpenses([]);
    showToast('सर्व खर्च हटवले! 🗑️', 'success');
    await renderSettings(document.getElementById('mainContent'));
  });
}

async function resetAllData() {
  confirmAction('⚠️ सर्व डेटा कायमचा मिटवायचा आहे का? हे पूर्ववत होणार नाही!', async () => {
    if (confirm('हे अपरिवर्तनीय आहे. खात्री आहे का?')) {
      await DB.saveMembers([]);
      await DB.saveExpenses([]);
      await DB.saveTasks([]);
      await DB.saveMeals({});
      await DB.saveMessages([]);
      await DB.savePhotos([]);
      await DB.saveLocations({});
      await DB.saveSettings({ familyName: 'आमचे कुटुंब' });
      
      showToast('सर्व डेटा मिटवला!', 'success');
      await navigateTo('dashboard', null);
    }
  });
}

function injectSettingsCSS() {
  if (document.getElementById('settings-css')) return;
  const s = document.createElement('style');
  s.id = 'settings-css';
  s.textContent = `
  .profile-card { display: flex; align-items: center; gap: 16px; }
  .profile-avatar-big {
    width: 72px; height: 72px; border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex; align-items: center; justify-content: center;
    font-size: 36px; border: 3px solid var(--accent-gold);
    flex-shrink: 0;
  }
  .profile-info { flex: 1; }
  .profile-name  { font-size: 18px; font-weight: 700; font-family:'Tiro Devanagari Marathi',serif; }
  .profile-email { font-size: 13px; color: var(--text-muted); margin: 3px 0; }
  .profile-phone { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
  .profile-role-badge { margin: 4px 0; }

  .settings-row { display: flex; align-items: center; justify-content: space-between; }

  /* Toggle Switch */
  .toggle-wrap { position: relative; flex-shrink: 0; }
  .toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }
  .toggle-label {
    display: block; width: 44px; height: 24px;
    background: var(--border); border-radius: 99px;
    cursor: pointer; transition: background var(--tr); position: relative;
  }
  .toggle-label::after {
    content: ''; position: absolute;
    top: 2px; left: 2px;
    width: 20px; height: 20px; border-radius: 50%;
    background: #fff; transition: left var(--tr);
    box-shadow: 0 1px 4px rgba(0,0,0,.25);
  }
  .toggle-input:checked + .toggle-label { background: var(--primary); }
  .toggle-input:checked + .toggle-label::after { left: 22px; }
  `;
  document.head.appendChild(s);
}
