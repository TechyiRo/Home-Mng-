/* ══════════════════════════════════════════
   STORAGE.JS — LocalStorage wrapper with
   simple password hashing (SHA-like)
══════════════════════════════════════════ */

// Detect if we are running locally or on a production server
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocal
    ? 'http://localhost:5000/api'
    : 'https://home-mng-backend-dp0b.onrender.com/api'; // Replace with your actual backend URL after deployment

const DB = {
    async _fetch(endpoint) {
        try {
            const res = await fetch(`${API_URL}/${endpoint}`);
            return await res.json();
        } catch (e) {
            console.error(`Fetch error for ${endpoint}:`, e);
            return null;
        }
    },
    async _post(endpoint, data) {
        try {
            const res = await fetch(`${API_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (e) {
            console.error(`Post error for ${endpoint}:`, e);
            return null;
        }
    },

    // ── Users
    async getUsers() { return await this._fetch('users') || []; },
    async saveUsers(u) { return await this._post('users', u); },

    // ── Session (Keep in local storage for persistence across reloads)
    getSession() {
        try { return JSON.parse(localStorage.getItem('gv_session')); }
        catch { return null; }
    },
    setSession(u) { localStorage.setItem('gv_session', JSON.stringify(u)); },
    clearSession() { localStorage.removeItem('gv_session'); },

    // ── Family Members
    async getMembers() { return await this._fetch('members') || []; },
    async saveMembers(m) { return await this._post('members', m); },

    // ── Expenses
    async getExpenses() { return await this._fetch('expenses') || []; },
    async saveExpenses(e) { return await this._post('expenses', e); },

    // ── Meals
    async getMeals() { return await this._fetch('meals') || {}; },
    async saveMeals(m) { return await this._post('meals', m); },

    // ── Planner tasks
    async getTasks() { return await this._fetch('tasks') || []; },
    async saveTasks(t) { return await this._post('tasks', t); },

    // ── Chat messages
    async getMessages() { return await this._fetch('messages') || []; },
    async saveMessages(m) { return await this._post('messages', m); },

    // ── Photos
    async getPhotos() { return await this._fetch('photos') || []; },
    async savePhotos(p) { return await this._post('photos', p); },

    // ── Locations
    async getLocations() { return await this._fetch('locations') || {}; },
    async saveLocations(l) { return await this._post('locations', l); },

    // ── Dark mode & Settings
    async getSettings() { return await this._fetch('settings') || { familyName: 'आमचे कुटुंब', lang: 'mr', darkMode: false }; },
    async saveSettings(s) { return await this._post('settings', s); },

    async getDarkMode() {
        const s = await this.getSettings();
        return s.darkMode;
    },
    async setDarkMode(v) {
        const s = await this.getSettings();
        s.darkMode = v;
        await this.saveSettings(s);
    },

    // ── Data Migration (One-time sync from localStorage to MongoDB)
    async migrateIfNeeded() {
        const keys = ['users', 'members', 'expenses', 'tasks', 'meals', 'messages', 'photos', 'locations', 'settings'];
        const remoteUsers = await this.getUsers();

        // If users already exist in MongoDB, we won't auto-migrate to avoid overwriting newer data
        if (remoteUsers && remoteUsers.length > 0) return;

        let migrated = false;
        console.log("Checking for local data to migrate...");

        for (const key of keys) {
            const localData = localStorage.getItem('gv_' + key);
            if (localData) {
                try {
                    const parsed = JSON.parse(localData);
                    console.log(`Migrating ${key}...`);
                    await this._post(key, parsed);
                    migrated = true;
                    // We keep local data as backup for now, or we could delete it:
                    // localStorage.removeItem('gv_' + key);
                } catch (e) {
                    console.error(`Migration failed for ${key}:`, e);
                }
            }
        }
        if (migrated) {
            console.log("Migration complete!");
            alert("डेटा यशस्वीरित्या बॅकएंडवर स्थलांतरित झाला आहे!");
        }
    }
};



// ── Simple hash (not cryptographic – fine for demo local storage app)
function hashPassword(pwd) {
    let hash = 0;
    const str = pwd + 'gv_salt_2024';
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        hash = (hash << 5) - hash + c;
        hash |= 0;
    }
    return hash.toString(16);
}

// ── Generate unique ID
function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Format currency
function formatINR(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

// ── Format date
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('mr-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Today's date string (YYYY-MM-DD) in Local Time
function todayStr() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ── Week start (Monday) in Local Time
function getWeekStart(dateInput) {
    const d = dateInput ? new Date(dateInput) : new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));

    const year = start.getFullYear();
    const month = String(start.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(start.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayOfMonth}`;
}

