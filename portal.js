const correctPin = "1234";
let cachedCases = [];

const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const caseTableBody = document.getElementById('caseTableBody');

loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  if (document.getElementById('pinCode').value === correctPin) {
    loginView.style.display = 'none';
    dashboardView.style.display = 'block';
    fetchCases();
  } else {
    alert('Incorrect PIN.');
  }
});

logoutBtn.addEventListener('click', function() {
  dashboardView.style.display = 'none';
  loginView.style.display = 'block';
  document.getElementById('pinCode').value = '';
});

async function fetchCases() {
  caseTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem;">Loading records...</td></tr>`;

  const { data, error } = await db
    .from('cases')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    caseTableBody.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center;">Error: ${error.message}</td></tr>`;
    return;
  }

  cachedCases = data;
  renderTable(data);
}

function renderTable(cases) {
  caseTableBody.innerHTML = '';
  if (!cases || cases.length === 0) {
    caseTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--muted); padding:2rem;">No complaints found.</td></tr>`;
    return;
  }

  cases.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${item.docket}</strong></td>
      <td>${item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
      <td>${item.complainant}</td>
      <td>${item.respondent}</td>
      <td style="text-transform: capitalize;">${item.dispute_type}</td>
      <td>
        <select onchange="updateStatus(${item.id}, this.value)" style="padding:0.25rem; border-radius:4px; font-size:0.8rem;">
          <option value="Under Review" ${item.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
          <option value="Mediation Scheduled" ${item.status === 'Mediation Scheduled' ? 'selected' : ''}>Mediation Scheduled</option>
          <option value="Amicably Settled" ${item.status === 'Amicably Settled' ? 'selected' : ''}>Amicably Settled</option>
          <option value="Repudiated" ${item.status === 'Repudiated' ? 'selected' : ''}>Repudiated</option>
        </select>
      </td>
      <td>
        <input type="date" value="${item.hearing_date || ''}" onchange="updateHearing(${item.id}, this.value)" style="padding:0.2rem; font-size:0.8rem;" />
      </td>
      <td>
        <button onclick="viewDetails(${index})" style="background:none; border:none; color:var(--accent); cursor:pointer; text-decoration:underline; font-size:0.8rem; margin-right:5px;">Facts</button>
        <button onclick="printSummons(${index})" style="background:none; border:none; color:var(--accent); cursor:pointer; text-decoration:underline; font-size:0.8rem;">Summons</button>
      </td>
    `;
    caseTableBody.appendChild(row);
  });
}

window.updateStatus = async function(id, status) {
  await db.from('cases').update({ status }).eq('id', id);
};

window.updateHearing = async function(id, hearing_date) {
  await db.from('cases').update({ hearing_date, status: 'Mediation Scheduled' }).eq('id', id);
  fetchCases();
};

window.viewDetails = function(index) {
  const c = cachedCases[index];
  alert(`Docket: ${c.docket}\nDate: ${c.incident_date}\n\nFacts:\n${c.narrative}`);
};

window.printSummons = function(index) {
  const c = cachedCases[index];
  document.getElementById('printComplainant').innerText = c.complainant;
  document.getElementById('printComplainantAddress').innerText = c.complainant_purok || 'Sumilihon';
  document.getElementById('printRespondent').innerText = c.respondent;
  document.getElementById('printRespondentAddress').innerText = c.respondent_purok || 'Sumilihon';
  document.getElementById('printDocket').innerText = c.docket;
  document.getElementById('printDispute').innerText = (c.dispute_type || '').toUpperCase();
  document.getElementById('printHearingDate').innerText = c.hearing_date ? new Date(c.hearing_date).toLocaleDateString() : 'NOT YET SCHEDULED';

  window.print();
};