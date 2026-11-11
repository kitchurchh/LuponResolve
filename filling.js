const supabaseUrl = 'https://ivphxduuzemdmkjdgeqy.supabase.co';
const supabaseKey = 'sb_publishable_Eh44ol3xJHhoxPNOS6Tueg_SzHFTi5u';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

// Prefill fields if a user happens to already have an active session (optional, non-blocking)
async function tryPrefillUserSession() {
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    const { data: profile } = await db
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profile) {
      if (profile.full_name) {
        document.getElementById('complainantName').value = profile.full_name;
      }
      if (profile.purok) {
        document.getElementById('complainantPurok').value = profile.purok;
      }
    }
  }
}

tryPrefillUserSession();

// Submit complaint without requiring prior login
document.getElementById('complaintForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = 'Recording complaint in database...';

  // Check if session exists (can be null for new residents)
  const { data: { session } } = await db.auth.getSession();
  const currentUserId = session ? session.user.id : null;

  // Generate official tracking docket (e.g. KP-2026-4821)
  const trackingNo = 'KP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

  const payload = {
    docket: trackingNo,
    complainant: document.getElementById('complainantName').value.trim(),
    complainant_purok: document.getElementById('complainantPurok').value.trim(),
    respondent: document.getElementById('respondentName').value.trim(),
    respondent_purok: document.getElementById('respondentPurok').value.trim(),
    dispute_type: document.getElementById('disputeType').value,
    incident_date: document.getElementById('incidentDate').value,
    narrative: document.getElementById('incidentNarrative').value.trim(),
    status: 'Pending Approval', // Awaiting officer review in portal.html
    hearing_date: null,
    user_id: currentUserId      // Attached if logged in, otherwise linked during registration
  };

  const { error } = await db.from('cases').insert([payload]);

  if (error) {
    alert('Failed to submit incident report: ' + error.message);
    submitBtn.disabled = false;
    submitBtn.innerText = 'Submit Complaint';
  } else {
    // Show confirmation modal with tracking docket
    document.getElementById('modalDocket').innerText = trackingNo;
    document.getElementById('successModal').style.display = 'flex';

    // 5-second countdown to return home
    let timeLeft = 5;
    const countdownEl = document.getElementById('countdown');
    const timer = setInterval(() => {
      timeLeft--;
      if (countdownEl) countdownEl.innerText = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timer);
        window.location.href = 'index.html';
      }
    }, 1000);
  }
});

// Manual return button handler
const returnBtn = document.getElementById('returnHomeBtn');
if (returnBtn) {
  returnBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}