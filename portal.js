const supabaseUrl = 'https://ivphxduuzemdmkjdgeqy.supabase.co';
const supabaseKey = 'sb_publishable_Eh44ol3xJHhoxPNOS6Tueg_SzHFTi5u';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

let allCases = [];

async function initPortal() {
  const { data: { session } } = await db.auth.getSession();

  if (!session) {
    window.location.href = 'auth.html';
    return;
  }

  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'officer') {
    window.location.href = 'resident.html';
    return;
  }

  document.getElementById('officerNameDisplay').innerText = profile.full_name || session.user.email;
  loadCases();
}

async function loadCases() {
  const { data, error } = await db
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    document.getElementById('casesTableBody').innerHTML = `
      <tr><td colspan="7" class="loading-cell" style="color:var(--danger);">Error loading cases: ${error.message}</td></tr>
    `;
    return;
  }

  allCases = data || [];
  renderCases(allCases);
}

function renderCases(cases) {
  const tbody = document.getElementById('casesTableBody');
  tbody.innerHTML = '';

  if (cases.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="loading-cell">No case records found.</td></tr>`;
    return;
  }

  cases.forEach((c) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td class="docket-text">${c.docket}</td>
      <td>
        <strong>${c.complainant}</strong>
        <span class="sub-email">${c.complainant_email || 'No email'}</span>
      </td>
      <td>${c.respondent}</td>
      <td style="text-transform: capitalize;">${c.dispute_type || 'Other'}</td>
      <td>
        <select class="status-select" data-id="${c.id}">
          <option value="Pending Approval" ${c.status === 'Pending Approval' ? 'selected' : ''}>Pending Approval</option>
          <option value="Approved / For Mediation" ${c.status === 'Approved / For Mediation' ? 'selected' : ''}>Approved / For Mediation</option>
          <option value="Conciliation (Pangkat)" ${c.status === 'Conciliation (Pangkat)' ? 'selected' : ''}>Conciliation (Pangkat)</option>
          <option value="Settled" ${c.status === 'Settled' ? 'selected' : ''}>Settled</option>
          <option value="CFA Issued" ${c.status === 'CFA Issued' ? 'selected' : ''}>CFA Issued</option>
        </select>
      </td>
      <td>
        <input type="date" class="date-input" data-id="${c.id}" value="${c.hearing_date || ''}" />
      </td>
      <td>
        <button type="button" class="btn-view">View Details</button>
      </td>
    `;

    tr.querySelector('.status-select').addEventListener('change', async (e) => {
      const newStatus = e.target.value;
      c.status = newStatus;

      const { error } = await db.from('cases').update({ status: newStatus }).eq('id', c.id);

      if (error) {
        alert('Failed to update status: ' + error.message);
        return;
      }

      if (newStatus === 'Approved / For Mediation' && c.complainant_email) {
        const subject = encodeURIComponent(`LuponResolve Case Update: ${c.docket}`);
        const body = encodeURIComponent(
          `Maayong adlaw ${c.complainant},\n\n` +
          `Ang imong reklamo (Docket No: ${c.docket}) kay APPROVED / FOR MEDIATION na.\n` +
          `Hearing Date: ${c.hearing_date || 'To be scheduled'}\n\n` +
          `Daghang salamat,\nBarangay Sumilihon Lupon Tagapamayapa`
        );
        window.open(
          `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(c.complainant_email)}&su=${subject}&body=${body}`,
          '_blank'
        );
      }
    });

    tr.querySelector('.date-input').addEventListener('change', async (e) => {
      const newDate = e.target.value || null;
      c.hearing_date = newDate;
      await db.from('cases').update({ hearing_date: newDate }).eq('id', c.id);
    });

    tr.querySelector('.btn-view').addEventListener('click', () => {
      openCaseDetailsModal(c);
    });

    tbody.appendChild(tr);
  });
}

function openCaseDetailsModal(c) {
  document.getElementById('detailDocket').innerText = c.docket;
  document.getElementById('detailEmail').innerText = c.complainant_email || 'N/A';
  document.getElementById('detailDate').innerText = c.incident_date || 'N/A';
  document.getElementById('detailFacts').innerText = c.narrative || 'No details provided.';

  const evidenceBox = document.getElementById('detailEvidenceBox');
  const evidenceLink = document.getElementById('detailEvidenceLink');
  if (c.evidence_url) {
    evidenceBox.style.display = 'block';
    evidenceLink.href = c.evidence_url;
  } else {
    evidenceBox.style.display = 'none';
  }

  document.getElementById('caseDetailsModal').style.display = 'flex';
}

document.getElementById('closeCaseModalBtn').addEventListener('click', () => {
  document.getElementById('caseDetailsModal').style.display = 'none';
});

document.getElementById('okCaseModalBtn').addEventListener('click', () => {
  document.getElementById('caseDetailsModal').style.display = 'none';
});

function applyFilters() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;

  const filtered = allCases.filter((c) => {
    const matchesSearch =
      (c.docket && c.docket.toLowerCase().includes(query)) ||
      (c.complainant && c.complainant.toLowerCase().includes(query)) ||
      (c.respondent && c.respondent.toLowerCase().includes(query));

    const matchesStatus = status === 'All' || c.status === status;
    return matchesSearch && matchesStatus;
  });

  renderCases(filtered);
}

document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('statusFilter').addEventListener('change', applyFilters);

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await db.auth.signOut();
  window.location.href = 'auth.html';
});

initPortal();