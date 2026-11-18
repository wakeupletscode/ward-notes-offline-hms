const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const F = ['name', 'dob', 'blood', 'phone', 'status', 'notes'];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

let db, rows = [], log = [], auditEntries = [], forced = false, busy = false;
let activeFilter = 'ALL';

// ---- View Navigation (Ward Workspace <-> About & Guide) ----
function showView(view) {
  const isAbout = view === 'about';
  const wardEl = $('#ward-view');
  const aboutEl = $('#about-view');
  if (wardEl) wardEl.classList.toggle('hidden', isAbout);
  if (aboutEl) aboutEl.classList.toggle('hidden', !isAbout);
  if ($('#nav-ward-btn')) $('#nav-ward-btn').classList.toggle('active', !isAbout);
  if ($('#nav-about-btn')) $('#nav-about-btn').classList.toggle('active', isAbout);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

if ($('#nav-ward-btn')) $('#nav-ward-btn').onclick = () => showView('ward');
if ($('#nav-about-btn')) $('#nav-about-btn').onclick = () => showView('about');
if ($('#back-to-ward-btn')) $('#back-to-ward-btn').onclick = () => showView('ward');
if ($('#about-demo-btn')) {
  $('#about-demo-btn').onclick = async () => {
    showView('ward');
    if ($('#seed-btn')) $('#seed-btn').click();
  };
}

// ---- Theme Management ----
function initTheme() {
  const saved = localStorage.getItem('wn-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}
initTheme();

if ($('#theme-btn')) {
  $('#theme-btn').onclick = () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    localStorage.setItem('wn-theme', cur);
    toast(`Switched to ${cur} mode`);
  };
}

function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2600);
}

// ---- Helpers ----
function localTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function initials(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'PT';
}

function calcAge(dob) {
  if (!dob) return '';
  const today = localTodayStr();
  if (dob > today) return 'Invalid (future)';
  const [by, bm, bd] = dob.split('-').map(Number);
  if (!by || !bm || !bd) return '';
  const now = new Date();
  const ny = now.getFullYear(), nm = now.getMonth() + 1, nd = now.getDate();
  let years = ny - by;
  let months = nm - bm;
  if (nd < bd) months--;
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years < 0) return 'Invalid (future)';
  if (years === 0) {
    return months <= 0 ? 'Newborn' : `${months} mo${months > 1 ? 's' : ''}`;
  }
  return `${years} yr${years > 1 ? 's' : ''}`;
}

function fmtTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ---- IndexedDB: the local copy that works with no network ----
const opn = () => new Promise((ok, no) => {
  const r = indexedDB.open('ward-notes', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('p', { keyPath: 'id' });
  r.onsuccess = () => ok(r.result);
  r.onerror = () => no(r.error);
});
const tx = (m, fn) => new Promise((ok, no) => {
  const t = db.transaction('p', m), r = fn(t.objectStore('p'));
  t.oncomplete = () => ok(r.result);
  t.onerror = () => no(t.error);
});
const getAll = () => tx('readonly', s => s.getAll());
const put = r => tx('readwrite', s => s.put(r));
const pick = r => Object.fromEntries(F.map(f => [f, r[f] ?? '']));
// base = last server copy, used for field-level merge
const store = (r, dirty = false) => put({ ...r, ...pick(r), base: pick(r), dirty });

// ---- UI Rendering ----
function badge(on) {
  $('#st').textContent = on ? '● Online' : '● Offline';
  $('#strip').className = on ? 'on' : 'off';
  const banner = $('#offline-banner');
  if (banner) banner.classList.toggle('hidden', on);
}

async function refresh() {
  rows = await getAll();
  const activeRows = rows.filter(r => !r.deleted);
  const dirtyCount = rows.filter(r => r.dirty).length;

  // Update KPI Cards
  const admittedCount = activeRows.filter(r => r.status === 'Admitted').length;
  const outpatientCount = activeRows.filter(r => r.status === 'Active').length;
  const dischargedCount = activeRows.filter(r => r.status === 'Discharged').length;

  if ($('#kpi-total')) $('#kpi-total').textContent = activeRows.length;
  if ($('#kpi-admitted')) $('#kpi-admitted').textContent = admittedCount;
  if ($('#kpi-active')) $('#kpi-active').textContent = outpatientCount;
  if ($('#kpi-discharged-sub')) $('#kpi-discharged-sub').textContent = `${dischargedCount} discharged`;
  if ($('#kpi-dirty')) $('#kpi-dirty').textContent = dirtyCount;
  if ($('#sync-meta')) $('#sync-meta').textContent = `Seq #${+localStorage.cursor || 0}`;

  // Filter logic
  const q = ($('#q')?.value || '').toLowerCase().trim();
  const bloodFilter = $('#blood-filter')?.value || '';

  const vis = activeRows
    .filter(r => {
      if (activeFilter === 'DIRTY' && !r.dirty) return false;
      if (activeFilter !== 'ALL' && activeFilter !== 'DIRTY' && r.status !== activeFilter) return false;
      if (bloodFilter && r.blood !== bloodFilter) return false;
      const hay = `${r.name} ${r.phone} ${r.blood} ${r.notes} ${r.status}`.toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  if ($('#record-count')) {
    $('#record-count').textContent = `${vis.length} of ${activeRows.length} shown`;
  }

  $('#tb').innerHTML = vis.map(r => {
    const ageStr = calcAge(r.dob);
    const statusCls = `status-${esc(r.status || 'Active')}`;
    const shortId = String(r.id || '').slice(0, 8).toUpperCase();
    return `<tr>
      <td>
        <div class="pt-cell">
          <div class="pt-avatar">${esc(initials(r.name))}</div>
          <div class="pt-info">
            <div class="pt-name-row">
              <span>${esc(r.name)}</span>
              ${r.dirty ? '<span class="tag" title="Saved on device, waiting for server sync">● pending</span>' : ''}
            </div>
            <span class="pt-meta">ID: ${esc(shortId)} • rev ${r.rev || 0}</span>
          </div>
        </div>
      </td>
      <td>
        <div>${esc(r.dob || '—')}</div>
        ${ageStr ? `<div class="pt-meta">${esc(ageStr)}</div>` : ''}
      </td>
      <td>${r.blood ? `<span class="blood-badge">${esc(r.blood)}</span>` : '<span class="pt-meta">Unknown</span>'}</td>
      <td>${r.phone ? esc(r.phone) : '<span class="pt-meta">—</span>'}</td>
      <td><span class="status-pill ${statusCls}">${esc(r.status || 'Active')}</span></td>
      <td class="notes-cell">${r.notes ? esc(r.notes) : '<span class="pt-meta">No ward notes</span>'}</td>
      <td>
        <div class="row-actions">
          <button data-e="${esc(r.id)}" title="Edit patient record">Edit</button>
          <button data-d="${esc(r.id)}" title="Delete patient record">Delete</button>
        </div>
      </td>
    </tr>`;
  }).join('') || `<tr><td colspan="7" class="empty-state">
    <strong>No matching patient records</strong>
    <span>Add a new patient or click "Demo Data" to populate sample clinical ward records.</span>
  </td></tr>`;

  $('#pend').textContent = dirtyCount + ' pending';

  $('#log').innerHTML = log.map(l => `<li>
    <span class="audit-badge audit-CONFLICT">MERGE</span>
    <span>${esc(l)}</span>
  </li>`).join('') || '<li><span class="pt-meta">None. Non-conflicting edits from other devices merge automatically.</span></li>';
}

async function fetchAuditLog() {
  if (forced) return;
  try {
    const res = await fetch('/api/audit', { cache: 'no-store' });
    if (!res.ok) return;
    auditEntries = await res.json();
    const ul = $('#audit-log');
    if (!ul) return;
    if (!auditEntries.length) {
      ul.innerHTML = '<li><span class="pt-meta">No server sync events recorded yet.</span></li>';
      return;
    }
    ul.innerHTML = auditEntries.slice(0, 12).map(a => {
      const act = esc(a.action || 'SYNC');
      const shortPid = String(a.patientId || '').slice(0, 8).toUpperCase();
      return `<li>
        <span class="audit-badge audit-${act}">${act}</span>
        <span style="flex:1"><strong>${esc(a.detail || 'Record updated')}</strong> <span class="pt-meta">(${shortPid})</span></span>
        <span class="pt-meta">${fmtTime(a.ts)}</span>
      </li>`;
    }).join('');
    if ($('#audit-count')) $('#audit-count').textContent = `${auditEntries.length} SQL events`;
  } catch {
    // Offline — keep existing rendered audit entries
  }
}

// ---- Sync: push local changes, pull everyone else's ----
async function ping() {
  if (forced) return false;
  try {
    return (await fetch('/api/health', { cache: 'no-store' })).ok;
  } catch {
    return false;
  }
}

async function sync() {
  if (busy) return;
  busy = true;
  const syncBtn = $('#sync');
  if (syncBtn) syncBtn.classList.add('spinning');
  try {
    const on = await ping();
    badge(on);
    if (!on) return;
    const cur = await getAll();
    const changes = cur.filter(r => r.dirty).map(r => {
      const b = r.base || {}, fields = {};
      F.forEach(f => { if ((r[f] ?? '') !== (b[f] ?? '')) fields[f] = r[f]; });
      return { id: r.id, base: b, fields, deleted: !!r.deleted, clientTime: r.editedAt || Date.now() };
    });
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changes, since: +localStorage.cursor || 0 })
    });
    if (!res.ok) throw new Error('sync failed');
    const d = await res.json();
    const sent = new Set(d.results.map(x => x.id));
    const local = new Map(cur.map(r => [r.id, r]));
    for (const x of d.results) {
      await store(x.record);
      for (const c of x.conflicts) {
        log.unshift(`${x.record.name}, ${c.field}: you wrote "${c.yours ?? ''}", another device wrote "${c.theirs ?? ''}". Kept ${c.kept === 'yours' ? 'yours' : 'theirs'}.`);
      }
    }
    for (const u of d.updates) {
      const l = local.get(u.id);
      if (!(l && l.dirty && !sent.has(u.id))) await store(u);
    }
    localStorage.cursor = d.cursor;
    if ($('#kpi-last-sync')) {
      $('#kpi-last-sync').textContent = `Last synced ${fmtTime(Date.now())}`;
    }
    if (changes.length > 0) {
      toast(`Synced ${changes.length} local change(s) with server`);
    }
    await fetchAuditLog();
  } catch (e) {
    badge(false);
  } finally {
    busy = false;
    if (syncBtn) syncBtn.classList.remove('spinning');
    await refresh();
  }
}

const regBg = async () => {
  try {
    await (await navigator.serviceWorker.ready).sync.register('sync-patients');
  } catch {}
};

// ---- Form Validation & Modal Helpers ----
function clearFormErrors(f) {
  const errEl = $('#form-err');
  if (errEl) {
    errEl.textContent = '';
    errEl.classList.add('hidden');
  }
  f.querySelectorAll('.input-invalid').forEach(el => el.classList.remove('input-invalid'));
}

function showFormError(msg, inputEl) {
  const errEl = $('#form-err');
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
  }
  if (inputEl) {
    inputEl.classList.add('input-invalid');
    inputEl.focus();
  }
}

function updateModalHints(f) {
  if (f.elements.dob) {
    f.elements.dob.max = localTodayStr();
    f.elements.dob.min = '1900-01-01';
    const hint = $('#dob-age-hint');
    if (hint) {
      const dobVal = f.elements.dob.value;
      if (!dobVal) {
        hint.textContent = 'Max: today';
        hint.classList.remove('err');
      } else if (dobVal > localTodayStr()) {
        hint.textContent = 'Future date not allowed';
        hint.classList.add('err');
      } else if (dobVal < '1900-01-01') {
        hint.textContent = 'Must be 1900 or later';
        hint.classList.add('err');
      } else {
        hint.textContent = `Age: ${calcAge(dobVal)}`;
        hint.classList.remove('err');
      }
    }
  }
  if (f.elements.notes && $('#notes-count')) {
    const len = f.elements.notes.value.length;
    $('#notes-count').textContent = `${len} / 2000`;
  }
}

const formEl = $('#f');
if (formEl) {
  if (formEl.elements.dob) {
    formEl.elements.dob.max = localTodayStr();
    formEl.elements.dob.addEventListener('input', () => {
      formEl.elements.dob.classList.remove('input-invalid');
      updateModalHints(formEl);
    });
  }
  if (formEl.elements.notes) {
    formEl.elements.notes.addEventListener('input', () => updateModalHints(formEl));
  }
  ['name', 'phone'].forEach(k => {
    if (formEl.elements[k]) {
      formEl.elements[k].addEventListener('input', () => formEl.elements[k].classList.remove('input-invalid'));
    }
  });
}

// ---- Events ----
$('#add').onclick = () => {
  const f = $('#f');
  f.reset();
  f.elements.pid.value = '';
  clearFormErrors(f);
  updateModalHints(f);
  if ($('#dlg-title')) $('#dlg-title').textContent = 'Add New Patient';
  $('#dlg').showModal();
};

$('#f').onsubmit = async e => {
  const f = e.target;
  if (e.submitter && e.submitter.value === 'cancel') return;
  clearFormErrors(f);

  const rawName = f.elements.name.value.replace(/\s+/g, ' ').trim();
  const dob = f.elements.dob.value.trim();
  const phone = f.elements.phone.value.replace(/\s+/g, ' ').trim();
  const notes = f.elements.notes.value.trim();
  const today = localTodayStr();

  // 1. Validate Full Name
  if (rawName.length < 2 || !/[a-zA-Z]/.test(rawName)) {
    e.preventDefault();
    showFormError('Please enter a valid patient full name (at least 2 letters).', f.elements.name);
    return;
  }

  // 2. Validate Date of Birth (cannot be in the future or before 1900)
  if (dob) {
    if (dob > today) {
      e.preventDefault();
      showFormError(`Date of birth cannot be in the future (must be on or before ${today}).`, f.elements.dob);
      return;
    }
    if (dob < '1900-01-01') {
      e.preventDefault();
      showFormError('Date of birth must be in the year 1900 or later.', f.elements.dob);
      return;
    }
  }

  // 3. Validate Phone Number (if provided, must have 7-15 digits and only phone characters)
  if (phone) {
    const digitsOnly = phone.replace(/\D/g, '');
    if (!/^[+]?[0-9\s\-()]+$/.test(phone) || digitsOnly.length < 7 || digitsOnly.length > 15) {
      e.preventDefault();
      showFormError('Please enter a valid phone number containing 7 to 15 digits.', f.elements.phone);
      return;
    }
  }

  // 4. Validate Notes length (matches SQL @Column(length = 2000))
  if (notes.length > 2000) {
    e.preventDefault();
    showFormError('Clinical notes cannot exceed 2,000 characters.', f.elements.notes);
    return;
  }

  const v = {
    name: rawName,
    dob,
    blood: f.elements.blood.value.trim(),
    phone,
    status: f.elements.status.value.trim(),
    notes
  };
  const isEdit = !!f.elements.pid.value;
  const old = rows.find(r => r.id === f.elements.pid.value);
  await put({
    ...(old || { id: crypto.randomUUID(), base: {}, rev: 0 }),
    ...v,
    dirty: true,
    deleted: false,
    editedAt: Date.now()
  });
  toast(isEdit ? `Updated ${v.name}` : `Added ${v.name} to Ward Notes`);
  await refresh();
  sync();
  regBg();
};

$('#tb').onclick = async e => {
  const t = e.target.closest('button');
  if (!t) return;
  const id = t.dataset.e || t.dataset.d;
  if (!id) return;
  const r = rows.find(x => x.id === id);
  if (!r) return;
  if (t.dataset.e) {
    const f = $('#f');
    f.elements.pid.value = id;
    F.forEach(k => f.elements[k].value = r[k] ?? '');
    clearFormErrors(f);
    updateModalHints(f);
    if ($('#dlg-title')) $('#dlg-title').textContent = `Edit Patient — ${r.name}`;
    $('#dlg').showModal();
  } else if (confirm('Delete ' + r.name + '?')) {
    await put({ ...r, deleted: true, dirty: true, editedAt: Date.now() });
    toast(`Removed ${r.name}`);
    await refresh();
    sync();
    regBg();
  }
};

$('#q').oninput = refresh;
if ($('#blood-filter')) $('#blood-filter').onchange = refresh;

$$('.filter-tab').forEach(btn => {
  btn.onclick = () => {
    $$('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter || 'ALL';
    refresh();
  };
});

if ($('#seed-btn')) {
  $('#seed-btn').onclick = async () => {
    const samplePatients = [
      { name: 'Aarav Kulkarni', dob: '1982-06-14', blood: 'O+', phone: '+91 98201 44120', status: 'Admitted', notes: 'Ward 3B, Bed 12 • Post-op cardiac observation, BP 124/80 mmHg' },
      { name: 'Meera Nair', dob: '1994-11-23', blood: 'A+', phone: '+91 98450 31982', status: 'Active', notes: 'Outpatient endocrinology follow-up • HbA1c 6.4%, continue Metformin' },
      { name: 'Vikramaditya Joshi', dob: '1958-02-09', blood: 'B+', phone: '+91 98112 77890', status: 'Admitted', notes: 'ICU Step-down Bed 04 • Acute bronchitis, SpO2 97% on room air' },
      { name: 'Zoya Siddiqui', dob: '2001-08-19', blood: 'AB+', phone: '+91 97690 55210', status: 'Active', notes: 'Orthopedic cast review — right distal radius fracture healing well' },
      { name: 'Raghavendra Iyer', dob: '1971-04-03', blood: 'O-', phone: '+91 94440 88219', status: 'Discharged', notes: 'Discharged stable with 7-day oral antibiotic course & diet chart' }
    ];
    const existingNames = new Set(rows.filter(r => !r.deleted).map(r => r.name.toLowerCase()));
    let added = 0;
    for (const sp of samplePatients) {
      if (!existingNames.has(sp.name.toLowerCase())) {
        await put({
          id: crypto.randomUUID(),
          base: {},
          rev: 0,
          ...sp,
          dirty: true,
          deleted: false,
          editedAt: Date.now()
        });
        added++;
      }
    }
    toast(added ? `Added ${added} sample ward patients` : 'Sample patients already present');
    await refresh();
    sync();
    regBg();
  };
}

// Keyboard shortcut: '/' to focus search
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== $('#q') && !$('#dlg').open) {
    e.preventDefault();
    $('#q').focus();
  }
});

$('#sync').onclick = sync;
$('#off').onchange = e => {
  forced = e.target.checked;
  toast(forced ? 'Offline simulation enabled (local IndexedDB mode)' : 'Reconnecting & syncing with server...');
  sync();
};

(async () => {
  db = await opn();
  await refresh();
  if ('serviceWorker' in navigator) {
    await navigator.serviceWorker.register('/sw.js');
    navigator.serviceWorker.onmessage = () => sync();
  }
  addEventListener('online', sync);
  addEventListener('offline', () => badge(false));
  setInterval(sync, 10000);
  sync();
})();
