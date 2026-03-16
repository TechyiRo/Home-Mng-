/* ══════════════════════════════════════════
   FAMILY.JS — Family Member Management
══════════════════════════════════════════ */

async function renderFamily(container) {
  const members = await DB.getMembers();

  container.className = 'page-content page-enter';
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>👨‍👩‍👧‍👦 कुटुंब व्यवस्थापन</h2>
        <p>तुमच्या कुटुंबातील सदस्यांचे व्यवस्थापन करा</p>
      </div>
      ${isAdmin() ? `<button class="btn btn-primary" onclick="openAddMemberModal()">➕ सदस्य जोडा</button>` : ''}
    </div>

    <!-- Member Cards -->
    <div id="memberGrid" class="grid-auto">
      ${members.length ? members.map(m => renderMemberCard(m)).join('') : `
        <div class="empty-state">
          <div class="empty-icon">👨‍👩‍👧‍👦</div>
          <div class="empty-title">कोणताही सदस्य नाही</div>
          <div class="empty-text">पहिला सदस्य जोडण्यासाठी वरील बटण दाबा</div>
        </div>
      `}
    </div>
  `;

}

function renderMemberCard(m) {
  const adminActions = isAdmin() ? `
    <div class="member-card-actions">
      <button class="btn btn-sm btn-secondary" onclick="openEditMemberModal('${m.id}')">✏️ संपादन</button>
      <button class="btn btn-sm btn-danger" onclick="deleteMember('${m.id}')">🗑️</button>
    </div>
  ` : '';

  return `
    <div class="member-card" id="mc-${m.id}">
      <div class="member-card-top">
        <div class="member-card-avatar">
          ${m.avatar && m.avatar.length > 2 ? `<img src="${m.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>` : (m.avatar || m.name.charAt(0))}
        </div>
        <div class="member-card-glow"></div>
      </div>
      <div class="member-card-body">
        <div class="member-card-name">${m.name}</div>
        <div class="member-card-role-badge">${m.familyRole}</div>
        ${m.phone ? `<div class="member-card-phone">📱 ${m.phone}</div>` : ''}
        ${m.userId ? `<span class="badge badge-success" style="margin-top:6px">🟢 ॲप वापरकर्ता</span>` : ''}
      </div>
      ${adminActions}
    </div>
  `;
}

// ── Add Member Modal
function openAddMemberModal() {
  openModal(`
    <div class="modal-title">➕ नवा सदस्य जोडा</div>
    <form onsubmit="saveMember(event, null)">
      <div class="form-row">
        <div class="form-group">
          <label>👤 पूर्ण नाव</label>
          <input type="text" id="mName" placeholder="सदस्याचे नाव" required/>
        </div>
        <div class="form-group">
          <label>🏠 कुटुंबातील भूमिका</label>
          <select id="mFamilyRole" required>
            <option value="">निवडा</option>
            <option value="वडील">वडील</option>
            <option value="आई">आई</option>
            <option value="मुलगा">मुलगा</option>
            <option value="मुलगी">मुलगी</option>
            <option value="आजोबा">आजोबा</option>
            <option value="आजी">आजी</option>
            <option value="काका">काका</option>
            <option value="काकू">काकू</option>
            <option value="बहीण">बहीण</option>
            <option value="भाऊ">भाऊ</option>
            <option value="इतर">इतर</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>😊 अवतार</label>
        <div class="avatar-picker" id="avatarPicker">
          ${['👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👨‍🦱', '👩‍🦱', '🧒', '👶', '🧓'].map(a =>
    `<span class="avatar-opt ${a === '👤' ? 'selected' : ''}" onclick="selectAvatar(this,'${a}')">${a}</span>`
  ).join('')}
        </div>
        <input type="hidden" id="mAvatar" value="👤"/>
      </div>
      <div class="form-group">
        <label>📱 फोन नंबर</label>
        <input type="tel" id="mPhone" placeholder="+91 XXXXXXXXXX"/>
      </div>
      <div class="form-row mt-3">
        <div class="form-group" style="grid-column: span 2">
          <label style="color:var(--primary)">🔐 ॲप लॉगिन माहिती (वैकल्पिक)</label>
          <p style="font-size:11px;color:var(--text-muted);margin-top:-4px;margin-bottom:8px">या माहितीचा वापर करून संबंधित सदस्य ऍपमध्ये लॉगिन करू शकतील व फॅमिली कट्टा वापरू शकतील.</p>
        </div>
        <div class="form-group">
          <label>📧 ईमेल</label>
          <input type="email" id="mEmail" placeholder="उदा. son@ghar.com"/>
        </div>
        <div class="form-group">
          <label>🔒 पासवर्ड</label>
          <input type="text" id="mPassword" placeholder="किमान ६ अक्षरे" minlength="6"/>
        </div>
      </div>
      <div class="flex gap-2 mt-2">
        <button type="submit" class="btn btn-primary w-full">💾 जतन करा</button>
        <button type="button" class="btn btn-secondary" onclick="closeModal()">रद्द करा</button>
      </div>
    </form>
  `);
}

// ── Edit Member Modal
async function openEditMemberModal(id) {
  const members = await DB.getMembers();
  const m = members.find(x => x.id === id);
  if (!m) return;

  const users = await DB.getUsers();
  const linkedUserEmail = m.userId ? (users.find(u => u.id === m.userId)?.email || '') : '';

  openModal(`
    <div class="modal-title">✏️ सदस्य संपादन</div>
    <form onsubmit="saveMember(event, '${id}')">
      <div class="form-row">
        <div class="form-group">
          <label>👤 पूर्ण नाव</label>
          <input type="text" id="mName" value="${m.name}" required/>
        </div>
        <div class="form-group">
          <label>🏠 कुटुंबातील भूमिका</label>
          <select id="mFamilyRole" required>
            ${['वडील', 'आई', 'मुलगा', 'मुलगी', 'आजोबा', 'आजी', 'काका', 'काकू', 'बहीण', 'भाऊ', 'इतर'].map(r =>
    `<option value="${r}" ${m.familyRole === r ? 'selected' : ''}>${r}</option>`
  ).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>😊 अवतार</label>
        <div class="avatar-picker" id="avatarPicker">
          ${['👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👨‍🦱', '👩‍🦱', '🧒', '👶', '🧓'].map(a =>
    `<span class="avatar-opt ${a === m.avatar ? 'selected' : ''}" onclick="selectAvatar(this,'${a}')">${a}</span>`
  ).join('')}
        </div>
        <input type="hidden" id="mAvatar" value="${m.avatar || '👤'}"/>
      </div>
      <div class="form-group">
        <label>📱 फोन</label>
        <input type="tel" id="mPhone" value="${m.phone || ''}"/>
      </div>
      <div class="form-row mt-3">
        <div class="form-group" style="grid-column: span 2">
          <label style="color:var(--primary)">🔐 ॲप लॉगिन माहिती (वैकल्पिक)</label>
          <p style="font-size:11px;color:var(--text-muted);margin-top:-4px;margin-bottom:8px">या माहितीचा वापर करून संबंधित सदस्य ऍपमध्ये लॉगिन करू शकतील व फॅमिली कट्टा वापरू शकतील.</p>
        </div>
        <div class="form-group">
          <label>📧 ईमेल</label>
          <input type="email" id="mEmail" value="${linkedUserEmail}" placeholder="उदा. son@ghar.com"/>
        </div>
        <div class="form-group">
          <label>🔒 नवीन पासवर्ड</label>
          <input type="text" id="mPassword" placeholder="${m.userId ? 'बदलायचा असेल तरच टाका' : 'किमान ६ अक्षरे'}" minlength="6"/>
        </div>
      </div>
      <div class="flex gap-2 mt-2">
        <button type="submit" class="btn btn-primary w-full">💾 जतन करा</button>
        <button type="button" class="btn btn-secondary" onclick="closeModal()">रद्द करा</button>
      </div>
    </form>
  `);
}

function selectAvatar(el, avatar) {
  document.querySelectorAll('.avatar-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('mAvatar').value = avatar;
}

async function saveMember(e, editId) {
  e.preventDefault();
  const name = document.getElementById('mName').value.trim();
  const familyRole = document.getElementById('mFamilyRole').value;
  const avatar = document.getElementById('mAvatar').value;
  const phone = document.getElementById('mPhone').value.trim();
  const emailEl = document.getElementById('mEmail');
  const passEl = document.getElementById('mPassword');

  const members = await DB.getMembers();
  let users = await DB.getUsers();

  if (editId) {
    const idx = members.findIndex(m => m.id === editId);
    if (idx >= 0) {
      const mem = members[idx];
      mem.name = name;
      mem.familyRole = familyRole;
      mem.avatar = avatar;
      mem.phone = phone;

      // Handle auth user edit
      if (emailEl && emailEl.value.trim()) {
        const email = emailEl.value.trim().toLowerCase();
        const password = passEl ? passEl.value : '';

        let linkedUser = mem.userId ? users.find(u => u.id === mem.userId) : null;

        // Ensure email isn't taken by someone else
        const existingWithEmail = users.find(u => u.email === email);
        if (existingWithEmail && existingWithEmail.id !== (linkedUser ? linkedUser.id : null)) {
          showToast('हा ईमेल आधीच दुसऱ्या सदस्याने वापरला आहे!', 'error');
          return;
        }

        if (linkedUser) {
          // Update existing user
          linkedUser.name = name;
          linkedUser.email = email;
          linkedUser.phone = phone;
          linkedUser.familyRole = familyRole;
          linkedUser.avatar = avatar;
          if (password) {
            linkedUser.password = hashPassword(password);
          }
        } else {
          // Promote existing member to user
          if (!password) {
            showToast('लॉगिन बनवण्यासाठी पासवर्ड देणे आवश्यक आहे!', 'error');
            return;
          }
          const newUserId = genId();
          mem.userId = newUserId;
          users.push({
            id: newUserId,
            name,
            email,
            phone,
            role: 'member',
            familyRole,
            avatar,
            password: hashPassword(password),
            createdAt: new Date().toISOString()
          });
        }
      }
      members[idx] = mem;
    }


    await DB.saveUsers(users);
  } else {
    // Only in Add mode
    let userId = null;
    if (emailEl && passEl && emailEl.value.trim() && passEl.value) {
      const email = emailEl.value.trim().toLowerCase();
      const password = passEl.value;

      if (users.find(u => u.email === email)) {
        showToast('हा ईमेल आधीच वापरला आहे!', 'error');
        return;
      }

      userId = genId();
      users.push({
        id: userId,
        name,
        email,
        phone,
        role: 'member',
        familyRole,
        avatar,
        password: hashPassword(password),
        createdAt: new Date().toISOString()
      });
      await DB.saveUsers(users);
    }
    members.push({ id: genId(), name, familyRole, avatar, phone, userId });
  }

  await DB.saveMembers(members);
  closeModal();
  showToast(editId ? 'सदस्य अपडेट झाला!' : 'सदस्य जोडला!', 'success');
  navigateTo('family', null);
}


async function deleteMember(id) {
  confirmAction('हा सदस्य हटवायचा आहे का?', async () => {
    const members = (await DB.getMembers()).filter(m => m.id !== id);
    await DB.saveMembers(members);
    document.getElementById(`mc-${id}`)?.remove();
    showToast('सदस्य हटवला!', 'success');
  });
}

// CSS is in static css/pages.css
