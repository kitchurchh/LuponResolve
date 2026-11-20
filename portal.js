const supabaseUrl = 'https://ivphxduuzemdmkjdgeqy.supabase.co';
const supabaseKey = 'sb_publishable_Eh44ol3xJHhoxPNOS6Tueg_SzHFTi5u';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

let cachedCases = [];
const caseTableBody = document.getElementById('caseTableBody');

async function verifyOfficerSession() {
  const { data: { session } } = await db.auth.getSession();

  if (!session) {
    window.location.href = 'auth.html';
    return;
  }

  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'officer') {
    alert('Access Restricted: Only Barangay Officers and Lupon members are permitted.');
    window.location.href = 'index.html';
    return;
  }

  fetchCases();
}

async function fetchCases() {
  caseTableBody.innerHTML = `<tr><td colspan="8" class="cell-message muted">Checking database for cases...</td></tr>`;

  const { data, error } = await db
    .from('cases')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    caseTableBody.innerHTML = `<tr><td colspan="8" class="cell-message error">Error: ${error.message}</td></tr>`;
    return;
  }

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
    const evidenceButton = item.evidence_url
      ? `<a href="${item.evidence_url}" target="_blank" class="btn-action" style="text-decoration:none;">Photo</a>`
      : '';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${item.docket || '—'}</strong></td>
      <td>${item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
      <td>${item.complainant || '—'}<br><small style="color:var(--muted);">${item.complainant_email || ''}</small></td>
      <td>${item.respondent || '—'}</td>
      <td class="capitalize">${item.dispute_type || '—'}</td>
      <td>
        <select class="status-select" onchange="updateStatus(${item.id}, this.value, ${index})">
          <option value="Pending Approval" ${item.status === 'Pending Approval' ? 'selected' : ''}>Pending Approval</option>
          <option value="Accepted / For Hearing" ${item.status === 'Accepted / For Hearing' ? 'selected' : ''}>Accepted / For Hearing</option>
          <option value="Mediation Scheduled" ${item.status === 'Mediation Scheduled' ? 'selected' : ''}>Mediation Scheduled</option>
          <option value="Amicably Settled" ${item.status === 'Amicably Settled' ? 'selected' : ''}>Amicably Settled</option>
          <option value="Repudiated / Escalated" ${item.status === 'Repudiated / Escalated' ? 'selected' : ''}>Repudiated / Escalated</option>
        </select>
      </td>
      <td>
        <input type="date" class="hearing-input" value="${item.hearing_date || ''}" onchange="updateHearing(${item.id}, this.value, ${index})" />
      </td>
      <td>
        <button class="btn-action" type="button" onclick="viewDetails(${index})">Facts</button>
        ${evidenceButton}
        <button class="btn-action" type="button" onclick="printSummons(${index})">Summons</button>
      </td>
    `;
    caseTableBody.appendChild(row);
  });
}

// Send Gmail Notification when case is Approved
function notifyComplainantViaGmail(caseItem) {
  if (!caseItem.complainant_email) return;

  const subject = encodeURIComponent(`LuponResolve: Approved na ang imong Reklamo (${caseItem.docket})`);
  const body = encodeURIComponent(
    `Maayong adlaw ${caseItem.complainant},\n\n` +
    `Kini usa ka opisyal nga pahibalo gikan sa Barangay Sumilihon Lupon Tagapamayapa.\n\n` +
    `APPROVED na ang imong gisumite nga reklamo ubos sa Docket Number: ${caseItem.docket}.\n` +
    `Mahimo na ka karon mag-create og Resident Account sa LuponResolve portal gamit kini nga Docket Number aron ma-monitor ang schedule sa imong hearing.\n\n` +
    `Daghang salamat,\nBarangay Lupon Secretary`
  );

  // Opens Gmail Compose pre-filled with the complainant's email and approval notice
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(caseItem.complainant_email)}&su=${subject}&body=${body}`;
  window.open(gmailUrl, '_blank');
}

window.updateStatus = async function(id, newStatus, index) {
  const { error } = await db.from('cases').update({ status: newStatus }).eq('id', id);
  if (error) {
    alert('Error updating status: ' + error.message);
    return;
  }

  const caseItem = cachedCases[index];
  caseItem.status = newStatus;

  if (newStatus === 'Accepted / For Hearing') {
    notifyComplainantViaGmail(caseItem);
  }
};

window.updateHearing = async function(id, newDate, index) {
  const { error } = await db
    .from('cases')
    .update({ hearing_date: newDate, status: 'Mediation Scheduled' })
    .eq('id', id);

  if (error) {
    alert('Error updating hearing date: ' + error.message);
  } else {
    fetchCases();
  }
};

window.viewDetails = function(index) {
  const c = cachedCases[index];
  alert(`Docket: ${c.docket}\nEmail: ${c.complainant_email || 'N/A'}\nIncident Date: ${c.incident_date}\n\nAsaysay/Facts:\n${c.narrative}`);
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

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await db.auth.signOut();
  window.location.href = 'auth.html';
});

verifyOfficerSession();