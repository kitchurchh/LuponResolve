const supabaseUrl = 'https://ivphxduuzemdmkjdgeqy.supabase.co';
const supabaseKey = 'sb_publishable_Eh44ol3xJHhoxPNOS6Tueg_SzHFTi5u';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

let currentSessionUser = null;

// Check user session & load profile
async function checkAuthSession() {
  const { data: { session } } = await db.auth.getSession();

  if (!session) {
    window.location.href = 'auth.html';
    return;
  }

  currentSessionUser = session.user;

  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  const fullName = profile?.full_name || session.user.email.split('@')[0];
  const role = profile?.role || 'resident';
  const purok = profile?.purok || 'Barangay Sumilihon';

  document.getElementById('navUserName').innerText = fullName;
  document.getElementById('userAvatar').innerText = fullName.charAt(0);

  document.getElementById('dropFullName').innerText = fullName;
  document.getElementById('dropEmail').innerText = session.user.email;
  document.getElementById('dropRole').innerText = role;

  document.getElementById('settingsEmail').innerText = session.user.email;
  document.getElementById('settingsRole').innerText = role;
  document.getElementById('settingsPurok').innerText = purok;

  if (role === 'officer') {
    document.getElementById('officerPortalLink').style.display = 'inline-block';
    document.getElementById('officerCard').style.display = 'flex';
  } else {
    document.getElementById('officerPortalLink').style.display = 'none';
    document.getElementById('officerCard').style.display = 'none';
    fetchResidentCaseAlerts(session.user.id);
  }
}

// Fetch case alerts for resident view
async function fetchResidentCaseAlerts(userId) {
  const { data: userCases } = await db
    .from('cases')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: false });

  const alertContainer = document.getElementById('residentAlertContainer');

  if (userCases && userCases.length > 0) {
    let alertsHTML = '';

    userCases.forEach(c => {
      if (c.status === 'Accepted / For Hearing' || c.status === 'Mediation Scheduled') {
        alertsHTML += `
          <div class="alert-banner accepted">
            <div>
              <strong>✅ Case Accepted (${c.docket})</strong>
              <p style="font-size:0.85rem; margin:0.15rem 0 0;">
                Your complaint regarding "${c.dispute_type}" has been accepted! 
                Hearing Schedule: <strong>${c.hearing_date ? new Date(c.hearing_date).toLocaleDateString() : 'To be announced'}</strong>
              </p>
            </div>
            <button type="button" class="card-btn primary" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="trackSpecificCase('${c.docket}')">View</button>
          </div>
        `;
      } else if (c.status === 'Repudiated' || c.status === 'Repudiated / Escalated') {
        alertsHTML += `
          <div class="alert-banner rejected">
            <div>
              <strong>⚠️ Case Not Settled / Escalated (${c.docket})</strong>
              <p style="font-size:0.85rem; margin:0.15rem 0 0;">
                Your complaint for "${c.dispute_type}" was repudiated or endorsed for Certificate to File Action (CFA).
              </p>
            </div>
            <button type="button" class="card-btn" style="padding:0.4rem 0.8rem; font-size:0.8rem; border-color:var(--danger); color:var(--danger);" onclick="trackSpecificCase('${c.docket}')">View</button>
          </div>
        `;
      }
    });

    if (alertsHTML) {
      alertContainer.innerHTML = alertsHTML;
      alertContainer.style.display = 'block';
    }
  }
}

// Track case via alert shortcut
window.trackSpecificCase = function(docketNo) {
  document.getElementById('trackInput').value = docketNo;
  document.getElementById('trackBtn').click();
  window.scrollTo({ top: 350, behavior: 'smooth' });
};

// Profile Dropdown Handling
const profileDropdownBtn = document.getElementById('profileDropdownBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

profileDropdownBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const isVisible = dropdownMenu.style.display === 'block';
  dropdownMenu.style.display = isVisible ? 'none' : 'block';
});

window.addEventListener('click', (e) => {
  if (!dropdownMenu.contains(e.target) && !profileDropdownBtn.contains(e.target)) {
    dropdownMenu.style.display = 'none';
  }
});

// Settings Modal Handling
const settingsModal = document.getElementById('settingsModal');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const changePasswordForm = document.getElementById('changePasswordForm');
const savePwdBtn = document.getElementById('savePwdBtn');

openSettingsBtn.addEventListener('click', () => {
  dropdownMenu.style.display = 'none';
  settingsModal.style.display = 'flex';
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'none';
  changePasswordForm.reset();
});

changePasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPwd = document.getElementById('newPassword').value;
  const confirmPwd = document.getElementById('confirmNewPassword').value;

  if (newPwd !== confirmPwd) {
    alert('Passwords do not match. Please verify.');
    return;
  }

  savePwdBtn.disabled = true;
  savePwdBtn.innerText = 'Updating password...';

  const { error } = await db.auth.updateUser({
    password: newPwd
  });

  if (error) {
    alert('Failed to update password: ' + error.message);
    savePwdBtn.disabled = false;
    savePwdBtn.innerText = 'Save New Password';
  } else {
    alert('Password successfully updated! Please use this password on your next login.');
    settingsModal.style.display = 'none';
    changePasswordForm.reset();
    savePwdBtn.disabled = false;
    savePwdBtn.innerText = 'Save New Password';
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await db.auth.signOut();
  window.location.href = 'auth.html';
});

// Case Tracking Action
document.getElementById('trackBtn').addEventListener('click', async function() {
  const input = document.getElementById('trackInput').value.trim();
  const resultBox = document.getElementById('statusResult');

  if (!input) {
    alert('Please enter a docket tracking number.');
    return;
  }

  resultBox.style.display = 'block';
  resultBox.innerHTML = '<p style="color:var(--muted); text-align:center;">Searching case records from database...</p>';

  const { data, error } = await db
    .from('cases')
    .select('*')
    .ilike('docket', input)
    .maybeSingle();

  if (error) {
    resultBox.innerHTML = `<p style="color:var(--danger); font-weight:600;">Error: ${error.message}</p>`;
    return;
  }

  if (data) {
    let acceptedNotice = '';
    if (data.status === 'Accepted / For Hearing' || data.status === 'Mediation Scheduled') {
      acceptedNotice = `
        <div style="background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 0.85rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.5rem;">🎉</span>
          <div>
            <strong style="color: #166534; font-size: 0.95rem;">Complaint Formally Accepted!</strong>
            <p style="color: #15803d; font-size: 0.85rem; margin: 0;">
              Your filed dispute has been accepted by the Barangay Lupon. Please review your hearing schedule below.
            </p>
          </div>
        </div>
      `;
    }

    resultBox.innerHTML = `
      ${acceptedNotice}
      <h3 style="color:var(--primary); margin-bottom:0.75rem;">Docket: ${data.docket}</h3>
      <p style="margin-bottom:0.4rem;"><strong>Status:</strong> <span class="status-badge" style="background:${data.status.includes('Accepted') ? '#dcfce7' : '#dbeafe'}; color:${data.status.includes('Accepted') ? '#15803d' : '#1e40af'};">${data.status}</span></p>
      <p style="margin-bottom:0.4rem;"><strong>Complainant:</strong> ${data.complainant}</p>
      <p style="margin-bottom:0.4rem;"><strong>Respondent:</strong> ${data.respondent}</p>
      <p style="margin-bottom:0.4rem; text-transform: capitalize;"><strong>Dispute Type:</strong> ${data.dispute_type}</p>
      <p style="margin-bottom:0.4rem;"><strong>Hearing Schedule:</strong> ${data.hearing_date ? new Date(data.hearing_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '<em>Not yet scheduled by Lupon</em>'}</p>
    `;
  } else {
    resultBox.innerHTML = `<p style="color:var(--danger); font-weight:600; text-align:center;">No record found for docket "${input}". Please verify the number.</p>`;
  }
});

// Trigger tracking on enter key
document.getElementById('trackInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('trackBtn').click();
  }
});

// Guidelines Modal Handling
const guidelinesModal = document.getElementById('guidelinesModal');
const openGuidelinesBtn = document.getElementById('openGuidelinesBtn');
const navGuidelinesLink = document.getElementById('navGuidelinesLink');
const closeGuidelinesBtn = document.getElementById('closeGuidelinesBtn');
const closeGuidelinesFooterBtn = document.getElementById('closeGuidelinesFooterBtn');

function openModal(e) {
  if (e) e.preventDefault();
  guidelinesModal.style.display = 'flex';
}

function closeModal() {
  guidelinesModal.style.display = 'none';
}

openGuidelinesBtn.addEventListener('click', openModal);
navGuidelinesLink.addEventListener('click', openModal);
closeGuidelinesBtn.addEventListener('click', closeModal);
closeGuidelinesFooterBtn.addEventListener('click', closeModal);

// Backdrop Click to Dismiss Modals
window.addEventListener('click', function(e) {
  if (e.target === guidelinesModal) closeModal();
  if (e.target === settingsModal) {
    settingsModal.style.display = 'none';
    changePasswordForm.reset();
  }
});

// Initialize session check
checkAuthSession();