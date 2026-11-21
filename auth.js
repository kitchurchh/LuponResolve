const supabaseUrl = 'https://ivphxduuzemdmkjdgeqy.supabase.co';
const supabaseKey = 'sb_publishable_Eh44ol3xJHhoxPNOS6Tueg_SzHFTi5u';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

const OFFICER_SECRET_PIN = "SUMILIHON2026";

const roleSelectionScreen = document.getElementById('roleSelectionScreen');
const residentActionScreen = document.getElementById('residentActionScreen');
const officerScreen = document.getElementById('officerScreen');
const residentRegisterForm = document.getElementById('residentRegisterForm');
const residentLoginForm = document.getElementById('residentLoginForm');

const officerLoginForm = document.getElementById('officerLoginForm');
const officerRegisterForm = document.getElementById('officerRegisterForm');
const tabOfficerLoginBtn = document.getElementById('tabOfficerLoginBtn');
const tabOfficerRegBtn = document.getElementById('tabOfficerRegBtn');

// 1. ROLE SELECTION NAVIGATION
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

// 2. RESIDENT ACTION MENU NAVIGATION
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

// 3. OFFICER TABS
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

// 4. OFFICER REGISTRATION (PIN PROTECTED)
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
  const designation = document.getElementById('offRegDesignation').value.trim();
  const email = document.getElementById('offRegEmail').value.trim();
  const password = document.getElementById('offRegPassword').value;

  const { data: authData, error: authError } = await db.auth.signUp({ email, password });

  if (authError) {
    alert("Officer Registration failed: " + authError.message);
    submitBtn.disabled = false;
    submitBtn.innerText = 'Verify PIN & Create Account';
    return;
  }

  await db.from('profiles').insert([
    {
      id: authData.user.id,
      full_name: `${fullName} (${designation})`,
      role: 'officer',
      purok: 'Barangay Sumilihon Hall'
    }
  ]);

  if (!authData.session) {
    alert("Officer Account created! Please check and confirm your email before logging in.");
    submitBtn.disabled = false;
    submitBtn.innerText = 'Verify PIN & Create Account';
    return;
  }

  window.location.href = 'index.html';
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

  window.location.href = 'index.html';
});

// 6. RESIDENT REGISTRATION (DIRECT SIGN UP - NO DOCKET REQUIRED)
residentRegisterForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById('resRegSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = 'Creating account...';

  const fullName = document.getElementById('resFullName').value.trim();
  const purok = document.getElementById('resPurok').value.trim();
  const email = document.getElementById('resEmail').value.trim();
  const password = document.getElementById('resPassword').value;

  const { data: authData, error: authErr } = await db.auth.signUp({ email, password });

  if (authErr) {
    alert("Resident Registration error: " + authErr.message);
    submitBtn.disabled = false;
    submitBtn.innerText = 'Register Account';
    return;
  }

  await db.from('profiles').insert([
    {
      id: authData.user.id,
      full_name: fullName,
      purok: purok,
      role: 'resident'
    }
  ]);

  if (!authData.session) {
    alert("Account created! Palihug i-check ug i-confirm una ang imong email sa dili pa mo-log in.");
    submitBtn.disabled = false;
    submitBtn.innerText = 'Register Account';
    return;
  }

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