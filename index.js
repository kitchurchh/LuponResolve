document.getElementById('trackBtn').addEventListener('click', async function() {
  const input = document.getElementById('trackInput').value.trim();
  const resultBox = document.getElementById('statusResult');

  if (!input) {
    alert('Please enter a docket tracking number.');
    return;
  }

  resultBox.style.display = 'block';
  resultBox.innerHTML = '<p style="color:var(--muted);">Searching records...</p>';

  const { data, error } = await db
    .from('cases')
    .select('*')
    .ilike('docket', input)
    .maybeSingle();

  if (error) {
    resultBox.innerHTML = `<p style="color:red;">Error fetching record: ${error.message}</p>`;
    return;
  }

  if (data) {
    resultBox.innerHTML = `
      <h3 style="color:var(--primary); margin-bottom:0.5rem;">Case Found: ${data.docket}</h3>
      <p><strong>Status:</strong> <span style="background:#dbeafe; color:#1e40af; padding:2px 8px; border-radius:4px; font-weight:600;">${data.status}</span></p>
      <p><strong>Complainant:</strong> ${data.complainant}</p>
      <p><strong>Respondent:</strong> ${data.respondent}</p>
      <p><strong>Dispute Type:</strong> <span style="text-transform: capitalize;">${data.dispute_type}</span></p>
      <p><strong>Hearing Date:</strong> ${data.hearing_date ? new Date(data.hearing_date).toLocaleDateString() : '<em>Not yet scheduled</em>'}</p>
    `;
  } else {
    resultBox.innerHTML = `<p style="color:#dc2626; font-weight:600;">No record found for docket "${input}".</p>`;
  }
});