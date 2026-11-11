const supabaseUrl = 'https://ivphxduuzemdmkjdgeqy.supabase.co';
const supabaseKey = 'sb_publishable_Eh44ol3xJHhoxPNOS6Tueg_SzHFTi5u';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

let cachedCases = [];
const caseTableBody = document.getElementById('caseTableBody');

async function verifyOfficerSession() {
  console.log("1. Checking auth session...");
  const { data: { session }, error: sessionErr } = await db.auth.getSession();

  if (sessionErr) {
    console.error("Session error:", sessionErr);
    return;
  }

  if (!session) {
    console.warn("Walay session nakit-an. Redirecting to auth.html...");
    alert("Walay active login session. Palihug pag-login una.");
    window.location.href = 'auth.html';
    return;
  }

  console.log("2. Session found! User ID:", session.user.id);

  const { data: profile, error: profileErr } = await db
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle();

  if (profileErr) {
    console.error("Profile query error:", profileErr);
  }

  console.log("3. User profile data:", profile);

  if (!profile || profile.role !== 'officer') {
    console.warn("Role is NOT officer. Actual role:", profile?.role);
    alert('Access Restricted: Only Barangay Officers and Lupon members are permitted.');
    window.location.href = 'index.html';
    return;
  }

  console.log("4. Officer verified! Fetching cases...");
  fetchCases();
}

async function fetchCases() {
  caseTableBody.innerHTML = `<tr><td colspan="8" class="cell-message muted">Checking database for cases...</td></tr>`;

  const { data, error } = await db
    .from('cases')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error("Cases fetch error:", error);
    caseTableBody.innerHTML = `<tr><td colspan="8" class="cell-message error">Error: ${error.message}</td></tr>`;
    return;
  }

  console.log("5. Cases loaded:", data);
  cachedCases = data || [];
  renderTable(cachedCases);
}

function renderTable(cases) {
  caseTableBody.innerHTML = '';

  if (!cases || cases.length === 0) {
    caseTableBody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <strong>No complaints filed yet.</strong>
            <p style="font-size: 0.85rem; margin-top: 0.25rem;">When residents submit complaints through the filing form, they will appear here automatically.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  cases.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${item.docket || '—'}</strong></td>
      <td>${item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
      <td>${item.complainant || '—'}</td>
      <td>${item.respondent || '—'}</td>
      <td class="capitalize">${item.dispute_type || '—'}</td>
      <td>
        <select class="status-select" onchange="updateStatus(${item.id}, this.value)">
          <option value="Under Review" ${item.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
          <option value="Accepted / For Hearing" ${item.status === 'Accepted / For Hearing' ? 'selected' : ''}>Accepted / For Hearing</option>
          <option value="Mediation Scheduled" ${item.status === 'Mediation Scheduled' ? 'selected' : ''}>Mediation Scheduled</option>
          <option value="Amicably Settled" ${item.status === 'Amicably Settled' ? 'selected' : ''}>Amicably Settled</option>
          <option value="Repudiated / Escalated" ${item.status === 'Repudiated / Escalated' ? 'selected' : ''}>Repudiated / Escalated</option>
        </select>
      </td>
      <td>
        <input type="date" class="hearing-input" value="${item.hearing_date || ''}" onchange="updateHearing(${item.id}, this.value)" />
      </td>
      <td>
        <button class="btn-action" type="button" onclick="viewDetails(${index})">Facts</button>
        <button class="btn-action" type="button" onclick="printSummons(${index})">Summons</button>
      </td>
    `;
    caseTableBody.appendChild(row);
  });
}

window.updateStatus = async function(id, newStatus) {
  const { error } = await db.from('cases').update({ status: newStatus }).eq('id', id);
  if (error) alert('Error updating status: ' + error.message);
};

window.updateHearing = async function(id, newDate) {
  const { error } = await db.from('cases').update({ hearing_date: newDate, status: 'Mediation Scheduled' }).eq('id', id);
  if (error) {
    alert('Error updating hearing date: ' + error.message);
  } else {
    fetchCases();
  }
};

window.viewDetails = function(index) {
  const c = cachedCases[index];
  alert(`Docket: ${c.docket}\nIncident Date: ${c.incident_date}\n\nFacts/Narrative:\n${c.narrative}`);
};

window.printSummons = function(index) {
  const c = cachedCases[index];

  document.getElementById('printComplainant').innerText = c.complainant || '';
  document.getElementById('printComplainantAddress').innerText = c.complainant_purok || 'Sumilihon';
  document.getElementById('printRespondent').innerText = c.respondent || '';
  document.getElementById('printRespondentAddress').innerText = c.respondent_purok || 'Sumilihon';
  document.getElementById('printDocket').innerText = c.docket || '';
  document.getElementById('printDispute').innerText = (c.dispute_type || '').toUpperCase();
  document.getElementById('printHearingDate').innerText = c.hearing_date
    ? new Date(c.hearing_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'NOT YET ASSIGNED';

  window.print();
};

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await db.auth.signOut();
    window.location.href = 'auth.html';
  });
}

// Daganon dayon sa pagsugod
verifyOfficerSession();