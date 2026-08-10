/* =========================================================
   ZYPHOR'26 — script.js
   Data model (localStorage key: "zyphor26_teams"):
   {
     "<normalized team name>": {
       teamName, domain, domainDescription,
       studentName, email, collegeName, department,
       numMembers, memberNames: [...], foodPref,
       paymentScreenshot: { name, dataUrl },
       confirmed: true, updatedAt
     }, ...
   }
   The team name is the single link between the problem
   statement (domain) and the registration record — both
   live inside the same object.
   ========================================================= */

const STORAGE_KEY = "zyphor26_teams";

const DOMAIN_DESCRIPTIONS = {
  AI: "Artificial Intelligence focused problem solving, intelligent systems and innovative AI-powered solutions.",
  IoT: "Internet of Things focused solutions involving connected devices, sensors, automation and smart systems."
};

const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024; // 2 MB

/* ---------------- storage helpers (shared shape with host.html) ---------------- */
function readTeams(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  }catch(e){
    console.warn("Could not read Zyphor'26 team data:", e);
    return {};
  }
}
function writeTeams(teams){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}
function normalizeTeamName(name){
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/* ---------------- header: sticky shadow ---------------- */
const siteHeader = document.getElementById("siteHeader");
function onScrollHeader(){
  if(window.scrollY > 12){ siteHeader.classList.add("scrolled"); }
  else{ siteHeader.classList.remove("scrolled"); }
}
window.addEventListener("scroll", onScrollHeader, { passive:true });
onScrollHeader();

/* ---------------- mobile nav ---------------- */
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});
mainNav.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* ---------------- home page event countdown ---------------- */
const homeCountdownTarget = new Date("2026-08-28T09:00:00+05:30").getTime();

function updateHomeCountdown() {
  const ids = ["homeDays", "homeHours", "homeMinutes", "homeSeconds"];
  if (!document.getElementById(ids[0])) return;

  const diff = Math.max(0, homeCountdownTarget - Date.now());

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  document.getElementById("homeDays").textContent = String(days).padStart(2, "0");
  document.getElementById("homeHours").textContent = String(hours).padStart(2, "0");
  document.getElementById("homeMinutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("homeSeconds").textContent = String(seconds).padStart(2, "0");
}

updateHomeCountdown();
setInterval(updateHomeCountdown, 1000);


/* ---------------- scroll reveal ---------------- */
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
revealEls.forEach(el => revealObserver.observe(el));

/* ---------------- domain description ---------------- */
const domainSelect = document.getElementById("domainSelect");
const domainDesc = document.getElementById("domainDesc");
domainSelect.addEventListener("change", () => {
  const val = domainSelect.value;
  domainDesc.textContent = DOMAIN_DESCRIPTIONS[val] || "";
  domainDesc.classList.toggle("is-visible", Boolean(val));
  clearFieldError("domainSelect");
});

/* ---------------- dynamic member name fields ---------------- */
const numMembersSelect = document.getElementById("numMembers");
const memberFields = document.getElementById("memberFields");
numMembersSelect.addEventListener("change", () => {
  renderMemberFields(parseInt(numMembersSelect.value, 10) || 0);
  clearFieldError("numMembers");
});
function renderMemberFields(count){
  memberFields.innerHTML = "";
  if(count <= 1) return;
  for(let i = 2; i <= count; i++){
    const wrap = document.createElement("div");
    wrap.className = "field";
    wrap.innerHTML = `
      <label for="member${i}Name">TEAM MEMBER - ${i}</label>
      <input type="text" id="member${i}Name" name="member${i}Name" placeholder="Full name" required>
      <p class="field-error" data-error-for="member${i}Name"></p>
    `;
    memberFields.appendChild(wrap);
  }
}

/* ---------------- payment screenshot upload + preview ---------------- */
const uploadDropzone = document.getElementById("uploadDropzone");
const paymentInput = document.getElementById("paymentScreenshot");
const uploadCopy = document.getElementById("uploadCopy");
const uploadPreview = document.getElementById("uploadPreview");
let screenshotDataUrl = null;

paymentInput.addEventListener("change", () => handleScreenshotFile(paymentInput.files[0]));
["dragenter","dragover"].forEach(evt => {
  uploadDropzone.addEventListener(evt, (e) => { e.preventDefault(); uploadDropzone.classList.add("is-dragover"); });
});
["dragleave","drop"].forEach(evt => {
  uploadDropzone.addEventListener(evt, (e) => { e.preventDefault(); uploadDropzone.classList.remove("is-dragover"); });
});
uploadDropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if(file){
    paymentInput.files = e.dataTransfer.files;
    handleScreenshotFile(file);
  }
});

function handleScreenshotFile(file){
  if(!file) return;
  clearFieldError("paymentScreenshot");

  if(!file.type.startsWith("image/")){
    showFieldError("paymentScreenshot", "Please upload an image file.");
    return;
  }
  if(file.size > MAX_SCREENSHOT_BYTES){
    showFieldError("paymentScreenshot", "File is larger than 2 MB — please compress and re-upload.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    screenshotDataUrl = reader.result;
    uploadPreview.src = screenshotDataUrl;
    uploadPreview.style.display = "block";
    uploadCopy.textContent = file.name;
  };
  reader.readAsDataURL(file);
}

/* ---------------- validation helpers ---------------- */
function showFieldError(fieldId, message){
  const errorEl = document.querySelector(`[data-error-for="${fieldId}"]`);
  const fieldEl = document.getElementById(fieldId);
  if(errorEl){ errorEl.textContent = message; errorEl.classList.add("is-visible"); }
  if(fieldEl){ fieldEl.closest(".field")?.classList.add("has-error"); }
}
function clearFieldError(fieldId){
  const errorEl = document.querySelector(`[data-error-for="${fieldId}"]`);
  const fieldEl = document.getElementById(fieldId);
  if(errorEl){ errorEl.textContent = ""; errorEl.classList.remove("is-visible"); }
  if(fieldEl){ fieldEl.closest(".field")?.classList.remove("has-error"); }
}
function clearAllErrors(form){
  form.querySelectorAll(".field-error").forEach(el => { el.textContent = ""; el.classList.remove("is-visible"); });
  form.querySelectorAll(".has-error").forEach(el => el.classList.remove("has-error"));
}

/* ---------------- form submit ---------------- */
const registerForm = document.getElementById("registerForm");
const formStatus = document.getElementById("formStatus");
const successPanel = document.getElementById("successPanel");
const successTeamName = document.getElementById("successTeamName");
const editRegistrationBtn = document.getElementById("editRegistrationBtn");

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  clearAllErrors(registerForm);
  formStatus.textContent = "";
  formStatus.classList.remove("is-success");

  const data = new FormData(registerForm);
  const domain = data.get("domain") || "";
  const studentName = (data.get("studentName") || "").trim();
  const email = (data.get("email") || "").trim();
  const collegeName = (data.get("collegeName") || "").trim();
  const department = (data.get("department") || "").trim();
  const teamName = (data.get("teamName") || "").trim();
  const numMembers = parseInt(data.get("numMembers") || "0", 10);
  const foodPref = data.get("foodPref") || "";

  let hasError = false;
  const require = (id, val, msg) => {
    if(!val){ showFieldError(id, msg); hasError = true; }
  };

  require("domainSelect", domain, "Please select your domain.");
  require("studentName", studentName, "Please enter your name.");
  if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    showFieldError("email", "Please enter a valid email address.");
    hasError = true;
  }
  require("collegeName", collegeName, "Please enter your college name.");
  require("department", department, "Please enter your department.");
  require("teamName", teamName, "Please enter a team name.");
  require("numMembers", numMembers ? String(numMembers) : "", "Please select team size.");
  require("foodPref", foodPref, "Please select a food preference.");

  const memberNames = [];
  if(numMembers > 1){
    for(let i = 2; i <= numMembers; i++){
      const val = (data.get(`member${i}Name`) || "").trim();
      if(!val){ showFieldError(`member${i}Name`, "Please enter this member's name."); hasError = true; }
      memberNames.push(val);
    }
  }

  if(!screenshotDataUrl){
    showFieldError("paymentScreenshot", "Please upload your payment screenshot.");
    hasError = true;
  }

  if(!document.getElementById("confirmCheck").checked){
    showFieldError("confirmCheck", "Please confirm your information is correct.");
    hasError = true;
  }

  if(hasError){
    formStatus.textContent = "Please fix the highlighted fields above.";
    const firstError = registerForm.querySelector(".has-error, .field-error.is-visible");
    firstError?.scrollIntoView({ behavior:"smooth", block:"center" });
    return;
  }

  const key = normalizeTeamName(teamName);
  const teams = readTeams();

  if(teams[key] && !registerForm.dataset.editingKey){
    showFieldError("teamName", "This team name is already registered. Choose a unique team name.");
    formStatus.textContent = "Team name already exists.";
    return;
  }

  teams[key] = {
    teamName,
    domain,
    domainDescription: DOMAIN_DESCRIPTIONS[domain] || "",
    studentName,
    email,
    collegeName,
    department,
    numMembers,
    memberNames,
    foodPref,
    paymentScreenshot: { name: paymentInput.files[0]?.name || "screenshot", dataUrl: screenshotDataUrl },
    confirmed: true,
    updatedAt: new Date().toISOString()
  };
  writeTeams(teams);

  registerForm.hidden = true;
  successPanel.hidden = false;
  successTeamName.textContent = teamName;
  registerForm.dataset.editingKey = key;
  successPanel.scrollIntoView({ behavior:"smooth", block:"center" });
});

editRegistrationBtn.addEventListener("click", () => {
  successPanel.hidden = true;
  registerForm.hidden = false;
  formStatus.textContent = "Editing your existing registration — confirm again to update it.";
  registerForm.scrollIntoView({ behavior:"smooth", block:"start" });
});
