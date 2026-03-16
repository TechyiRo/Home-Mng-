/* ══════════════════════════════════════════
   LOCATION.JS — Family Location Tracking
   (Simulated GPS demo – no real tracking)
══════════════════════════════════════════ */

async function renderLocation(container) {
  container.className = 'page-content page-enter';
  const members = await DB.getMembers();
  const locations = await DB.getLocations();

  // Simulate positions for demo (Pune, Maharashtra based)
  const demoCoords = [
    { lat: 18.5204, lng: 73.8567, area: 'शिवाजीनगर, पुणे' },
    { lat: 18.5314, lng: 73.8446, area: 'कोथरूड, पुणे' },
    { lat: 18.4928, lng: 73.8145, area: 'हिंजवडी, पुणे' },
    { lat: 18.5596, lng: 73.9089, area: 'विमाननगर, पुणे' },
    { lat: 18.5089, lng: 73.8257, area: 'घर (मुख्य)' },
  ];

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h2>📍 स्थान ट्रॅकिंग</h2>
        <p>कुटुंब सदस्यांचे सुरक्षित स्थान पहा</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary" onclick="shareMyLocation()">📡 स्थान शेअर करा</button>
        <button class="btn btn-secondary" onclick="requestSafetyCheck()">🔔 सुरक्षा तपास</button>
      </div>
    </div>

    <!-- Safety Alert Banner -->
    <div class="safety-banner card mb-4">
      <div class="safety-banner-icon">🛡️</div>
      <div>
        <div style="font-weight:700;font-size:15px">सर्व कुटुंब सदस्य सुरक्षित आहेत</div>
        <div class="text-sm text-muted">शेवटचे अपडेट: ${new Date().toLocaleTimeString('mr-IN')}</div>
      </div>
      <div class="safety-status safe">✅ सुरक्षित</div>
    </div>

    <div class="grid-2 mb-4" style="grid-template-columns:1.5fr 1fr">
      <!-- Map Placeholder -->
      <div class="card location-map-card">
        <div class="card-header">
          <div class="card-title">🗺️ नकाशा दृश्य</div>
          <span class="badge badge-success">🟢 थेट</span>
        </div>
        <div class="map-container" id="mapContainer">
          <div class="map-placeholder">
            <div class="map-grid"></div>
            ${members.slice(0, 5).map((m, i) => {
    const coord = demoCoords[i] || demoCoords[0];
    const pct = { top: (20 + i * 15) + '%', left: (15 + i * 16) + '%' };
    return `
                <div class="map-pin" style="top:${pct.top};left:${pct.left}" title="${m.name}">
                  <div class="pin-avatar">
                    ${m.avatar && m.avatar.length > 2 ? `<img src="${m.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>` : (m.avatar || m.name.charAt(0))}
                  </div>
                  <div class="pin-label">${m.name.split(' ')[0]}</div>
                  <div class="pin-dot"></div>
                </div>
              `;
  }).join('')}
            <div class="map-home" style="top:55%;left:40%">
              <div class="home-icon">🏠</div>
              <div class="pin-label">घर</div>
            </div>
            <div class="map-overlay-text">📍 पुणे, महाराष्ट्र क्षेत्र</div>
          </div>
        </div>
        <div class="map-actions mt-2">
          <button class="btn btn-sm btn-secondary" onclick="showToast('नकाशा रिफ्रेश!','success')">🔄 रिफ्रेश</button>
          <button class="btn btn-sm btn-secondary" onclick="showToast('पूर्ण नकाशा उघडत आहे...','default')">🗺️ पूर्ण पहा</button>
        </div>
      </div>

      <!-- Member List with status -->
      <div class="card">
        <div class="card-title mb-3">👨‍👩‍👧‍👦 सदस्य स्थान</div>
        <div class="location-member-list">
          ${members.slice(0, 5).map((m, i) => {
    const coord = demoCoords[i] || demoCoords[4];
    const status = i === 0 ? 'घरी' : i < 3 ? 'बाहेर' : 'घरी';
    const badge = status === 'घरी' ? 'badge-success' : 'badge-warning';
    const dist = i === 0 ? '0 किमी' : `${(Math.random() * 5 + 0.5).toFixed(1)} किमी`;
    return `
              <div class="location-member-card">
                <div class="loc-member-avatar">
                  ${m.avatar && m.avatar.length > 2 ? `<img src="${m.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>` : (m.avatar || m.name.charAt(0))}
                </div>
                <div class="loc-member-info">
                  <div class="font-bold" style="font-size:14px">${m.name}</div>
                  <div class="text-sm text-muted">📍 ${coord.area}</div>
                  <div class="text-sm text-muted">🕐 ${new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div style="text-align:right">
                  <span class="badge ${badge}">${status}</span>
                  <div class="text-sm text-muted mt-1">🏠 ${dist}</div>
                </div>
              </div>
            `;
  }).join('')}
        </div>
      </div>
    </div>

    <!-- Safety Features -->
    <div class="grid-3">
      <div class="card safety-feature-card">
        <div class="safety-feature-icon">🚨</div>
        <div class="safety-feature-title">SOS अलर्ट</div>
        <div class="text-sm text-muted mb-3">आपत्कालीन परिस्थितीत कुटुंबाला सूचित करा</div>
        <button class="btn btn-danger btn-sm w-full" onclick="triggerSOS()">🚨 SOS पाठवा</button>
      </div>

      <div class="card safety-feature-card">
        <div class="safety-feature-icon">🏠</div>
        <div class="safety-feature-title">सुरक्षित क्षेत्र</div>
        <div class="text-sm text-muted mb-3">घर क्षेत्र सेट करा, सूचना मिळवा</div>
        <button class="btn btn-primary btn-sm w-full" onclick="showToast('सुरक्षित क्षेत्र सेट आहे!','success')">✅ क्षेत्र सेट करा</button>
      </div>

      <div class="card safety-feature-card">
        <div class="safety-feature-icon">📊</div>
        <div class="safety-feature-title">स्थान इतिहास</div>
        <div class="text-sm text-muted mb-3">मागील 7 दिवसांचा स्थान इतिहास</div>
        <button class="btn btn-secondary btn-sm w-full" onclick="showLocationHistory()">📋 इतिहास पहा</button>
      </div>
    </div>
  `;

  injectLocationCSS();
}

async function shareMyLocation() {
  if (!navigator.geolocation) { showToast('GPS उपलब्ध नाही', 'error'); return; }
  showToast('स्थान मिळवत आहे...', 'default');
  navigator.geolocation.getCurrentPosition(async pos => {
    const locs = await DB.getLocations();
    locs[currentUser.id] = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      time: new Date().toISOString(),
      area: 'GPS स्थान',
    };
    await DB.saveLocations(locs);
    showToast('तुमचे स्थान शेअर झाले! 📍', 'success');
  }, () => showToast('स्थान मिळविण्यात अयशस्वी', 'error'));
}

async function requestSafetyCheck() {
  const members = await DB.getMembers();
  openModal(`
    <div class="modal-title">🔔 सुरक्षा तपास</div>
    <p style="font-size:14px;margin-bottom:16px">खालील सदस्यांना सुरक्षा तपास सूचना पाठवा:</p>
    ${members.map(m => `
      <div class="flex items-center gap-2 mb-2">
        <input type="checkbox" id="sc-${m.id}" checked/>
        <label for="sc-${m.id}" style="font-size:14px">${m.avatar} ${m.name}</label>
      </div>
    `).join('')}
    <button class="btn btn-primary w-full mt-3" onclick="sendSafetyCheck()">📤 सूचना पाठवा</button>
  `);
}

function sendSafetyCheck() {
  closeModal();
  showToast('सुरक्षा तपास सूचना पाठवली! ✅', 'success');
}

function triggerSOS() {
  if (confirm('⚠️ SOS अलर्ट पाठवायचा आहे का? हे सर्व कुटुंब सदस्यांना सूचित करेल.')) {
    showToast('🚨 SOS अलर्ट पाठवला! कुटुंबाला सूचित केले.', 'error', 5000);
  }
}

function showLocationHistory() {
  openModal(`
    <div class="modal-title">📊 स्थान इतिहास</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${Array.from({ length: 5 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return `
          <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg);border-radius:8px">
            <div style="font-size:20px">📍</div>
            <div>
              <div style="font-weight:600;font-size:13px">${d.toLocaleDateString('mr-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
              <div class="text-sm text-muted">शिवाजीनगर → कोथरूड → घर</div>
            </div>
            <div class="text-sm text-muted ml-auto">${(Math.random() * 15 + 2).toFixed(1)} किमी</div>
          </div>
        `;
  }).join('')}
    </div>
  `);
}

function injectLocationCSS() {
  if (document.getElementById('location-css')) return;
  const s = document.createElement('style');
  s.id = 'location-css';
  s.textContent = `
  .safety-banner {
    display: flex; align-items: center; gap: 16px;
    padding: 16px 20px;
    background: linear-gradient(135deg, rgba(46,125,50,.1), rgba(46,125,50,.05));
    border-color: rgba(46,125,50,.3);
  }
  .safety-banner-icon { font-size: 36px; }
  .safety-status { margin-left: auto; font-weight: 700; font-size: 14px; color: #2E7D32; }
  .safety-status.alert { color: #DC2626; }

  .location-map-card .card-header { padding-bottom: 12px; border-bottom: 1px solid var(--border); margin-bottom: 12px; }

  .map-container { height: 280px; border-radius: var(--radius-sm); overflow: hidden; position: relative; }

  .map-placeholder {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #E8F5E9, #C8E6C9, #A5D6A7);
    position: relative; overflow: hidden;
  }

  .map-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* Road lines */
  .map-placeholder::before {
    content: '';
    position: absolute;
    top: 45%; left: 0; right: 0; height: 8px;
    background: rgba(255,255,255,.7);
    border-radius: 4px;
  }
  .map-placeholder::after {
    content: '';
    position: absolute;
    top: 0; bottom: 0; left: 35%; width: 8px;
    background: rgba(255,255,255,.7);
    border-radius: 4px;
  }

  .map-pin {
    position: absolute;
    display: flex; flex-direction: column; align-items: center;
    cursor: pointer;
    animation: pin-bounce 2s ease-in-out infinite;
    z-index: 10;
  }

  @keyframes pin-bounce {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-6px); }
  }

  .pin-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #fff; border: 3px solid var(--primary);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: var(--shadow-md);
  }

  .pin-label {
    background: rgba(0,0,0,.7); color: #fff;
    font-size: 9px; padding: 2px 6px; border-radius: 4px; margin-top: 2px;
    white-space: nowrap; font-family:'Poppins',sans-serif;
  }

  .pin-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--primary); margin-top: 2px;
    box-shadow: 0 0 0 4px rgba(212,82,10,.3);
    animation: ripple 2s ease-in-out infinite;
  }

  @keyframes ripple {
    0% { box-shadow: 0 0 0 0 rgba(212,82,10,.5); }
    100% { box-shadow: 0 0 0 12px rgba(212,82,10,0); }
  }

  .map-home { position: absolute; display: flex; flex-direction: column; align-items: center; z-index: 10; }
  .home-icon { font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,.3)); }

  .map-overlay-text {
    position: absolute; bottom: 8px; right: 8px;
    background: rgba(0,0,0,.6); color: #fff;
    font-size: 10px; padding: 3px 8px; border-radius: 4px;
    font-family:'Poppins',sans-serif;
  }

  .map-actions { display: flex; gap: 8px; }

  .location-member-list { display: flex; flex-direction: column; gap: 10px; }
  .location-member-card {
    display: flex; align-items: center; gap: 10px;
    padding: 10px; background: var(--bg); border-radius: var(--radius-sm);
    transition: background var(--tr);
  }
  .location-member-card:hover { background: var(--border); }
  .loc-member-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg,var(--primary),var(--secondary));
    display: flex;align-items:center;justify-content:center; font-size: 22px;
    flex-shrink: 0;
  }
  .loc-member-info { flex: 1; min-width: 0; }

  .safety-feature-card { text-align: center; }
  .safety-feature-icon { font-size: 40px; margin-bottom: 8px; }
  .safety-feature-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; font-family:'Tiro Devanagari Marathi',serif; }
  `;
  document.head.appendChild(s);
}
