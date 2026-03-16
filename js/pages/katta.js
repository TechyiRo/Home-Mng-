/* ══════════════════════════════════════════
   KATTA.JS — Family Katta (Chat + Photos)
══════════════════════════════════════════ */

const EMOJIS = ['❤️', '😂', '🙏', '😮', '😢', '🎉', '👍', '🔥', '😍', '😂'];
let kattaTab = 'chat';

async function renderKatta(container) {
  container.className = 'page-content page-enter';
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>💬 फॅमिली कट्टा</h2>
        <p>कुटुंबाचे डिजिटल मिलन स्थान</p>
      </div>
      <div class="katta-tabs">
        <button class="katta-tab ${kattaTab === 'chat' ? 'active' : ''}" onclick="switchKattaTab('chat')">💬 चॅट</button>
        <button class="katta-tab ${kattaTab === 'photos' ? 'active' : ''}" onclick="switchKattaTab('photos')">📷 फोटो</button>
      </div>
    </div>
    <div id="kattaBody"></div>
  `;

  injectKattaCSS();
  await renderKattaView();
}

async function switchKattaTab(tab) {
  kattaTab = tab;
  document.querySelectorAll('.katta-tab').forEach(b => b.classList.toggle('active', b.textContent.includes(tab === 'chat' ? 'चॅट' : 'फोटो')));
  await renderKattaView();
}

async function renderKattaView() {
  const body = document.getElementById('kattaBody');
  if (kattaTab === 'chat') await renderChat(body);
  else await renderPhotos(body);
}

// ══════════════════════════════════════════
// CHAT
// ══════════════════════════════════════════
async function renderChat(body) {
  const messages = await DB.getMessages();
  const members = await DB.getMembers();

  body.innerHTML = `
    <div class="chat-container card">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-header-icon">🏠</div>
          <div>
            <div class="chat-header-title">आमचे कुटुंब</div>
            <div class="chat-header-sub">${members.length} सदस्य • ${messages.length} संदेश</div>
          </div>
        </div>
        <div class="online-indicators">
          ${members.slice(0, 4).map(m => `
            <span class="online-dot" title="${m.name}">
              ${m.avatar && m.avatar.length > 2 ? `<img src="${m.avatar}" style="width:20px;height:20px;border-radius:50%;object-fit:cover"/>` : (m.avatar || '👤')}
            </span>
          `).join('')}
        </div>
      </div>

      <div class="chat-messages" id="chatMessages">
        ${messages.map(m => renderMessage(m)).join('')}
      </div>

      <div class="chat-input-bar">
        <div class="chat-emoji-btn" onclick="toggleEmojiPicker()">😊</div>
        <input
          type="text"
          id="chatInput"
          class="chat-input"
          placeholder="संदेश टाका..."
          onkeydown="if(event.key==='Enter')sendMessage()"
        />
        <button class="chat-send" onclick="sendMessage()">📤</button>
      </div>

      <div class="emoji-picker hidden" id="emojiPicker">
        ${EMOJIS.map(e => `<span class="emoji-pick" onclick="insertEmoji('${e}')">${e}</span>`).join('')}
      </div>
    </div>
  `;

  scrollChatBottom();
}

function renderMessage(m) {
  const isMe = m.userId === currentUser.id;
  const time = new Date(m.time).toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' });
  const reacts = m.reactions || [];

  return `
    <div class="msg-wrap ${isMe ? 'me' : 'other'}">
      ${!isMe ? `
        <div class="msg-avatar">
          ${m.avatar && m.avatar.length > 2 ? `<img src="${m.avatar}" style="width:24px;height:24px;border-radius:50%;object-fit:cover"/>` : (m.avatar || '👤')}
        </div>
      ` : ''}
      <div class="msg-bubble ${isMe ? 'me' : 'other'}">
        ${!isMe ? `<div class="msg-name">${m.userName}</div>` : ''}
        ${m.image ? `<img src="${m.image}" class="msg-image" alt="photo" onclick="viewImage('${m.image}')"/>` : ''}
        ${m.text ? `<div class="msg-text">${m.text}</div>` : ''}
        <div class="msg-meta">
          <span class="msg-time">${time}</span>
          ${isMe ? '<span class="msg-read">✓✓</span>' : ''}
        </div>
        ${reacts.length ? `<div class="msg-reactions">${[...new Set(reacts)].map(r => `<span class="react-chip">${r} ${reacts.filter(x => x === r).length}</span>`).join('')}</div>` : ''}
        <div class="msg-react-btn" onclick="showReactMenu('${m.id}')">+😊</div>
        ${isMe || isAdmin() ? `<div class="msg-delete-btn" onclick="deleteMessage('${m.id}')">🗑️</div>` : ''}
      </div>
    </div>
  `;
}

async function deleteMessage(id) {
  confirmAction('हा मेसेज कायमचा हटवायचा आहे का?', async () => {
    const msgs = await DB.getMessages();
    const filtered = msgs.filter(m => m.id !== id);
    await DB.saveMessages(filtered);
    showToast('मेसेज हटवला!', 'success');
    await renderKattaView();
  });
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const msgs = await DB.getMessages();
  msgs.push({
    id: genId(),
    userId: currentUser.id,
    userName: currentUser.name,
    avatar: currentUser.avatar || currentUser.name.charAt(0),
    text,
    time: new Date().toISOString(),
    reactions: [],
  });
  await DB.saveMessages(msgs);
  input.value = '';
  await renderKattaView();
}

function toggleEmojiPicker() {
  document.getElementById('emojiPicker').classList.toggle('hidden');
}

function insertEmoji(e) {
  const input = document.getElementById('chatInput');
  input.value += e;
  input.focus();
  document.getElementById('emojiPicker').classList.add('hidden');
}

function showReactMenu(msgId) {
  openModal(`
    <div class="modal-title" style="font-size:15px">प्रतिक्रिया निवडा</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin:12px 0">
      ${EMOJIS.map(e => `<button style="font-size:30px;background:none;border:none;cursor:pointer;transition:transform .2s" onmouseover="this.style.transform='scale(1.4)'" onmouseout="this.style.transform=''" onclick="addReaction('${msgId}','${e}')">${e}</button>`).join('')}
    </div>
  `, 380);
}

async function addReaction(msgId, emoji) {
  const msgs = await DB.getMessages();
  const msg = msgs.find(m => m.id === msgId);
  if (msg) {
    if (!msg.reactions) msg.reactions = [];
    msg.reactions.push(emoji);
  }
  await DB.saveMessages(msgs);
  closeModal();
  await renderKattaView();
}

function scrollChatBottom() {
  setTimeout(() => {
    const container = document.getElementById('chatMessages');
    if (container) container.scrollTop = container.scrollHeight;
  }, 50);
}

// ══════════════════════════════════════════
// PHOTOS
// ══════════════════════════════════════════
async function renderPhotos(body) {
  const photos = await DB.getPhotos();

  body.innerHTML = `
    <div class="photos-container">
      <div class="card mb-4">
        <div class="card-header">
          <div class="card-title">📷 फोटो गॅलरी</div>
          <button class="btn btn-primary btn-sm" onclick="uploadPhoto()">📤 फोटो अपलोड करा</button>
        </div>
        <input type="file" id="photoFileInput" accept="image/*" class="hidden" onchange="handlePhotoUpload(event)"/>
        ${photos.length ? `
          <div class="photo-gallery" id="photoGallery">
            ${photos.map(p => renderPhotoCard(p)).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-icon">📷</div>
            <div class="empty-title">कोणतेही फोटो नाहीत</div>
            <div class="empty-text">कुटुंबाच्या आठवणी शेअर करा</div>
            <button class="btn btn-primary mt-2" onclick="uploadPhoto()">📤 पहिला फोटो अपलोड करा</button>
          </div>
        `}
      </div>
    </div>
  `;
}

function renderPhotoCard(p) {
  return `
    <div class="photo-card" onclick="viewPhoto('${p.id}')">
      <img src="${p.url}" alt="${p.caption}" class="photo-thumb"/>
      <div class="photo-caption">${p.caption || ''}</div>
      <div class="photo-meta">
        <span>${p.uploadedBy}</span>
        <span>${formatDate(p.date)}</span>
      </div>
    </div>
  `;
}

function uploadPhoto() {
  document.getElementById('photoFileInput').click();
}

function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    openModal(`
      <div class="modal-title">📷 फोटो अपलोड</div>
      <img src="${ev.target.result}" style="width:100%;border-radius:8px;margin-bottom:12px;max-height:250px;object-fit:cover"/>
      <div class="form-group">
        <label>📝 मथळा / Caption</label>
        <input type="text" id="photoCaption" placeholder="या फोटोबद्दल लिहा..."/>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary w-full" onclick="savePhoto('${ev.target.result}')">💾 जतन करा</button>
        <button class="btn btn-secondary" onclick="closeModal()">रद्द करा</button>
      </div>
    `, 480);
  };
  reader.readAsDataURL(file);
}

async function savePhoto(dataUrl) {
  const caption = document.getElementById('photoCaption').value.trim();
  const photos = await DB.getPhotos();
  photos.unshift({
    id: genId(),
    url: dataUrl,
    caption,
    uploadedBy: currentUser.name,
    date: todayStr(),
    likes: [],
    comments: [],
  });
  await DB.savePhotos(photos);
  closeModal();
  showToast('फोटो अपलोड झाला! 📷', 'success');
  await renderKattaView();
}

async function viewPhoto(id) {
  const photos = await DB.getPhotos();
  const p = photos.find(x => x.id === id);
  if (!p) return;
  openModal(`
    <img src="${p.url}" style="width:100%;border-radius:8px;margin-bottom:12px;max-height:60vh;object-fit:contain"/>
    <div style="font-weight:700;font-size:15px;margin-bottom:4px">${p.caption || 'कुटुंब फोटो'}</div>
    <div class="text-sm text-muted">📸 ${p.uploadedBy} • ${formatDate(p.date)}</div>
    ${isAdmin() ? `<button class="btn btn-danger btn-sm mt-3" onclick="deletePhoto('${id}')">🗑️ हटवा</button>` : ''}
  `, 560);
}

async function deletePhoto(id) {
  confirmAction('हा फोटो हटवायचा आहे का?', async () => {
    const photos = await DB.getPhotos();
    await DB.savePhotos(photos.filter(p => p.id !== id));
    closeModal();
    showToast('फोटो हटवला!', 'success');
    await renderKattaView();
  });
}

function viewImage(url) {
  openModal(`<img src="${url}" style="width:100%;border-radius:8px;max-height:70vh;object-fit:contain"/>`, 560);
}

function injectKattaCSS() {
  if (document.getElementById('katta-css')) return;
  const s = document.createElement('style');
  s.id = 'katta-css';
  s.textContent = `
  .katta-tabs { display: flex; gap: 8px; }
  .katta-tab {
    padding: 8px 16px; border: none; border-radius: 99px;
    font-family:'Poppins',sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all var(--tr);
    background: var(--bg); color: var(--text-muted); border: 1.5px solid var(--border);
  }
  .katta-tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }

  .chat-container { padding: 0; overflow: hidden; display: flex; flex-direction: column; height: 70vh; }

  .chat-header {
    padding: 14px 18px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .chat-header-info { display: flex; align-items: center; gap: 10px; }
  .chat-header-icon { font-size: 28px; }
  .chat-header-title { font-size: 15px; font-weight: 700; color: #fff; font-family:'Tiro Devanagari Marathi',serif; }
  .chat-header-sub   { font-size: 11px; color: rgba(255,255,255,.7); }
  .online-indicators { display: flex; gap: 4px; }
  .online-dot { font-size: 20px; position: relative; }
  .online-dot::after {
    content: ''; position: absolute; bottom: 0; right: 0;
    width: 8px; height: 8px; border-radius: 50%;
    background: #4CAF50; border: 2px solid white;
  }

  .chat-messages {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 12px;
    background: var(--bg);
    scroll-behavior: smooth;
  }

  /* Chat bg pattern */
  .chat-messages {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4520a' fill-opacity='0.03'%3E%3Cpath d='M30 30m-28 0a28 28 0 1 0 56 0a28 28 0 1 0-56 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  .msg-wrap { display: flex; align-items: flex-end; gap: 8px; }
  .msg-wrap.me { flex-direction: row-reverse; }

  .msg-avatar { font-size: 24px; flex-shrink: 0; }

  .msg-bubble {
    max-width: 70%; border-radius: 16px; padding: 10px 14px;
    position: relative;
  }
  .msg-bubble.other { background: var(--bg-card); box-shadow: var(--shadow-sm); border-radius: 4px 16px 16px 16px; }
  .msg-bubble.me    { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; border-radius: 16px 4px 16px 16px; }

  .msg-name { font-size: 11px; font-weight: 700; color: var(--primary); margin-bottom: 4px; }
  .msg-bubble.me .msg-name { color: rgba(255,255,255,.8); }

  .msg-text { font-size: 14px; line-height: 1.4; font-family:'Tiro Devanagari Marathi',serif; white-space: pre-wrap; }
  .msg-image { width: 200px; border-radius: 8px; cursor: pointer; display: block; }

  .msg-meta { display: flex; align-items: center; gap: 4px; margin-top: 4px; justify-content: flex-end; }
  .msg-time { font-size: 10px; opacity: 0.6; }
  .msg-read { font-size: 10px; opacity: 0.7; }

  .msg-reactions { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
  .react-chip { background: rgba(255,255,255,.2); padding: 2px 7px; border-radius: 99px; font-size: 12px; backdrop-filter: blur(4px); }
  .msg-bubble.other .react-chip { background: var(--bg); }

  .msg-react-btn {
    font-size: 11px; cursor: pointer; opacity: 0;
    transition: opacity 0.2s; padding: 2px 6px;
    display: inline-block;
  }
  .msg-delete-btn {
    font-size: 11px; cursor: pointer; opacity: 0;
    transition: opacity 0.2s; padding: 2px 6px;
    display: inline-block;
    filter: grayscale(1);
  }
  .msg-bubble:hover .msg-react-btn,
  .msg-bubble:hover .msg-delete-btn { opacity: 0.7; }
  .msg-delete-btn:hover { filter: grayscale(0); }

  .chat-input-bar {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 14px;
    border-top: 1px solid var(--border);
    background: var(--bg-card);
    flex-shrink: 0;
  }

  .chat-emoji-btn { font-size: 24px; cursor: pointer; flex-shrink: 0; transition: transform 0.2s; }
  .chat-emoji-btn:hover { transform: scale(1.2); }

  .chat-input {
    flex: 1; padding: 10px 14px;
    border: 1.5px solid var(--border); border-radius: 99px;
    font-family: 'Poppins', sans-serif; font-size: 14px;
    color: var(--text-primary); background: var(--bg);
    outline: none; transition: border-color var(--tr);
  }
  .chat-input:focus { border-color: var(--primary); }

  .chat-send {
    width: 42px; height: 42px; border: none; border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: #fff; cursor: pointer; font-size: 18px;
    display: flex; align-items: center; justify-content: center;
    transition: all var(--tr); flex-shrink: 0;
  }
  .chat-send:hover { transform: scale(1.1); box-shadow: var(--shadow-sm); }

  .emoji-picker {
    padding: 8px 14px;
    border-top: 1px solid var(--border);
    background: var(--bg-card);
    display: flex; gap: 8px; flex-wrap: wrap;
    flex-shrink: 0;
  }
  .emoji-pick { font-size: 22px; cursor: pointer; transition: transform 0.2s; }
  .emoji-pick:hover { transform: scale(1.3); }

  /* Photos */
  .photo-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-top: 8px; }
  .photo-card { border-radius: var(--radius-sm); overflow: hidden; cursor: pointer; border: 1px solid var(--border); transition: all var(--tr); }
  .photo-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
  .photo-thumb { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
  .photo-caption { padding: 8px 10px; font-size: 12.5px; font-weight: 600; color: var(--text-primary); font-family:'Tiro Devanagari Marathi',serif; }
  .photo-meta { display: flex; justify-content: space-between; padding: 0 10px 8px; font-size: 10.5px; color: var(--text-muted); }
  `;
  document.head.appendChild(s);
}
