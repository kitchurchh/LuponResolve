const supabaseUrl = 'https://ivphxduuzemdmkjdgeqy.supabase.co';
const supabaseKey = 'sb_publishable_Eh44ol3xJHhoxPNOS6Tueg_SzHFTi5u';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

// SECRET PIN KNOWN ONLY TO BARANGAY OFFICIALS
const OFFICER_SECRET_PIN = "SUMILIHON2026";

// Navigation Containers
const roleSelectionScreen = document.getElementById('roleSelectionScreen');
const residentActionScreen = document.getElementById('residentActionScreen');
const officerScreen = document.getElementById('officerScreen');
const residentRegisterForm = document.getElementById('residentRegisterForm');
const residentLoginForm = document.getElementById('residentLoginForm');

// Officer Forms & Tabs
const officerLoginForm = document.getElementById('officerLoginForm');
const officerRegisterForm = document.getElementById('officerRegisterForm');
const tabOfficerLoginBtn = document.getElementById('tabOfficerLoginBtn');
const tabOfficerRegBtn = document.getElementById('tabOfficerRegBtn');

// 1. Role Selection Switching
document.getElementById('chooseResidentBtn').addEventListener('click', () => {
  roleSelectionScreen.classList.add('hidden');
  residentActionScreen.classList.remove('hidden');
});

document.getElementById('chooseOfficerBtn').addEventListener('click', () => {
  roleSelectionScreen.classList.add('hidden');
  officerScreen.classList.remove('hidden');
});

document.getElementById('backToRoleBtn1').addEventListener('click', () => {
  residentActionScreen.classList.add('hidden');
  roleSelectionScreen.classList.remove('hidden');
});

document.getElementById('backToRoleBtn2').addEventListener('click', () => {
  officerScreen.classList.add('hidden');
  roleSelectionScreen.classList.remove('hidden');
});

// 2. Resident Views Switching
document.getElementById('showResidentRegBtn').addEventListener('click', () => {
  residentActionScreen.classList.add('hidden');
  residentRegisterForm.classList.remove('hidden');
});

document.getElementById('showResidentLoginBtn').addEventListener('click', () => {
  residentActionScreen.classList.add('hidden');
  residentLoginForm.classList.remove('hidden');
});

document.getElementById('backToResidentActionBtn').addEventListener('click', () => {
  residentRegisterForm.classList.add('hidden');
  residentActionScreen.classList.remove('hidden');
});

document.getElementById('backToResidentActionBtn2').addEventListener('click', () => {
  residentLoginForm.classList.add('hidden');
  residentActionScreen.classList.remove('hidden');
});

// 3. Officer Tab Switching
tabOfficerLoginBtn.addEventListener('click', () => {
  tabOfficerLoginBtn.classList.add('active');
  tabOfficerRegBtn.classList.remove('active');
  officerLoginForm.classList.remove('hidden');
  officerRegisterForm.classList.add('hidden');
});

tabOfficerRegBtn.addEventListener('click', () => {
  tabOfficerRegBtn.classList.add('active');
  tabOfficerLoginBtn.classList.remove('active');
  officerRegisterForm.classList.remove('hidden');
  officerLoginForm.classList.add('hidden');
});

// 4. OFFICER REGISTRATION (SECURED WITH BARANGAY PIN)
officerRegisterForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const enteredPin = document.getElementById('officerPin').value.trim();

  if (enteredPin !== OFFICER_SECRET_PIN) {
    alert("INVALID SECURITY PIN! Only verified barangay officials are authorized to create an officer account.");
    return;
  }

  const submitBtn = document.getElementById('offRegSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = 'Creating Officer Account...';

  const fullName = document.getElementById('offRegName').value.trim();
  const email = document.getElementById('offRegEmail').value.trim();
  const password = document.getElementById('offRegPassword').value;

  const { data: authData, error: authError } = await db.auth.signUp({ email, password });

  if (authError) {
    alert("Officer Registration failed: " + authError.message);
    submitBtn.disabled = false;
    submitBtn.innerText = 'Verify PIN & Create Account';
    return;
  }

  const { error: profileError } = await db.from('profiles').insert([
    {
      id: authData.user.id,
      full_name: fullName,
      role: 'officer',
      purok: 'Barangay Sumilihon Hall'
    }
  ]);

  if (profileError) {
    alert("Account created, but profile setup encountered an issue: " + profileError.message);
  }

  alert("Officer Account Authorized! Redirecting to Official Portal...");
  window.location.href = 'portal.html';
});

// 5. OFFICER LOGIN
officerLoginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById('offLoginSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = 'Verifying credentials...';

  const email = document.getElementById('offEmail').value.trim();
  const password = document.getElementById('offPassword').value;

  const { data, error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    alert("Officer Login failed: " + error.message);
    submitBtn.disabled = false;
    submitBtn.innerText = 'Log In as Officer';
    return;
  }

  // Verify that the user has an officer role
  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'officer') {
    alert("Access Restricted: This account does not have Barangay Officer permissions.");
    await db.auth.signOut();
    submitBtn.disabled = false;
    submitBtn.innerText = 'Log In as Officer';
    return;
  }

  window.location.href = 'portal.html';
});

// 6. RESIDENT REGISTRATION (VERIFIES DOCKET APPROVAL FIRST)
residentRegisterForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById('resRegSubmitBtn');
  const docketNo = document.getElementById('resDocketInput').value.trim();

  submitBtn.disabled = true;
  submitBtn.innerText = 'Checking docket approval in database...';

  // Check if case docket exists
  const { data: caseRecord, error: caseErr } = await db
    .from('cases')
    .select('*')
    .ilike('docket', docketNo)
    .maybeSingle();

  if (caseErr || !caseRecord) {
    alert(`No case record found for Docket "${docketNo}". Please verify your tracking number or file a complaint first.`);
    submitBtn.disabled = false;
    submitBtn.innerText = 'Verify Docket & Register';
    return;
  }

  // Reject registration if case is not yet accepted/scheduled by Lupon
  if (caseRecord.status === 'Under Review' || caseRecord.status === 'Pending Approval') {
    alert(`Your complaint (${docketNo}) is still PENDING APPROVAL. The Barangay Lupon must formally accept or schedule it before you can create your account.`);
    submitBtn.disabled = false;
    submitBtn.innerText = 'Verify Docket & Register';
    return;
  }

  // Proceed with registration
  const fullName = document.getElementById('resFullName').value.trim();
  const purok = document.getElementById('resPurok').value.trim();
  const email = document.getElementById('resEmail').value.trim();
  const password = document.getElementById('resPassword').value;

  const { data: authData, error: authErr } = await db.auth.signUp({ email, password });

  if (authErr) {
    alert("Resident Registration error: " + authErr.message);
    submitBtn.disabled = false;
    submitBtn.innerText = 'Verify Docket & Register';
    return;
  }

  // Save resident profile
  await db.from('profiles').insert([
    {
      id: authData.user.id,
      full_name: fullName,
      purok: purok,
      role: 'resident'
    }
  ]);

  // Connect user_id to the approved case so it shows on their dashboard
  await db
    .from('cases')
    .update({ user_id: authData.user.id })
    .eq('id', caseRecord.id);

  alert("Account verified and registered successfully! Directing you to Home...");
  window.location.href = 'index.html';
});

// 7. RESIDENT LOGIN
residentLoginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById('resLoginSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = 'Logging in...';

  const email = document.getElementById('resLoginEmail').value.trim();
  const password = document.getElementById('resLoginPassword').value;

  const { error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    alert("Login failed: " + error.message);
    submitBtn.disabled = false;
    submitBtn.innerText = 'Log In';
    return;
  }

  window.location.href = 'index.html';
});