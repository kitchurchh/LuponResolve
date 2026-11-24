const supabaseUrl = 'https://ivphxduuzemdmkjdgeqy.supabase.co';
const supabaseKey = 'sb_publishable_Eh44ol3xJHhoxPNOS6Tueg_SzHFTi5u';
const db = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

let currentLang = 'en';

const translations = {
  en: {
    toggleBtn: '🌐 Cebuano',
    navFile: 'File a Complaint',
    navLogin: 'Portal Access',
    logoutText: '🚪 Log Out',
    heroTitle: 'Barangay Sumilihon Online Dispute Resolution',
    heroSubtitle: 'Fast, fair, and accessible community mediation under the Katarungang Pambarangay Law (RA 7160).',
    trackerPlaceholder: 'Enter Tracking Docket (e.g., KP-2026-1024)',
    trackBtn: 'Track Case',
    card1Title: '📝 File a Complaint',
    card1Desc: 'Answer the preliminary screening and submit an incident report with photo evidence—no account required upfront.',
    card1Btn: 'Start Screening & Filing',
    card2Title: '🔑 Resident & Officer Access',
    card2Desc: 'Create your Resident Account once your docket is approved, or log in to the official Lupon desk.',
    card2Btn: 'Go to Portal Access',
    card3Title: '📖 Katarungang Pambarangay Guide',
    card3Desc: 'Learn about the 3-stage conciliation process, valid barangay disputes, and required documents.',
    card3Btn: 'Read Guidelines',
    guideModalTitle: 'Katarungang Pambarangay Guidelines (RA 7160)',
    guideSec1Title: '1. Filing & Approval Workflow',
    guideSec1Li1: '<strong>Step 1 (Screening):</strong> Complete the Preliminary Jurisdiction Screening to verify if the dispute is within Barangay authority.',
    guideSec1Li2: '<strong>Step 2 (Report & Evidence):</strong> Submit your complaint details along with optional photo evidence and your Gmail address.',
    guideSec1Li3: '<strong>Step 3 (Lupon Approval & Account):</strong> Once approved by an officer, use your Tracking Docket Number to register a Resident Account.',
    guideSec2Title: '2. Three Stages of Conciliation',
    guideSec2Li1: '<strong>Mediation by Punong Barangay:</strong> Initial settlement conference within 15 days.',
    guideSec2Li2: '<strong>Conciliation by Pangkat Tagapagkasundo:</strong> 3-member panel hearing if mediation fails.',
    guideSec2Li3: '<strong>Certificate to File Action (CFA):</strong> Issued if no amicable settlement is reached, allowing court filing.',
    closeBtn: 'Close'
  },
  ceb: {
    toggleBtn: '🌐 English',
    navFile: 'Magsumite og Reklamo',
    navLogin: 'Portal Access',
    logoutText: '🚪 Log Out',
    heroTitle: 'Barangay Sumilihon Online Dispute Resolution',
    heroSubtitle: 'Paspas, patas, ug sayon nga paghusay sa komunidad ubos sa Katarungang Pambarangay Law (RA 7160).',
    trackerPlaceholder: 'Isulat ang Tracking Docket (e.g., KP-2026-1024)',
    trackBtn: 'Pangitaa ang Kaso',
    card1Title: '📝 Magsumite og Reklamo',
    card1Desc: 'Tubaga ang preliminary screening ug isumite ang report uban ang litrato sa ebidensya—dili na kinahanglan og account una.',
    card1Btn: 'Sugdi ang Screening',
    card2Title: '🔑 Resident & Officer Access',
    card2Desc: 'Paghimo og Resident Account kung ma-aprobahan na ang imong docket, o log in sa opisyal nga Lupon desk.',
    card2Btn: 'Adto sa Portal Access',
    card3Title: '📖 Giya sa Katarungang Pambarangay',
    card3Desc: 'Sabta ang 3 ka ang-ang sa paghusay, mga valid nga reklamo sa barangay, ug gikinahanglan nga dokumento.',
    card3Btn: 'Basaha ang Giya',
    guideModalTitle: 'Giya sa Katarungang Pambarangay (RA 7160)',
    guideSec1Title: '1. Proseso sa Pagsumite ug Pag-aproba',
    guideSec1Li1: '<strong>Unang Lakang (Screening):</strong> Tubaga ang Preliminary Jurisdiction Screening aron masuta kung sakop ba sa Barangay.',
    guideSec1Li2: '<strong>Ikaduhang Lakang (Report ug Ebidensya):</strong> Isumite ang detalye sa reklamo, picture sa ebidensya, ug imong Gmail.',
    guideSec1Li3: '<strong>Ikatulong Lakang (Account):</strong> Kung ma-aprobahan na sa opisyal, gamita ang imong Docket Number aron makahimo og Resident Account.',
    guideSec2Title: '2. Tulo ka Ang-ang sa Paghusay',
    guideSec2Li1: '<strong>Mediation sa Punong Barangay:</strong> Unang panagtagbo sulod sa 15 ka adlaw.',
    guideSec2Li2: '<strong>Conciliation sa Pangkat Tagapagkasundo:</strong> Paghusay sa 3 ka miyembro sa Pangkat kung dili magkasinabot sa mediation.',
    guideSec2Li3: '<strong>Certificate to File Action (CFA):</strong> Ihatag kung walay kasabutan aron madala ang kaso sa korte.',
    closeBtn: 'Isira'
  }
};

function applyLanguage(lang) {
  currentLang = lang;
  const dict = translations[lang];
  document.getElementById('langToggleBtn').innerText = dict.toggleBtn;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.innerHTML = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.placeholder = dict[key];
  });
}

document.getElementById('langToggleBtn').addEventListener('click', () => {
  applyLanguage(currentLang === 'en' ? 'ceb' : 'en');
});

document.getElementById('trackDocketBtn').addEventListener('click', async () => {
  const query = document.getElementById('docketSearchInput').value.trim();
  const resultBox = document.getElementById('statusResult');

  if (!query) {
    alert(currentLang === 'en' ? 'Please enter a Docket Number.' : 'Palihug isulat ang imong Docket Number.');
    return;
  }

  if (!db) {
    alert('Database connection unavailable.');
    return;
  }

  resultBox.style.display = 'block';
  resultBox.innerHTML = `<p style="color:var(--muted); font-weight:600;">Searching registry for <strong>${query}</strong>...</p>`;

  const { data, error } = await db
    .from('cases')
    .select('*')
    .ilike('docket', query)
    .maybeSingle();

  if (error || !data) {
    resultBox.innerHTML = `
      <p style="color:var(--danger); font-weight:700;">No record found for Docket "${query}".</p>
      <p style="font-size:0.85rem; color:var(--muted); margin-top:0.25rem;">Please verify your tracking number and try again.</p>
    `;
    return;
  }

  const hearingDisplay = data.hearing_date
    ? new Date(data.hearing_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : (currentLang === 'en' ? 'To be scheduled by Lupon' : 'I-schedule pa sa Lupon');

  resultBox.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
      <strong style="font-size:1.1rem; color:var(--primary);">${data.docket}</strong>
      <span class="status-badge">${data.status}</span>
    </div>
    <p style="font-size:0.9rem; margin-bottom:0.35rem;"><strong>Complainant:</strong> ${data.complainant}</p>
    <p style="font-size:0.9rem; margin-bottom:0.35rem;"><strong>Respondent:</strong> ${data.respondent}</p>
    <p style="font-size:0.9rem;"><strong>Hearing Schedule:</strong> ${hearingDisplay}</p>
  `;
});

async function checkSession() {
  if (!db) {
    window.location.href = 'auth.html';
    return;
  }

  const { data: { session } } = await db.auth.getSession();

  // Kung walay naka-log in, mo-diretso sa split-screen auth.html
  if (!session) {
    window.location.href = 'auth.html';
    return;
  }

  document.getElementById('loginNavLink').style.display = 'none';
  document.getElementById('profileWrapper').style.display = 'block';
  
  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  const displayName = profile?.full_name || session.user.email.split('@')[0];
  const role = profile?.role || 'resident';

  document.getElementById('userAvatar').innerText = displayName.charAt(0).toUpperCase();
  document.getElementById('userDisplayName').innerText = displayName;
  document.getElementById('dropdownFullName').innerText = displayName;
  document.getElementById('dropdownEmail').innerText = session.user.email;
  document.getElementById('dropdownRole').innerText = role;

  if (role === 'officer') {
    document.getElementById('officerDashboardLink').style.display = 'flex';
    
    const fileCard = document.getElementById('fileComplaintCard');
    const navFileLink = document.getElementById('navFileLink');
    if (fileCard) fileCard.style.display = 'none';
    if (navFileLink) navFileLink.style.display = 'none';

    const portalTitle = document.getElementById('portalCardTitle');
    const portalDesc = document.getElementById('portalCardDesc');
    const portalBtn = document.getElementById('portalCardBtn');
    if (portalTitle) {
      portalTitle.removeAttribute('data-i18n');
      portalTitle.innerText = '🛡️ Official Lupon Desk';
    }
    if (portalDesc) {
      portalDesc.removeAttribute('data-i18n');
      portalDesc.innerText = 'Review pending complaints, inspect evidence photos, approve cases, and schedule mediation hearings.';
    }
    if (portalBtn) {
      portalBtn.removeAttribute('data-i18n');
      portalBtn.href = 'portal.html';
      portalBtn.classList.add('primary');
      portalBtn.innerText = 'Open Lupon Portal';
    }
  } else {
    const portalCard = document.getElementById('portalAccessCard');
    const officerLink = document.getElementById('officerDashboardLink');
    if (portalCard) portalCard.style.display = 'none';
    if (officerLink) officerLink.style.display = 'none';

    loadResidentAlerts(session.user.id);
  }
}

async function loadResidentAlerts(userId) {
  const { data: cases } = await db
    .from('cases')
    .select('*')
    .eq('user_id', userId);

  if (!cases || cases.length === 0) return;

  const container = document.getElementById('residentAlertContainer');
  container.style.display = 'block';
  container.innerHTML = '';

  cases.forEach((c) => {
    if (c.status !== 'Pending Approval') {
      const banner = document.createElement('div');
      banner.className = 'alert-banner accepted';
      banner.innerHTML = `
        <div>
          <strong>✅ Case Update (${c.docket}):</strong> Status is now <strong>${c.status}</strong>.
          ${c.hearing_date ? ` Hearing Date: <strong>${c.hearing_date}</strong>` : ''}
        </div>
      `;
      container.appendChild(banner);
    }
  });
}

const profileMenuBtn = document.getElementById('profileMenuBtn');
const profileDropdown = document.getElementById('profileDropdown');

if (profileMenuBtn) {
  profileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
  });
}

window.addEventListener('click', () => {
  if (profileDropdown) profileDropdown.style.display = 'none';
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  if (db) await db.auth.signOut();
  window.location.href = 'auth.html';
});

const guidelinesModal = document.getElementById('guidelinesModal');
document.getElementById('openGuidelinesBtn').addEventListener('click', () => {
  guidelinesModal.style.display = 'flex';
});
document.getElementById('closeGuidelinesBtn').addEventListener('click', () => {
  guidelinesModal.style.display = 'none';
});
document.getElementById('closeGuidelinesFooterBtn').addEventListener('click', () => {
  guidelinesModal.style.display = 'none';
});

checkSession();