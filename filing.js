let currentLang = 'en';
let isLoggedIn = false;

const translations = {
  en: {
    toggleBtn: '🌐 Translate to Cebuano',
    backLinkHome: '← Back to Home',
    backLinkPortal: '← Back to Portal Access',
    pageTitle: 'File a Barangay Complaint',
    pageSubtitle: 'Please answer the Preliminary Jurisdiction Screening before compiling your report.',
    screeningBannerTitle: '📌 Preliminary Jurisdiction Screening',
    screeningBannerDesc: 'These questions help determine whether your complaint falls under the jurisdiction of the Katarungang Pambarangay (RA 7160).',
    q1Label: '1. Is one of the parties the government, or a government subdivision or instrumentality? *',
    q2Label: '2. Does the dispute involve a public officer or employee in relation to their official functions? *',
    q3Label: '3. Does the offense potentially carry imprisonment exceeding one (1) year or a fine exceeding ₱5,000? *',
    q4Label: '4. Is there a private offended party? *',
    q5Label: '5. If the dispute involves real property, are the properties located in different cities or municipalities without agreement to submit to this Lupon? *',
    q6Label: '6. Do you and the respondent live in different cities or municipalities with non-adjoining barangays? *',
    selectOpt: 'Select an answer',
    optNo: 'No',
    optYes: 'Yes',
    optUnsure: 'Unsure',
    optNoSameCity: 'No (Located in the same city/municipality)',
    optYesDiffCity: 'Yes (Different city/municipality with no agreement)',
    optNoAdjoining: 'No (Same city/municipality or adjoining barangays)',
    optYesNonAdjoining: 'Yes (Different non-adjoining city/municipality)',
    nextBtn: 'Next: File Complaint →',
    validBannerText: '✅ <strong>Screening Valid!</strong> You may now compile the full details of your complaint.',
    editScreeningBtn: 'Edit Screening',
    sec1Legend: '1. Complainant Information',
    compNameLabel: 'Full Name *',
    compEmailLabel: 'Gmail Address (For Approval Notification) *',
    compContactLabel: 'Contact Number *',
    compPurokLabel: 'Purok / Barangay *',
    sec2Legend: '2. Respondent Information',
    respNameLabel: "Respondent's Full Name *",
    respPurokLabel: 'Known Purok / Address *',
    sec3Legend: '3. Dispute Details',
    disputeTypeLabel: 'Type of Dispute *',
    selectDisputeOpt: 'Select dispute category',
    dispBoundary: 'Boundary / Property Dispute',
    dispDebt: 'Unpaid Debt / Financial Obligation',
    dispAltercation: 'Physical or Verbal Altercation',
    dispDisturbance: 'Neighborhood Disturbance / Noise',
    dispOther: 'Other Civil Dispute',
    incidentDateLabel: 'Date of Incident *',
    narrativeLabel: 'Incident Description (Statement of Facts) *',
    evidenceLabel: 'Upload Evidence (Picture / Photo) — Optional',
    uploadHint: '📷 Click to select a photo (JPG, PNG - Max 5MB)',
    consentLabel: 'I confirm that the information provided is accurate to the best of my knowledge and consent to its use by authorized barangay personnel under RA 10173 (Data Privacy Act) for complaint processing.',
    submitBtn: 'Submit Complaint',
    submittingBtn: 'Submitting report and evidence...',
    invalidModalTitle: 'Complaint Not Valid Based on Screening',
    whereToGoTitle: 'Where can you seek assistance?',
    tip1: 'Nearest <strong>Police Station (PNP)</strong> for an official blotter report.',
    tip2: "<strong>City Prosecutor's Office</strong> or <strong>Public Attorney's Office (PAO)</strong>.",
    closeInvalidBtn: 'I Understand (Close)',
    successModalTitle: 'Complaint Submitted Successfully!',
    successModalDesc: 'Your report has been received by the Lupon registry. You will be notified via Gmail once approved.',
    docketLabel: 'Your Tracking Docket Number:',
    docketHelp: 'Take a screenshot or write down this number to track your case status.',
    returnHomeBtn: 'Back to Home',
    returnPortalBtn: 'Back to Portal Access',
    alertUnanswered: 'Please answer all six (6) screening questions first.',
    errQ1: 'Disputes involving a government office or instrumentality cannot be settled through the Barangay Lupon.',
    errQ2: 'Disputes involving a public officer or employee in relation to their official duties fall outside Lupon jurisdiction.',
    errQ3: 'Offenses carrying imprisonment exceeding 1 year or a fine over ₱5,000 must be filed directly with the Police or Prosecutor.',
    errQ4: 'A private offended party is required for amicable settlement under Katarungang Pambarangay.',
    errQ5: 'Real property disputes located in different cities or municipalities without mutual agreement fall outside this Lupon.',
    errQ6: 'Parties must reside in the same city/municipality or in adjoining barangays.'
  },
  ceb: {
    toggleBtn: '🌐 Translate to English',
    backLinkHome: '← Balik sa Home',
    backLinkPortal: '← Balik sa Portal Access',
    pageTitle: 'Pagsumite og Reklamo sa Barangay',
    pageSubtitle: 'Tubaga una ang Preliminary Jurisdiction Screening sa dili pa mosulat sa imong report.',
    screeningBannerTitle: '📌 Pasiuna nga Pagsusi (Preliminary Jurisdiction Screening)',
    screeningBannerDesc: 'Kini nga mga pangutana makatabang sa pagsuta kung ang imong reklamo mahimo bang husayon ubos sa Katarungang Pambarangay (RA 7160).',
    q1Label: '1. Ang usa ba sa mga hingtungdan kay opisina sa gobyerno o ahensya niini? *',
    q2Label: '2. Ang panagbangi ba naglambigit sa usa ka opisyal o empleyado sa gobyerno may kalabotan sa iyang opisyal nga katungdanan? *',
    q3Label: '3. Ang reklamo ba naglambigit og krimen nga adunay silot nga pagkapriso nga labaw sa usa (1) ka tuig o multa nga labaw sa ₱5,000? *',
    q4Label: '4. Aduna bay pribadong tawo nga naagrabyado (private offended party)? *',
    q5Label: '5. Kung kining panagbangi naglambigit og yuta o propiedad (real property), nahimutang ba kini sa lain-laing siyudad o lungsod ug walay kasabutan nga husayon dinhi? *',
    q6Label: '6. Nagpuyo ba kamo sa gireklamo sa laing siyudad o lungsod nga dili magkasilingan ang barangay? *',
    selectOpt: 'Pilia ang tubag',
    optNo: 'Dili (No)',
    optYes: 'Oo (Yes)',
    optUnsure: 'Dili Sigurado (Unsure)',
    optNoSameCity: 'Dili (Pareho ra og siyudad o lungsod)',
    optYesDiffCity: 'Oo (Laing lungsod ug walay kasabutan)',
    optNoAdjoining: 'Dili (Pareho og lungsod o silingan nga barangay)',
    optYesNonAdjoining: 'Oo (Layo nga lungsod o dili magkasilingan)',
    nextBtn: 'Sunod: Isulat ang Reklamo →',
    validBannerText: '✅ <strong>Valid ang Screening!</strong> Mahimo na nimo isulat ang kompletong detalye sa imong reklamo.',
    editScreeningBtn: 'Usba ang Screening',
    sec1Legend: '1. Impormasyon sa Nangreklamo (Complainant)',
    compNameLabel: 'Kompletong Ngalan *',
    compEmailLabel: 'Gmail Address (Para sa Approval Notification) *',
    compContactLabel: 'Numero sa Telepono *',
    compPurokLabel: 'Purok / Barangay *',
    sec2Legend: '2. Impormasyon sa Gireklamo (Respondent)',
    respNameLabel: 'Kompletong Ngalan sa Gireklamo *',
    respPurokLabel: 'Nahibal-ang Purok / Address *',
    sec3Legend: '3. Detalye sa Panghitabo (Dispute Details)',
    disputeTypeLabel: 'Klase sa Panagbangi *',
    selectDisputeOpt: 'Pilia ang kategorya',
    dispBoundary: 'Panagbangi sa Utlanan / Yuta',
    dispDebt: 'Wala Mabayri nga Utang / Pinansyal',
    dispAltercation: 'Pisikal o Berbal nga Panaglalis',
    dispDisturbance: 'Kasamok sa Komunidad / Kasaba',
    dispOther: 'Ubang Sibil nga Panagbangi',
    incidentDateLabel: 'Petsa sa Panghitabo *',
    narrativeLabel: 'Asaysay sa Panghitabo (Statement of Facts) *',
    evidenceLabel: 'Pag-upload og Ebidensya (Picture / Larawan) — Optional',
    uploadHint: '📷 Pindota aron mopili og litrato (JPG, PNG - Max 5MB)',
    consentLabel: 'Gipamatud-an nako nga tinuod ang tanang impormasyon ug naghatag ko og pagtugot ubos sa RA 10173 (Data Privacy Act) alang sa proseso sa Katarungang Pambarangay.',
    submitBtn: 'Isumite ang Reklamo',
    submittingBtn: 'Ginasumite ang report ug ebidensya...',
    invalidModalTitle: 'Dili Valid ang Imong Reklamo Base sa Screening',
    whereToGoTitle: 'Asa ka mahimong modangop?',
    tip1: 'Sa pinakaduol nga <strong>Police Station (PNP)</strong> alang sa criminal blotter.',
    tip2: "Sa <strong>City Prosecutor's Office</strong> o <strong>Public Attorney's Office (PAO)</strong>.",
    closeInvalidBtn: 'Nakasabot Ko (Isira)',
    successModalTitle: 'Malampusong Nasumite ang Reklamo!',
    successModalDesc: 'Nadawat na sa Lupon registry ang imong report. Makadawat ka og pahibalo sa imong Gmail kung ma-aprobahan na kini.',
    docketLabel: 'Imong Tracking Docket Number:',
    docketHelp: 'I-screenshot o isulat kini nga numero aron ma-track ang kahimtang sa imong kaso.',
    returnHomeBtn: 'Balik sa Home',
    returnPortalBtn: 'Balik sa Portal Access',
    alertUnanswered: 'Palihug tubaga una ang tanang unom (6) ka pangutana sa screening.',
    errQ1: 'Ang reklamo batok sa ahensya o opisina sa gobyerno dili mahimong husayon sa Barangay Lupon.',
    errQ2: 'Ang reklamo batok sa opisyal sa gobyerno bahin sa iyang trabaho dili sakop sa Lupon Tagapamayapa.',
    errQ3: 'Ang mga kaso nga adunay silot nga labaw sa 1 ka tuig nga pagkapriso o multa nga lapas sa ₱5,000 kinahanglan idiretso sa korte o pulis.',
    errQ4: 'Kinahanglan adunay pribadong tawo nga naagrabyado aron mahusay ubos sa Katarungang Pambarangay.',
    errQ5: 'Ang panagbangi sa yuta nga nahimutang sa laing siyudad o lungsod wala sa hurisdiksyon niining barangay.',
    errQ6: 'Ang mga hingtungdan kinahanglan nagpuyo sa parehong siyudad/lungsod o magkasilingan nga barangay.'
  }
};

function updateBackDestinations() {
  const dict = translations[currentLang];
  const targetUrl = isLoggedIn ? 'index.html' : 'auth.html';
  const backLinkEl = document.querySelector('.back-link');
  const returnBtnEl = document.getElementById('returnHomeBtn');

  if (backLinkEl) {
    backLinkEl.href = targetUrl;
    backLinkEl.innerText = isLoggedIn ? dict.backLinkHome : dict.backLinkPortal;
  }

  if (returnBtnEl) {
    returnBtnEl.innerText = isLoggedIn ? dict.returnHomeBtn : dict.returnPortalBtn;
  }
}

function applyLanguage(lang) {
  currentLang = lang;
  const dict = translations[lang];
  document.getElementById('langToggleBtn').innerText = dict.toggleBtn;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  updateBackDestinations();
}

document.getElementById('langToggleBtn').addEventListener('click', function () {
  applyLanguage(currentLang === 'en' ? 'ceb' : 'en');
});

const screeningSection = document.getElementById('screeningSection');
const checkScreeningBtn = document.getElementById('checkScreeningBtn');
const complaintForm = document.getElementById('complaintForm');
const invalidModal = document.getElementById('invalidModal');
const invalidReasonText = document.getElementById('invalidReasonText');
const successModal = document.getElementById('successModal');

checkScreeningBtn.addEventListener('click', function () {
  const dict = translations[currentLang];
  const q1 = document.getElementById('q1').value;
  const q2 = document.getElementById('q2').value;
  const q3 = document.getElementById('q3').value;
  const q4 = document.getElementById('q4').value;
  const q5 = document.getElementById('q5').value;
  const q6 = document.getElementById('q6').value;

  if (!q1 || !q2 || !q3 || !q4 || !q5 || !q6) {
    alert(dict.alertUnanswered);
    return;
  }

  let invalidReason = '';

  if (q1 === 'yes') invalidReason = dict.errQ1;
  else if (q2 === 'yes') invalidReason = dict.errQ2;
  else if (q3 === 'yes') invalidReason = dict.errQ3;
  else if (q4 === 'no') invalidReason = dict.errQ4;
  else if (q5 === 'yes') invalidReason = dict.errQ5;
  else if (q6 === 'yes') invalidReason = dict.errQ6;

  if (invalidReason !== '') {
    invalidReasonText.innerText = invalidReason;
    invalidModal.style.display = 'flex';
    return;
  }

  screeningSection.classList.add('hidden');
  complaintForm.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('closeInvalidBtn').addEventListener('click', function () {
  invalidModal.style.display = 'none';
});

document.getElementById('editScreeningBtn').addEventListener('click', function () {
  complaintForm.classList.add('hidden');
  screeningSection.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const evidenceInput = document.getElementById('evidenceInput');
const evidencePreview = document.getElementById('evidencePreview');

evidenceInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert(currentLang === 'en' ? 'File size exceeds 5MB limit.' : 'Ang file dako ra kaayo. Palihug pagpili og ubos sa 5MB.');
      this.value = '';
      evidencePreview.classList.add('hidden');
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      evidencePreview.src = e.target.result;
      evidencePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  } else {
    evidencePreview.classList.add('hidden');
  }
});

const supabaseUrl = 'https://ivphxduuzemdmkjdgeqy.supabase.co';
const supabaseKey = 'sb_publishable_Eh44ol3xJHhoxPNOS6Tueg_SzHFTi5u';
const db = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

async function tryPrefillUserSession() {
  if (!db) {
    updateBackDestinations();
    return;
  }

  try {
    const { data: { session } } = await db.auth.getSession();
    if (session) {
      isLoggedIn = true;
      document.getElementById('complainantEmail').value = session.user.email || '';
      const { data: profile } = await db
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile) {
        if (profile.full_name) document.getElementById('complainantName').value = profile.full_name;
        if (profile.purok) document.getElementById('complainantPurok').value = profile.purok;
      }
    } else {
      isLoggedIn = false;
    }
  } catch (err) {
    isLoggedIn = false;
    console.warn('Session prefill skipped:', err);
  }

  updateBackDestinations();
}

tryPrefillUserSession();

document.getElementById('submitBtn').addEventListener('click', async function () {
  const dict = translations[currentLang];

  if (!complaintForm.reportValidity()) {
    return;
  }

  if (!db) {
    alert('Database connection unavailable. Please check your internet connection.');
    return;
  }

  const submitBtn = this;
  submitBtn.disabled = true;
  submitBtn.innerText = dict.submittingBtn;

  try {
    const { data: { session } } = await db.auth.getSession();
    const currentUserId = session ? session.user.id : null;
    const trackingNo = 'KP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    let evidenceUrl = null;
    const file = evidenceInput.files[0];

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${trackingNo}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await db.storage
        .from('evidence')
        .upload(fileName, file);

      if (!uploadError) {
        const { data: publicUrlData } = db.storage
          .from('evidence')
          .getPublicUrl(fileName);
        evidenceUrl = publicUrlData.publicUrl;
      }
    }

    const payload = {
      docket: trackingNo,
      complainant: document.getElementById('complainantName').value.trim(),
      complainant_email: document.getElementById('complainantEmail').value.trim(),
      complainant_purok: document.getElementById('complainantPurok').value.trim(),
      respondent: document.getElementById('respondentName').value.trim(),
      respondent_purok: document.getElementById('respondentPurok').value.trim(),
      dispute_type: document.getElementById('disputeType').value,
      incident_date: document.getElementById('incidentDate').value,
      narrative: document.getElementById('incidentNarrative').value.trim(),
      evidence_url: evidenceUrl,
      status: 'Pending Approval',
      hearing_date: null,
      user_id: currentUserId
    };

    const { error } = await db.from('cases').insert([payload]);

    if (error) {
      alert('Submission failed: ' + error.message);
      submitBtn.disabled = false;
      submitBtn.innerText = dict.submitBtn;
    } else {
      document.getElementById('modalDocket').innerText = trackingNo;
      updateBackDestinations();
      successModal.style.display = 'flex';
    }
  } catch (err) {
    alert('Error: ' + err.message);
    submitBtn.disabled = false;
    submitBtn.innerText = dict.submitBtn;
  }
});

// Redirects to index.html if logged in, or auth.html if guest
document.getElementById('returnHomeBtn').addEventListener('click', function () {
  window.location.href = isLoggedIn ? 'index.html' : 'auth.html';
});