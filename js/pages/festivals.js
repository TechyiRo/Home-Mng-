/* ══════════════════════════════════════════
   FESTIVALS.JS — Maharashtrian Festivals
   Reference: Kalnirnay 2026-2027
══════════════════════════════════════════ */

// 2026-2027 Festivals (As per Kalnirnay reference)
const MAHARASHTRIAN_FESTIVALS = [
  { name: 'गुढी पाडवा', emoji: '🎋', month: 3, day: 19, desc: 'मराठी नवे वर्ष — नवीन सुरुवातीचा सण (शालिवाहन शके १९४८)', color: '#D4520A', tips: ['गुढी उभी करा आणि कडुलिंबाची पाने खा', 'पुरण पोळी आणि श्रीखंडाचा नैवेद्य बनवा', 'दारासमोर सुंदर रांगोळी काढा'] },
  { name: 'महावीर जयंती', emoji: '🕉️', month: 3, day: 31, desc: 'जैन धर्माचे २४वे तीर्थंकार महावीर यांचा जन्मदिन', color: '#D4A017', tips: ['भगवान महावीरांची पूजा', 'अहिंसेचे पालन करा'] },
  { name: 'हनुमान जयंती', emoji: '🐒', month: 4, day: 1, desc: 'बजरंगबली हनुमान जन्मदिन', color: '#FF5722', tips: ['हनुमान चालिसा पठन', 'रुईच्या पानांची माळ'] },
  { name: 'अक्षय तृतीया', emoji: '💛', month: 4, day: 20, desc: 'खरेदीसाठी शुभ मुहूर्त — दानधर्माचा दिवस', color: '#D4A017', tips: ['सोने किंवा भांडी खरेदी करा', 'पाण्याचे दान करा', 'आंब्याचा रस आणि पुरीचा बेत'] },
  { name: 'महाराष्ट्र दिन', emoji: '🚩', month: 5, day: 1, desc: 'महाराष्ट्र राज्य स्थापना दिवस', color: '#FF9800', tips: ['ध्वजवंदन', 'महाराष्ट्रीयन संस्कृतीचा अभिमान'] },
  { name: 'वटपौर्णिमा', emoji: '🌿', month: 5, day: 31, desc: 'वडाच्या झाडाची पूजा (सत्यवान-सावित्री कथा)', color: '#2E7D32', tips: ['वडाच्या झाडाला दोरा गुंडाळा', 'पतीच्या उत्तम आरोग्यासाठी प्रार्थना'] },
  { name: 'आषाढी एकादशी', emoji: '🛕', month: 6, day: 26, desc: 'देवशयनी एकादशी — पंढरपूर वारीचा मुख्य दिवस', color: '#8B1A1A', tips: ['उपवास करा', 'विठ्ठलाचे भजन', 'राजगिरा किंवा साबुदाणा खिचडी'] },
  { name: 'बेंदूर (पोळा)', emoji: '🐂', month: 7, day: 14, desc: 'बळीराजाचा कृतज्ञतेचा सण — बैलांची पूजा', color: '#795548', tips: ['बैलांना सजवा', 'त्यांना गोड पुरण पोळी द्या'] },
  { name: 'नागपंचमी', emoji: '🐍', month: 7, day: 19, desc: 'नागदेवतांची आणि निसर्गाची पूजा', color: '#2E7D32', tips: ['दुधाचा नैवेद्य', 'हातावर मेहंदी काढा', 'झोके खेळा'] },
  { name: 'नारळी पौर्णिमा / रक्षाबंधन', emoji: '🎀', month: 8, day: 28, desc: 'भाऊ-बहिणीचे प्रेम आणि कोळी बांधवांचा सण', color: '#AD1457', tips: ['भावाला राखी बांधा', 'नारळी भात बनवा', 'समुद्राची पूजा करा'] },
  { name: 'गोकुळाष्टमी', emoji: '🍯', month: 9, day: 4, desc: 'भगवान श्रीकृष्णाचा जन्म — दहीहंडीचा उत्साह', color: '#1565C0', tips: ['दहीहंडी फोडा', 'कृष्ण मंदिरात जा', 'काळा मसाला आणि पोहे'] },
  { name: 'गणेश चतुर्थी', emoji: '🐘', month: 9, day: 16, desc: 'बाप्पांचे आगमन — महाउत्सव (१० दिवस)', color: '#D4520A', tips: ['गणपतीची प्रतिष्ठापना', '२१ मोदकांचा नैवेद्य', 'आरती आणि जयघोष!'] },
  { name: 'गौरी पूजन', emoji: '👑', month: 9, day: 20, desc: 'महालक्ष्मी आगमन — सोन्याच्या पावलांनी गौरी येते', color: '#E91E63', tips: ['गौरीची सजावट', 'सोळा भाज्यांचे जेवण'] },
  { name: 'अनंत चतुर्दशी', emoji: '🌊', month: 9, day: 26, desc: 'गणपती बाप्पांना निरोप — विसर्जन मिरवणुका', color: '#D4520A', tips: ['बाप्पाचे विसर्जन', 'पुढच्या वर्षी लवकर येण्याचे आमंत्रण'] },
  { name: 'पितृ पक्ष', emoji: '🙏', month: 9, day: 27, desc: 'पूर्वजांचे स्मरण करण्याचा काळ', color: '#607D8B', tips: ['पितरांचे श्राद्ध करा', 'दानधर्म'] },
  { name: 'घटस्थापना (नवरात्री)', emoji: '🌺', month: 10, day: 12, desc: 'शक्तिदेवतेची नऊ दिवसांची उपासना', color: '#AD1457', tips: ['घटाची स्थापना', 'नऊ दिवस नऊ रंग', 'गरबा और भोंडला'] },
  { name: 'दसरा (विजयदशमी)', emoji: '🌾', month: 10, day: 22, desc: 'अधर्मावर धर्माचा विजय — सीमोल्लंघन', color: '#2E7D32', tips: ['आपट्याची पाने (सोने) वाटा', 'शस्त्र आणि यंत्र पूजा'] },
  { name: 'कोजागिरी पौर्णिमा', emoji: '🌕', month: 10, day: 26, desc: 'दूध-साखर आणि चंद्रदर्शनाचा आनंद', color: '#FFEB3B', tips: ['मसाले दूध प्या', 'चंद्राच्या प्रकाशात बसा'] },
  { name: 'दिवाळी (नरक चतुर्दशी)', emoji: '🪔', month: 11, day: 8, desc: 'मोठी दिवाळी — अभ्यंगस्नान आणि फराळ', color: '#FFC107', tips: ['उटणे लावून आंघोळ', 'फटाके आणि आकाशकंदील', 'लक्ष्मी पूजन'] },
  { name: 'दिवाळी पाडवा / भाऊबीज', emoji: '🎁', month: 11, day: 10, desc: 'बहीण-भावाच्या नात्याचा गोड सण', color: '#E91E63', tips: ['भावाचे ओवाळण', 'बहिणीला खास भेटवस्तू'] },
  { name: 'तुळशी विवाह', emoji: '💍', month: 11, day: 21, desc: 'लग्नांच्या हंगामाची सुरुवात', color: '#4CAF50', tips: ['तुळशीचे लग्न लावा', 'ऊस आणि चिंचा'] },
  { name: 'दत्त जयंती', emoji: '🔱', month: 12, day: 23, desc: 'गुरुदेव दत्तांचा जन्मोत्सव', color: '#FF9800', tips: ['दत्त बावन्नी पठन', 'पालखी दर्शन'] },
  { name: 'मकर संक्रांत', emoji: '🪁', month: 1, day: 14, desc: 'तिळगुळ घ्या, गोड गोड बोला!', color: '#F44336', tips: ['तिळगुळ वाटा', 'पतंग उडवा', 'काळे कपडे'] },
  { name: 'महाशिवरात्री', emoji: '🕉️', month: 2, day: 15, desc: 'हर हर महादेव! उपवास आणि पूजा', color: '#8E24AA', tips: ['शिवलिंगावर अभिषेक', 'बिल्वपत्र अर्पण', 'जागर'] },
  { name: 'शिवजयंती (तारखेनुसार)', emoji: '🚩', month: 2, day: 19, desc: 'छत्रपती शिवाजी महाराज जयंती', color: '#FF5722', tips: ['शिवरायांचे स्मरण', 'शिवनेरी दर्शन'] },
  { name: 'होळी / धुळवड', emoji: '🎨', month: 3, day: 3, desc: 'रंगांचा सण आणि पुरणपोळीचा बेत', color: '#E91E63', tips: ['होळी पेटवा', 'नैसर्गिक रंग खेळा'] },
];

function getUpcomingFestivals(count = 5) {
  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth() + 1;
  const curD = now.getDate();

  const withDates = MAHARASHTRIAN_FESTIVALS.map(f => {
    // Determine the year for this festival
    let year = curY;
    if (f.month < curM || (f.month === curM && f.day < curD)) {
        year = curY + 1;
    }
    
    const fDate = new Date(year, f.month - 1, f.day);
    const diffTime = fDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { ...f, fDate, daysLeft };
  });

  return withDates.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, count);
}

async function renderFestivals(container) {
  container.className = 'page-content page-enter';
  const upcoming = getUpcomingFestivals(MAHARASHTRIAN_FESTIVALS.length);
  const soonest = upcoming.slice(0, 3);

  container.innerHTML = `
    <div class="page-header festive-bg">
      <div class="page-header-left">
        <h2>🪔 सण-उत्सव २०२६-२७</h2>
        <p>काळनिर्णय संदर्भानुसार महत्त्वाच्या तारखा</p>
      </div>
      <div class="sparkles">✨🌟✨</div>
    </div>

    <!-- Festive Banner for Today -->
    <div id="todayFestivalArea"></div>

    <!-- Coming Soon -->
    <div class="coming-soon-section mb-4">
      <div class="section-label mb-3">⭐ लवकरच येणारे उत्सव</div>
      <div class="grid-3">
        ${soonest.map(f => renderFestivalHighlight(f)).join('')}
      </div>
    </div>

    <!-- All Festivals -->
    <div class="section-label mb-3">📅 संपूर्ण दिनदर्शिका</div>
    <div class="grid-auto">
      ${upcoming.map(f => renderFestivalCard(f)).join('')}
    </div>
  `;

  injectFestivalCSS();
  renderTodayCelebration(upcoming);
}

function renderTodayCelebration(festivals) {
    const today = festivals.find(f => f.daysLeft === 0);
    if (!today) return;
    
    document.getElementById('todayFestivalArea').innerHTML = `
        <div class="today-banner pulse">
            <div class="today-tag">आजचा सण 🎉</div>
            <div class="today-content">
                <div class="today-emoji float">${today.emoji}</div>
                <div class="today-txt">
                    <div class="today-name">${today.name}</div>
                    <div class="today-desc">${today.desc}</div>
                </div>
            </div>
            <button class="btn btn-light btn-sm" onclick="showFestivalDetail('${today.name}')">उत्सवाची तयारी पहा</button>
        </div>
    `;
}

function renderFestivalHighlight(f) {
  const urgency = f.daysLeft === 0 ? '🎉 आज!' : f.daysLeft <= 7 ? '🔴 या आठवड्यात' : f.daysLeft <= 30 ? '🟡 या महिन्यात' : '🟢 लवकरच';
  return `
    <div class="festival-highlight" style="border-top:4px solid ${f.color}">
      <div class="fh-emoji sparkle">${f.emoji}</div>
      <div class="fh-name">${f.name}</div>
      <div class="fh-days" style="color:${f.color}">
        ${f.daysLeft === 0 ? '🎉 आज आहे!' : `${f.daysLeft} दिवस बाकी`}
      </div>
      <div class="fh-date">${f.fDate.toLocaleDateString('mr-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      <span class="badge" style="background:${f.color}20;color:${f.color}">${urgency}</span>
      <button class="btn btn-sm btn-secondary w-full mt-2" onclick="showFestivalDetail('${f.name}')">📖 माहिती</button>
    </div>
  `;
}

function renderFestivalCard(f) {
  return `
    <div class="festival-card" onclick="showFestivalDetail('${f.name}')" style="border-left: 3px solid ${f.color}">
      <div class="fc-header">
        <span class="fc-emoji-small">${f.emoji}</span>
        <div>
          <div class="fc-name">${f.name}</div>
          <div class="fc-date text-sm text-muted">${f.fDate.toLocaleDateString('mr-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
        <div class="fc-days" style="color:${f.color}">
          ${f.daysLeft === 0 ? '🎉 आज' : f.daysLeft + ' दिवस'}
        </div>
      </div>
      <div class="fc-desc">${f.desc}</div>
    </div>
  `;
}

function showFestivalDetail(name) {
  const f = MAHARASHTRIAN_FESTIVALS.find(x => x.name === name);
  if (!f) return;

  openModal(`
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:56px;margin-bottom:8px" class="float">${f.emoji}</div>
      <div style="font-size:22px;font-weight:700;font-family:'Tiro Devanagari Marathi',serif;color:${f.color}">${f.name}</div>
    </div>
    <div class="festival-detail-banner" style="background:${f.color}15;border-color:${f.color}30">
      <div style="font-size:14px;line-height:1.6;font-family:'Tiro Devanagari Marathi',serif">${f.desc}</div>
    </div>
    <div style="margin-top:16px">
      <div style="font-weight:700;margin-bottom:10px;font-size:14px">✅ या दिवशी काय करावे:</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${f.tips.map(tip => `
          <div style="display:flex;align-items:center;gap:8px;padding:8px;background:var(--bg);border-radius:8px;">
            <span style="color:${f.color};font-size:16px">🔸</span>
            <span style="font-size:13.5px;font-family:'Tiro Devanagari Marathi',serif">${tip}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <button class="btn btn-primary w-full mt-4" onclick="addFestivalTask('${name}')">📅 प्लॅनरमध्ये जोडा</button>
  `, 460);
}

async function addFestivalTask(festName) {
  const f = MAHARASHTRIAN_FESTIVALS.find(x => x.name === festName);
  const now = new Date();
  let year = now.getFullYear();
  if (f.month < (now.getMonth() + 1)) year++;
  
  const fDate = new Date(year, f.month - 1, f.day);
  const dateStr = fDate.toISOString().slice(0, 10);

  const tasks = await DB.getTasks();
  tasks.push({
    id: genId(),
    title: festName + ' तयारी 🪔',
    type: 'festival',
    priority: 'high',
    date: dateStr,
    time: '08:00',
    note: f.desc,
    done: false,
    addedBy: currentUser.name,
  });
  await DB.saveTasks(tasks);
  closeModal();
  showToast(`${festName} नियोजन जोडले! ✅`, 'success');
  if (window.updateNotifBadge) await updateNotifBadge();
}

function injectFestivalCSS() {
  if (document.getElementById('festival-css')) return;
  const s = document.createElement('style');
  s.id = 'festival-css';
  s.textContent = `
  .section-label { font-size: 14px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }

  .festive-bg { position: relative; overflow: hidden; background: linear-gradient(135deg, #FF5722, #D4520A); color: #fff; }
  .festive-bg h2, .festive-bg p { color: #fff !important; }
  .sparkles { position: absolute; right: 20px; bottom: 10px; font-size: 24px; opacity: 0.6; animation: float 3s ease-in-out infinite; }

  .today-banner {
    background: linear-gradient(45deg, #FF9800, #FF5722);
    border-radius: 12px; padding: 20px; margin-bottom: 24px;
    color: #fff; display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 10px 20px rgba(255,87,34,0.3); border: 2px solid rgba(255,255,255,0.2);
    position: relative;
  }
  .today-tag { position: absolute; top: -10px; left: 20px; background: #fff; color: #FF5722; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 800; border: 1px solid #FF5722; }
  .today-content { display: flex; align-items: center; gap: 15px; }
  .today-emoji { font-size: 45px; }
  .today-name { font-size: 20px; font-weight: 800; font-family:'Tiro Devanagari Marathi',serif; }
  .today-desc { font-size: 13px; opacity: 0.9; font-family:'Tiro Devanagari Marathi',serif; }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); box-shadow: 0 12px 25px rgba(255,87,34,0.4); }
    100% { transform: scale(1); }
  }
  .pulse { animation: pulse 3s infinite; }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(5deg); }
  }
  .float { animation: float 4s ease-in-out infinite; }
  
  @keyframes sparkle {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
  }
  .sparkle { animation: sparkle 2s infinite; }

  .festival-highlight {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; text-align: center;
    box-shadow: var(--shadow-sm); transition: all 0.3s; position: relative; overflow: hidden;
  }
  .festival-highlight:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); border-color: var(--primary); }
  .fh-emoji { font-size: 48px; margin-bottom: 8px; }
  .fh-name  { font-size: 16px; font-weight: 700; font-family:'Tiro Devanagari Marathi',serif; margin-bottom: 6px; }
  .fh-days  { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .fh-date  { font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }

  .festival-card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px;
    cursor: pointer; transition: all 0.3s; box-shadow: var(--shadow-sm);
  }
  .festival-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .fc-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .fc-emoji-small { font-size: 24px; flex-shrink: 0; }
  .fc-name   { font-size: 14px; font-weight: 700; font-family:'Tiro Devanagari Marathi',serif; }
  .fc-days   { font-size: 12px; font-weight: 700; margin-left: auto; flex-shrink: 0; }
  .fc-desc   { font-size: 12px; color: var(--text-muted); font-family:'Tiro Devanagari Marathi',serif; line-height: 1.4; }

  .festival-detail-banner {
    padding: 14px; border-radius: var(--radius-sm);
    border: 1px solid; margin-bottom: 8px;
  }
  `;
  document.head.appendChild(s);
}
