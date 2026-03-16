/* ══════════════════════════════════════════
   AUTH.JS — Authentication & Session
══════════════════════════════════════════ */

// ── Switch between login / register tabs
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginBtn = document.getElementById('loginTabBtn');
    const regBtn = document.getElementById('registerTabBtn');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginBtn.classList.add('active');
        regBtn.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginBtn.classList.remove('active');
        regBtn.classList.add('active');
    }

    // Clear errors
    document.getElementById('loginError').classList.add('hidden');
    document.getElementById('registerError').classList.add('hidden');
}

// ── Toggle password visibility
function togglePw(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

// ── Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');

    const users = await DB.getUsers();
    const user = users.find(u => u.email === email);

    if (!user || user.password !== hashPassword(password)) {
        errEl.textContent = '⚠️ ईमेल किंवा पासवर्ड चुकीचा आहे.';
        errEl.classList.remove('hidden');
        shakeEl(errEl);
        return;
    }

    errEl.classList.add('hidden');
    DB.setSession(user);
    showApp(user);
}

// ── Handle Register
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const phone = document.getElementById('regPhone').value.trim();
    const role = document.getElementById('regRole').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    const errEl = document.getElementById('registerError');

    if (password !== confirm) {
        errEl.textContent = '⚠️ पासवर्ड जुळत नाही.';
        errEl.classList.remove('hidden');
        shakeEl(errEl);
        return;
    }

    const users = await DB.getUsers();
    if (users.find(u => u.email === email)) {
        errEl.textContent = '⚠️ हा ईमेल आधीच नोंदणीकृत आहे.';
        errEl.classList.remove('hidden');
        shakeEl(errEl);
        return;
    }

    const newUser = {
        id: genId(),
        name, email, phone, role,
        familyRole: role === 'admin' ? 'कुटुंब प्रमुख' : 'सदस्य',
        avatar: role === 'admin' ? '👨' : '👤',
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await DB.saveUsers(users);

    // Also add as family member
    const members = await DB.getMembers();
    members.push({ id: genId(), name, familyRole: newUser.familyRole, avatar: newUser.avatar, phone, userId: newUser.id });
    await DB.saveMembers(members);

    errEl.classList.add('hidden');
    DB.setSession(newUser);
    showApp(newUser);
}

// ── Logout
function handleLogout() {
    if (confirm('खरंच बाहेर पडायचे आहे का?')) {
        DB.clearSession();
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('authContainer').classList.remove('hidden');
        document.body.classList.remove('app-active');
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        switchAuthTab('login');
    }
}

// ── Show main app
function showApp(user) {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.body.classList.add('app-active');
    initApp(user);
}

// ── Shake animation for errors
function shakeEl(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake 0.4s ease';
}

// ── On page load: check session
window.addEventListener('DOMContentLoaded', async () => {
    // Migrate if needed
    await DB.migrateIfNeeded();

    // Apply saved dark mode
    if (await DB.getDarkMode()) document.documentElement.classList.add('dark-mode');


    const users = await DB.getUsers();

    // Hide register tab if an admin is already registered
    if (users && users.length > 0) {
        document.getElementById('registerTabBtn').style.display = 'none';
        switchAuthTab('login');
    }

    const session = DB.getSession();
    if (session) {
        // Verify user still exists
        const users = await DB.getUsers();
        const user = users.find(u => u.id === session.id);
        if (user) {
            showApp(user);
        } else {
            DB.clearSession();
        }
    }
});


// ── Password strength indicator
document.addEventListener('DOMContentLoaded', () => {
    const regPw = document.getElementById('regPassword');
    if (!regPw) return;
    regPw.addEventListener('input', function () {
        const bar = document.getElementById('pwStrengthBar');
        if (!bar) return;
        const pw = this.value;
        let strength = 0;
        if (pw.length >= 8) strength++;
        if (/[A-Z]/.test(pw)) strength++;
        if (/[0-9]/.test(pw)) strength++;
        if (/[^A-Za-z0-9]/.test(pw)) strength++;
        const pct = (strength / 4) * 100;
        const colors = ['#DC2626', '#F59E0B', '#3B82F6', '#16A34A'];
        bar.style.width = pct + '%';
        bar.style.background = colors[strength - 1] || colors[0];
    });
});
