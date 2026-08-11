/* =========================================================
   ZYPHOR'26 — ps-script.js
   Problem Statement multi-step team registration logic
   ========================================================= */

import { upsertTeam } from "./supabase-client.js";

let currentStep = 1;
let selectedDomain = null;
let collectedData = {};

function showErr(id, msg) {
  const el = document.querySelector(`[data-error="${id}"]`);
  const fi = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add("visible"); }
  if (fi) fi.closest(".ps-field")?.classList.add("has-error");
}
function clearErr(id) {
  const el = document.querySelector(`[data-error="${id}"]`);
  const fi = document.getElementById(id);
  if (el) { el.textContent = ""; el.classList.remove("visible"); }
  if (fi) fi.closest(".ps-field")?.classList.remove("has-error");
}
function clearAllErrors() {
  document.querySelectorAll(".ps-field-error").forEach(e => { e.textContent = ""; e.classList.remove("visible"); });
  document.querySelectorAll(".has-error").forEach(e => e.classList.remove("has-error"));
}

function setStep(n) {
  currentStep = n;

  document.querySelectorAll(".ps-step-panel").forEach((p, i) => {
    const stepNum = i + 1;
    if (stepNum === n) {
      p.hidden = false;
      p.classList.add("active");
      setTimeout(() => p.classList.add("entered"), 20);
    } else {
      p.hidden = true;
      p.classList.remove("active", "entered");
    }
  });

  document.querySelectorAll(".ps-step").forEach((dot, i) => {
    const sn = i + 1;
    dot.classList.toggle("active", sn === n);
    dot.classList.toggle("done", sn < n);
  });

  const pct = [(0), (50), (100)][n - 1] ?? 0;
  document.getElementById("progressFill").style.width = pct + "%";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* Step 1 — Domain */
const domainRadios = document.querySelectorAll(".domain-radio");
const step1Next    = document.getElementById("step1Next");
const step1Error   = document.getElementById("step1Error");

domainRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    selectedDomain = radio.value;
    step1Next.disabled = false;
    step1Error.textContent = "";
    document.querySelectorAll(".domain-card").forEach(c => c.classList.remove("selected"));
    radio.closest(".domain-card").classList.add("selected");
  });
});

step1Next.addEventListener("click", () => {
  if (!selectedDomain) {
    step1Error.textContent = "Please select a domain to continue.";
    return;
  }
  document.getElementById("selectedDomainBadge").textContent = "Domain: " + selectedDomain;
  setStep(2);
});

/* Step 2 — Team Details */
const numMembersSelect = document.getElementById("psNumMembers");
const memberFieldsWrap = document.getElementById("psMemberFields");

numMembersSelect.addEventListener("change", () => {
  clearErr("psNumMembers");
  renderMemberFields(parseInt(numMembersSelect.value) || 0);
});

function renderMemberFields(count) {
  memberFieldsWrap.innerHTML = "";
  for (let i = 2; i <= count; i++) {
    const div = document.createElement("div");
    div.className = "ps-field";
    div.innerHTML = `
      <label for="psMember${i}" class="ps-label">TEAM MEMBER ${i} NAME <span class="req">*</span></label>
      <input type="text" id="psMember${i}" name="member${i}" class="ps-input" placeholder="Full name" required>
      <p class="ps-field-error" data-error="psMember${i}"></p>
    `;
    memberFieldsWrap.appendChild(div);
    div.querySelector("input").addEventListener("input", () => clearErr(`psMember${i}`));
  }
}

document.getElementById("step2Back").addEventListener("click", () => setStep(1));

document.getElementById("step2Next").addEventListener("click", () => {
  clearAllErrors();
  let ok = true;

  const teamName   = document.getElementById("psTeamName").value.trim();
  const teamLeader = document.getElementById("psTeamLeader").value.trim();
  const numMembers = parseInt(numMembersSelect.value) || 0;

  if (!teamName) { showErr("psTeamName", "Please enter your team name."); ok = false; }
  if (!teamLeader) { showErr("psTeamLeader", "Please enter the team leader's name."); ok = false; }
  if (!numMembers) { showErr("psNumMembers", "Please select the number of members."); ok = false; }

  const memberNames = [];
  for (let i = 2; i <= numMembers; i++) {
    const val = (document.getElementById(`psMember${i}`)?.value || "").trim();
    if (!val) { showErr(`psMember${i}`, "Please enter this member's name."); ok = false; }
    memberNames.push(val);
  }

  if (!ok) {
    document.getElementById("step2Error").textContent = "Please fill in all required fields.";
    document.querySelector(".has-error, .ps-field-error.visible")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  document.getElementById("step2Error").textContent = "";

  collectedData = {
    domain: selectedDomain,
    teamName,
    teamLeader,
    numMembers,
    memberNames
  };

  populateReview();
  setStep(3);
});

/* Step 3 — Review & Submit */
function populateReview() {
  const d = collectedData;
  document.getElementById("reviewDomain").textContent     = d.domain;
  document.getElementById("reviewTeamName").textContent   = d.teamName;
  document.getElementById("reviewTeamLeader").textContent = d.teamLeader;
  document.getElementById("reviewNumMembers").textContent = d.numMembers;

  const allMembers = [d.teamLeader, ...d.memberNames].filter(Boolean);
  document.getElementById("reviewMemberNames").textContent = allMembers.join(", ");
}

document.getElementById("step3Back").addEventListener("click", () => setStep(2));

document.getElementById("confirmPSBtn").addEventListener("click", async () => {
  const btn        = document.getElementById("confirmPSBtn");
  const btnText    = document.getElementById("confirmBtnText");
  const spinner    = document.getElementById("confirmSpinner");
  const step3Error = document.getElementById("step3Error");

  btn.disabled = true;
  btnText.textContent = "Saving Team...";
  spinner.style.display = "inline-block";
  step3Error.textContent = "";

  try {
    const d = collectedData;

    const result = await upsertTeam({
  teamName: d.teamName,
  domain: d.domain,
  teamLeader: d.teamLeader,
  numMembers: d.numMembers,
  memberNames: d.memberNames
});

console.log("SUPABASE TEAM RESULT:", result);

if (result.error) {
  console.error("TEAM INSERT ERROR:", {
    message: result.error.message,
    details: result.error.details,
    hint: result.error.hint,
    code: result.error.code
  });

  throw result.error;
}

console.log("TEAM CREATED:", result.data);

const team = result.data;

    document.getElementById("successTeamNameDisplay").textContent = d.teamName;
    document.getElementById("successDomainDisplay").textContent   = d.domain;

    document.querySelectorAll(".ps-step-panel").forEach(p => { p.hidden = true; });
    document.getElementById("successPanel").hidden = false;
    document.getElementById("progressWrap").hidden = true;

    window.scrollTo({ top: 0, behavior: "smooth" });

  } catch (err) {
    console.error("PS submission error:", err);
    step3Error.textContent = "Submission failed: " + (err.message || "Unknown error. Please try again.");
    btn.disabled = false;
    btnText.textContent = "Confirm Team Details";
    spinner.style.display = "none";
  }
});

/* Sticky Header */
const siteHeader = document.getElementById("siteHeader");
window.addEventListener("scroll", () => {
  siteHeader.classList.toggle("scrolled", window.scrollY > 12);
}, { passive: true });

const navToggle = document.getElementById("navToggle");
const mainNav   = document.getElementById("mainNav");
navToggle?.addEventListener("click", () => {
  const open = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});

setStep(1);
