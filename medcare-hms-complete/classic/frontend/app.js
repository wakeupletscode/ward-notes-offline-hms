/* =========================================
   MedCare HMS — app.js
   NOTE: In production, replace all data arrays
   with fetch() calls to your Spring Boot API
   e.g. fetch('http://localhost:8080/api/patients')
   ========================================= */

'use strict';

// ── State ───────────────────────────────────────────────────────────
let patients     = [];
let doctors      = [];
let appointments = [];
let bills        = [];
let activityLog  = [];
let nextPtId     = 1005;
let nextApptId   = 4;
let nextBillId   = 4;

function getLocalToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const TODAY = getLocalToday();
const AVATAR_CLASSES = ['av-blue','av-green','av-amber','av-pink','av-purple'];
let admChart, deptChart;

// ── Seed Data ────────────────────────────────────────────────────────
function initData() {
  doctors = [
    { id: 1, name: 'Dr. Ramesh Patel',  specialty: 'Cardiology',   phone: '+91 9812345670', email: 'r.patel@medcare.in',  onDuty: true  },
    { id: 2, name: 'Dr. Sunita Rao',    specialty: 'Neurology',    phone: '+91 9823456781', email: 's.rao@medcare.in',    onDuty: true  },
    { id: 3, name: 'Dr. Arjun Mehta',   specialty: 'Orthopedics',  phone: '+91 9834567892', email: 'a.mehta@medcare.in', onDuty: false },
    { id: 4, name: 'Dr. Kavita Nair',   specialty: 'Pediatrics',   phone: '+91 9845678903', email: 'k.nair@medcare.in',  onDuty: true  },
  ];
  patients = [
    { id: 'P-1001', name: 'Priya Sharma',  dob: '1985-03-12', blood: 'O+', phone: '+91 9898765432', email: 'priya@email.com',  doctorId: 1, status: 'Active'    },
    { id: 'P-1002', name: 'Rajan Kumar',   dob: '1970-07-22', blood: 'A+', phone: '+91 9887654321', email: 'rajan@email.com',  doctorId: 2, status: 'Admitted'  },
    { id: 'P-1003', name: 'Meena Iyer',    dob: '1992-11-05', blood: 'B-', phone: '+91 9876543210', email: 'meena@email.com',  doctorId: 1, status: 'Active'    },
    { id: 'P-1004', name: 'Vivek Singh',   dob: '1960-01-30', blood: 'AB+',phone: '+91 9865432109', email: 'vivek@email.com',  doctorId: 3, status: 'Discharged'},
  ];
  appointments = [
    { id: 1, patientId: 'P-1001', doctorId: 1, date: TODAY,        time: '09:00', reason: 'Annual checkup',  status: 'Scheduled' },
    { id: 2, patientId: 'P-1002', doctorId: 2, date: TODAY,        time: '10:30', reason: 'MRI follow-up',   status: 'Completed' },
    { id: 3, patientId: 'P-1003', doctorId: 1, date: '2026-05-20', time: '11:00', reason: 'ECG review',      status: 'Scheduled' },
  ];
  bills = [
    { id: 'B-001', patientId: 'P-1001', amount: 3500,  type: 'Consultation', status: 'Paid',    date: TODAY        },
    { id: 'B-002', patientId: 'P-1002', amount: 45000, type: 'Surgery',      status: 'Pending', date: TODAY        },
    { id: 'B-003', patientId: 'P-1003', amount: 1200,  type: 'Lab Tests',    status: 'Pending', date: '2026-05-17' },
  ];
  addActivity('System started');
  addActivity('3 patients checked in today');
}

// ── Navigation ───────────────────────────────────────────────────────
function showPage(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  el.classList.add('active');
  const renders = {
    dashboard:    renderDashboard,
    patients:     renderPatients,
    appointments: renderAppts,
    doctors:      renderDoctors,
    billing:      renderBills,
  };
  if (renders[page]) renders[page]();
}

// ── Modal helpers ────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openPatientModal() {
  document.getElementById('pt-edit-id').value   = '';
  document.getElementById('pt-modal-title').textContent = 'Add Patient';
  ['pt-name','pt-dob','pt-phone','pt-email'].forEach(id => document.getElementById(id).value = '');
  const dobEl = document.getElementById('pt-dob');
  if (dobEl) { dobEl.max = getLocalToday(); dobEl.min = '1900-01-01'; }
  document.getElementById('pt-blood').value  = 'A+';
  document.getElementById('pt-status').value = 'Active';
  populateDoctorSelect('pt-doctor');
  openModal('patient-modal');
}
function openApptModal() {
  ['ap-date','ap-time','ap-reason'].forEach(id => document.getElementById(id).value = '');
  const apDateEl = document.getElementById('ap-date');
  if (apDateEl) apDateEl.min = getLocalToday();
  populatePatientSelect('ap-patient');
  populateDoctorSelect('ap-doctor');
  openModal('appt-modal');
}
function openBillModal() {
  document.getElementById('bl-amount').value = '';
  populatePatientSelect('bl-patient');
  openModal('bill-modal');
}

// ── Select population ────────────────────────────────────────────────
function populateDoctorSelect(selId) {
  const s = document.getElementById(selId);
  s.innerHTML = '';
  doctors.forEach(d => {
    const o = document.createElement('option');
    o.value = d.id;
    o.textContent = d.name + ' — ' + d.specialty;
    s.appendChild(o);
  });
}
function populatePatientSelect(selId) {
  const s = document.getElementById(selId);
  s.innerHTML = '';
  patients.forEach(p => {
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = p.name + ' (' + p.id + ')';
    s.appendChild(o);
  });
}

// ── Helpers ──────────────────────────────────────────────────────────
function initials(name) { return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(); }
function avatarEl(name, i) {
  const cls = AVATAR_CLASSES[(i || 0) % 5];
  return `<div class="avatar ${cls}" style="width:32px;height:32px;font-size:12px;display:inline-flex;">${initials(name)}</div>`;
}
function calcAge(dob) {
  if (!dob) return '—';
  const today = getLocalToday();
  if (dob > today) return '—';
  const [by, bm, bd] = dob.split('-').map(Number);
  if (!by || !bm || !bd) return '—';
  const now = new Date();
  let years = now.getFullYear() - by;
  let months = (now.getMonth() + 1) - bm;
  if (now.getDate() < bd) months--;
  if (months < 0) { years--; months += 12; }
  if (years < 0) return '—';
  if (years === 0) return months <= 0 ? 'Newborn' : `${months} mos`;
  return `${years} yrs`;
}
function getDoctorName(id) { const d = doctors.find(x => x.id == id); return d ? d.name : '—'; }
function getPatientName(id) { const p = patients.find(x => x.id === id); return p ? p.name : '—'; }

function statusBadge(s) {
  const map = {
    'Active': 'badge-green', 'Admitted': 'badge-blue', 'Discharged': 'badge-gray',
    'Scheduled': 'badge-blue', 'Completed': 'badge-green', 'Cancelled': 'badge-red',
    'Paid': 'badge-green', 'Pending': 'badge-amber',
  };
  return `<span class="badge ${map[s] || 'badge-gray'}">${s}</span>`;
}

function addActivity(msg) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  activityLog.unshift({ msg, time });
  if (activityLog.length > 10) activityLog.pop();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── CRUD: Patients ───────────────────────────────────────────────────
function savePatient() {
  const name = document.getElementById('pt-name').value.replace(/\s+/g, ' ').trim();
  if (name.length < 2 || !/[a-zA-Z]/.test(name)) {
    showToast('Please enter a valid patient full name (at least 2 letters).');
    return;
  }
  const editId   = document.getElementById('pt-edit-id').value;
  const dob      = document.getElementById('pt-dob').value;
  const today    = getLocalToday();
  if (!dob) {
    showToast('Date of birth is required.');
    return;
  }
  if (dob > today || dob < '1900-01-01') {
    showToast(`Date of birth must be between 1900-01-01 and ${today}.`);
    return;
  }
  const blood    = document.getElementById('pt-blood').value;
  const phone    = document.getElementById('pt-phone').value.replace(/\s+/g, ' ').trim();
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (!/^[+]?[0-9\s\-()]+$/.test(phone) || digits.length < 7 || digits.length > 15) {
      showToast('Please enter a valid phone number (7–15 digits).');
      return;
    }
  }
  const email    = document.getElementById('pt-email').value.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.');
    return;
  }
  const doctorId = parseInt(document.getElementById('pt-doctor').value);
  const status   = document.getElementById('pt-status').value;

  if (editId) {
    const p = patients.find(x => x.id === editId);
    if (p) Object.assign(p, { name, dob, blood, phone, email, doctorId, status });
    addActivity('Patient updated: ' + name);
    showToast('Patient updated successfully');
  } else {
    patients.push({ id: 'P-' + nextPtId++, name, dob, blood, phone, email, doctorId, status });
    addActivity('Patient added: ' + name);
    showToast('Patient added successfully');
  }
  closeModal('patient-modal');
  renderPatients();
  updateMetrics();
}

function editPatient(id) {
  const p = patients.find(x => x.id === id);
  if (!p) return;
  populateDoctorSelect('pt-doctor');
  const dobEl = document.getElementById('pt-dob');
  if (dobEl) { dobEl.max = getLocalToday(); dobEl.min = '1900-01-01'; }
  document.getElementById('pt-edit-id').value   = p.id;
  document.getElementById('pt-modal-title').textContent = 'Edit Patient';
  document.getElementById('pt-name').value   = p.name;
  document.getElementById('pt-dob').value    = p.dob;
  document.getElementById('pt-blood').value  = p.blood;
  document.getElementById('pt-phone').value  = p.phone;
  document.getElementById('pt-email').value  = p.email || '';
  document.getElementById('pt-doctor').value = p.doctorId;
  document.getElementById('pt-status').value = p.status;
  openModal('patient-modal');
}

function deletePatient(id) {
  if (!confirm('Delete this patient? This cannot be undone.')) return;
  const p = patients.find(x => x.id === id);
  patients = patients.filter(x => x.id !== id);
  addActivity('Patient removed: ' + (p ? p.name : id));
  showToast('Patient deleted');
  renderPatients();
  updateMetrics();
}

function renderPatients() {
  const q  = (document.getElementById('pt-search') || { value: '' }).value.toLowerCase();
  const rows = patients.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  const tb   = document.getElementById('patients-tbody');
  if (!rows.length) { tb.innerHTML = `<tr><td colspan="7" class="empty">No patients found</td></tr>`; return; }
  tb.innerHTML = rows.map((p, i) => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:8px">${avatarEl(p.name, i)}
        <div><div style="font-weight:600">${p.name}</div><div style="font-size:11px;color:#a0aec0">${p.email || p.phone}</div></div></div></td>
      <td><span style="font-family:monospace;font-size:12px">${p.id}</span></td>
      <td>${calcAge(p.dob)}</td>
      <td><span class="badge badge-gray">${p.blood}</span></td>
      <td style="font-size:12px;color:#718096">${getDoctorName(p.doctorId)}</td>
      <td>${statusBadge(p.status)}</td>
      <td style="white-space:nowrap">
        <button class="btn btn-sm" onclick="editPatient('${p.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deletePatient('${p.id}')">Delete</button>
      </td>
    </tr>`).join('');
}

// ── CRUD: Appointments ───────────────────────────────────────────────
function saveAppt() {
  const pid    = document.getElementById('ap-patient').value;
  const did    = parseInt(document.getElementById('ap-doctor').value);
  const date   = document.getElementById('ap-date').value;
  const time   = document.getElementById('ap-time').value;
  const reason = document.getElementById('ap-reason').value.trim();
  const today  = getLocalToday();
  if (!pid || !date || !time) { showToast('Patient, date, and time are required.'); return; }
  if (date < today) { showToast('Appointment date cannot be in the past.'); return; }
  const clash = appointments.find(a => a.doctorId === did && a.date === date && a.time === time && a.status === 'Scheduled');
  if (clash) { showToast(`${getDoctorName(did)} already has a scheduled appointment at ${time} on ${date}.`); return; }
  appointments.push({ id: nextApptId++, patientId: pid, doctorId: did, date, time, reason, status: 'Scheduled' });
  addActivity('Appointment booked: ' + getPatientName(pid));
  showToast('Appointment booked');
  closeModal('appt-modal');
  renderAppts();
  updateMetrics();
}

function updateApptStatus(id, status) {
  const a = appointments.find(x => x.id === id);
  if (a) { a.status = status; addActivity(`Appointment ${status.toLowerCase()}: ${getPatientName(a.patientId)}`); }
  renderAppts();
  updateMetrics();
  showToast('Status updated to ' + status);
}

function renderAppts() {
  const tb = document.getElementById('appts-tbody');
  const sorted = [...appointments].sort((a, b) => (a.date + a.time) > (b.date + b.time) ? 1 : -1);
  if (!sorted.length) { tb.innerHTML = `<tr><td colspan="7" class="empty">No appointments</td></tr>`; return; }
  tb.innerHTML = sorted.map(a => `
    <tr>
      <td style="font-weight:500">${getPatientName(a.patientId)}</td>
      <td style="font-size:12px;color:#718096">${getDoctorName(a.doctorId)}</td>
      <td>${a.date}</td>
      <td>${a.time}</td>
      <td style="font-size:12px;color:#718096;max-width:140px">${a.reason || '—'}</td>
      <td>${statusBadge(a.status)}</td>
      <td style="white-space:nowrap">
        ${a.status === 'Scheduled' ? `
          <button class="btn btn-sm btn-success" onclick="updateApptStatus(${a.id},'Completed')">Complete</button>
          <button class="btn btn-sm btn-danger"  onclick="updateApptStatus(${a.id},'Cancelled')">Cancel</button>` : '—'}
      </td>
    </tr>`).join('');
}

// ── CRUD: Doctors ─────────────────────────────────────────────────────
function saveDoctor() {
  const name = document.getElementById('dr-name').value.replace(/\s+/g, ' ').trim();
  const spec = document.getElementById('dr-spec').value.replace(/\s+/g, ' ').trim();
  if (name.length < 2 || !/[a-zA-Z]/.test(name) || spec.length < 2) {
    showToast('Valid doctor name and specialty are required.');
    return;
  }
  const phone  = document.getElementById('dr-phone').value.replace(/\s+/g, ' ').trim();
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (!/^[+]?[0-9\s\-()]+$/.test(phone) || digits.length < 7 || digits.length > 15) {
      showToast('Please enter a valid phone number (7–15 digits).');
      return;
    }
  }
  const email  = document.getElementById('dr-email').value.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.');
    return;
  }
  const onDuty = document.getElementById('dr-duty').value === 'true';
  doctors.push({ id: doctors.length + 1, name, specialty: spec, phone, email, onDuty });
  addActivity('Doctor added: ' + name);
  showToast('Doctor added');
  ['dr-name','dr-spec','dr-phone','dr-email'].forEach(id => document.getElementById(id).value = '');
  closeModal('doctor-modal');
  renderDoctors();
  updateMetrics();
}

function toggleDuty(id) {
  const d = doctors.find(x => x.id === id);
  if (d) { d.onDuty = !d.onDuty; addActivity(`${d.name} marked ${d.onDuty ? 'on' : 'off'} duty`); }
  renderDoctors();
  updateMetrics();
}

function renderDoctors() {
  const g = document.getElementById('doctors-grid');
  g.innerHTML = doctors.map((d, i) => `
    <div class="doctor-card">
      <div class="avatar ${AVATAR_CLASSES[i % 5]}" style="width:50px;height:50px;font-size:16px;font-weight:700;margin:0 auto 10px;">${initials(d.name)}</div>
      <div class="doctor-name">${d.name}</div>
      <div class="doctor-spec">${d.specialty}</div>
      ${statusBadge(d.onDuty ? 'Active' : 'Discharged').replace('Active','On Duty').replace('Discharged','Off Duty')}
      <div class="doctor-contact">${d.phone}</div>
      <div class="doctor-contact">${d.email}</div>
      <div style="margin-top:12px">
        <button class="btn btn-sm" onclick="toggleDuty(${d.id})">${d.onDuty ? 'Mark Off Duty' : 'Mark On Duty'}</button>
      </div>
    </div>`).join('');
}

// ── CRUD: Billing ─────────────────────────────────────────────────────
function saveBill() {
  const pid    = document.getElementById('bl-patient').value;
  const amount = parseFloat(document.getElementById('bl-amount').value);
  const type   = document.getElementById('bl-type').value;
  if (!pid || isNaN(amount) || amount <= 0 || amount > 10000000) {
    showToast('Please select a patient and enter a valid bill amount.');
    return;
  }
  bills.push({ id: 'B-00' + nextBillId++, patientId: pid, amount, type, status: 'Pending', date: TODAY });
  addActivity('Bill created: ₹' + amount.toLocaleString('en-IN') + ' for ' + getPatientName(pid));
  showToast('Bill created');
  document.getElementById('bl-amount').value = '';
  closeModal('bill-modal');
  renderBills();
  updateMetrics();
}

function markPaid(id) {
  const b = bills.find(x => x.id === id);
  if (b) { b.status = 'Paid'; addActivity('Bill paid: ' + b.id); }
  renderBills();
  updateMetrics();
  showToast('Bill marked as paid');
}

function renderBills() {
  const tb = document.getElementById('bills-tbody');
  if (!bills.length) { tb.innerHTML = `<tr><td colspan="7" class="empty">No bills</td></tr>`; return; }
  tb.innerHTML = [...bills].reverse().map(b => `
    <tr>
      <td><span style="font-family:monospace;font-size:12px">${b.id}</span></td>
      <td style="font-weight:500">${getPatientName(b.patientId)}</td>
      <td>${b.date}</td>
      <td style="font-weight:600">₹${b.amount.toLocaleString('en-IN')}</td>
      <td><span class="badge badge-gray">${b.type}</span></td>
      <td>${statusBadge(b.status)}</td>
      <td>${b.status === 'Pending' ? `<button class="btn btn-sm btn-success" onclick="markPaid('${b.id}')">Mark Paid</button>` : '—'}</td>
    </tr>`).join('');
}

// ── Dashboard ────────────────────────────────────────────────────────
function updateMetrics() {
  document.getElementById('m-patients').textContent = patients.length;
  const todayA  = appointments.filter(a => a.date === TODAY);
  const pending = todayA.filter(a => a.status === 'Scheduled').length;
  document.getElementById('m-appts').textContent    = todayA.length;
  document.getElementById('m-appts-sub').textContent = pending + ' pending';
  document.getElementById('m-doctors').textContent  = doctors.filter(d => d.onDuty).length;
  const unpaid = bills.filter(b => b.status === 'Pending');
  document.getElementById('m-bills').textContent    = unpaid.length;
  const total  = unpaid.reduce((s, b) => s + b.amount, 0);
  document.getElementById('m-bills-amt').textContent = '₹' + total.toLocaleString('en-IN') + ' outstanding';
}

function renderDashboard() {
  updateMetrics();

  // Today's appointments
  const todayAppts = appointments.filter(a => a.date === TODAY);
  const ta = document.getElementById('today-appts');
  ta.innerHTML = todayAppts.length
    ? todayAppts.map(a => `
        <div class="appt-item">
          <div class="appt-time">${a.time}</div>
          <div style="flex:1"><div class="appt-name">${getPatientName(a.patientId)}</div><div class="appt-doctor">${getDoctorName(a.doctorId)}</div></div>
          ${statusBadge(a.status)}
        </div>`).join('')
    : '<p class="empty">No appointments today</p>';

  // Activity log
  const al = document.getElementById('activity-log');
  al.innerHTML = activityLog.length
    ? activityLog.map(a => `
        <div class="appt-item">
          <div class="appt-time">${a.time}</div>
          <div class="appt-doctor" style="font-size:12px">${a.msg}</div>
        </div>`).join('')
    : '<p class="empty">No recent activity</p>';

  // Admissions bar chart
  const months  = ['Jan','Feb','Mar','Apr','May','Jun'].slice(0, 6);
  const admData = [18, 24, 21, 28, 26, patients.length];
  if (admChart) admChart.destroy();
  admChart = new Chart(document.getElementById('admChart'), {
    type: 'bar',
    data: { labels: months, datasets: [{ label: 'Admissions', data: admData, backgroundColor: '#0d9488', borderRadius: 6, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 10 } } } }
  });

  // Department doughnut chart
  const depts = {};
  patients.forEach(p => {
    const d = doctors.find(x => x.id == p.doctorId);
    if (d) depts[d.specialty] = (depts[d.specialty] || 0) + 1;
  });
  const dkeys = Object.keys(depts);
  const COLORS = ['#0d9488','#2563eb','#16a34a','#d97706','#7c3aed'];
  if (deptChart) deptChart.destroy();
  deptChart = new Chart(document.getElementById('deptChart'), {
    type: 'doughnut',
    data: { labels: dkeys, datasets: [{ data: dkeys.map(k => depts[k]), backgroundColor: COLORS.slice(0, dkeys.length), borderWidth: 2, borderColor: 'transparent' }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 10, padding: 8 } } } }
  });
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', cur);
  localStorage.setItem('medcare-theme', cur);
  showToast('Switched to ' + cur + ' theme');
}

// ── Init ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('medcare-theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  document.getElementById('today-label').textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  initData();
  renderDashboard();
  renderPatients();
});
