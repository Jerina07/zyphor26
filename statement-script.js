/* =========================================================
   ZYPHOR'26 — statement-script.js
   Statement unlock countdown, Team lookup & Statement selection
   ========================================================= */

import { DOMAIN_STATEMENTS } from "./statements-data.js";
import {
  getTeamByName,
  getClaimedStatementIds,
  claimProblemStatement
} from "./supabase-client.js";

// Target Release Date: 27-08-2026 09:00:00 AM IST
const UNLOCK_DATE = new Date("2026-08-27T09:00:00+05:30").getTime();

let selectedTeamData = null;
let selectedStatementObj = null;
let claimedStatementIds = new Set();

/* ----------------------------------------------------------
   Countdown & Unlock Check
---------------------------------------------------------- */
const stmtLockCard     = document.getElementById("stmtLockCard");
const stmtUnlockedCard = document.getElementById("stmtUnlockedCard");

function updateCountdown() {
  const now = new Date().getTime();
  const diff = UNLOCK_DATE - now;

  if (diff <= 0) {
    // Unlocked automatically!
    unlockStatementsPage();
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById("cdDays").textContent  = String(days).padStart(2, "0");
  document.getElementById("cdHours").textContent = String(hours).padStart(2, "0");
  document.getElementById("cdMins").textContent  = String(mins).padStart(2, "0");
  document.getElementById("cdSecs").textContent  = String(secs).padStart(2, "0");
}

let countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

function unlockStatementsPage() {
  stmtLockCard.hidden = true;
  stmtUnlockedCard.hidden = false;
}

/* ----------------------------------------------------------
   Team Lookup Form
---------------------------------------------------------- */
const teamLookupForm   = document.getElementById("teamLookupForm");
const stmtTeamNameInput = document.getElementById("stmtTeamNameInput");
const btnStmtLookup    = document.getElementById("btnStmtLookup");
const stmtLookupStatus = document.getElementById("stmtLookupStatus");
const stmtListSection  = document.getElementById("stmtListSection");

teamLookupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  stmtLookupStatus.textContent = "";
  stmtLookupStatus.className = "stmt-lookup-status";

  const nameVal = stmtTeamNameInput.value.trim();
  if (!nameVal) {
    stmtLookupStatus.textContent = "Please enter your team name.";
    stmtLookupStatus.classList.add("error");
    return;
  }

  btnStmtLookup.disabled = true;
  stmtLookupStatus.textContent = "Searching team database…";

  try {
    const { data, error } = await getTeamByName(nameVal);
    btnStmtLookup.disabled = false;

    if (error || !data) {
      stmtLookupStatus.textContent = "✗ Team not found. Please register your team in Problem Statement page first.";
      stmtLookupStatus.classList.add("error");
      return;
    }

    selectedTeamData = data;
    stmtLookupStatus.textContent = `✓ Found Team "${data.team_name}" (${data.domain} Domain)`;
    stmtLookupStatus.classList.add("success");

    // Check if team already selected a statement
    if (data.selected_statement) {
      try {
        const parsed = JSON.parse(data.selected_statement);
        showConfirmedPanel(parsed);
        return;
      } catch(e) {}
    }

    await renderStatementsForDomain(data.domain);

    document.getElementById("displayTeamName").textContent   = data.team_name;
    document.getElementById("displayTeamDomain").textContent = data.domain + " Domain";

    stmtListSection.hidden = false;
    stmtListSection.scrollIntoView({ behavior: "smooth" });

  } catch (err) {
    btnStmtLookup.disabled = false;
    stmtLookupStatus.textContent = "Lookup failed: " + (err.message || "Unknown error");
    stmtLookupStatus.classList.add("error");
  }
});

/* ----------------------------------------------------------
   Render Statements
---------------------------------------------------------- */
const stmtCardsGrid = document.getElementById("stmtCardsGrid");

async function renderStatementsForDomain(domain) {
  const statements = DOMAIN_STATEMENTS[domain] || DOMAIN_STATEMENTS.AI;
  stmtCardsGrid.innerHTML = "";

  // Read already-claimed statements before showing the choices.
  const { data: claimedRows, error: claimedError } =
    await getClaimedStatementIds(domain);

  if (claimedError) {
    console.error("Could not load statement availability:", claimedError);
    stmtCardsGrid.innerHTML = `
      <p class="stmt-availability-error">
        Could not load statement availability. Please refresh and try again.
      </p>`;
    return;
  }

  claimedStatementIds = new Set(
    (claimedRows || []).map(row => row.statement_id)
  );

  let firstAvailable = true;

  statements.forEach((item) => {
    const claimed = claimedStatementIds.has(item.id);
    const label = document.createElement("label");

    label.className = "stmt-card" + (claimed ? " stmt-card--claimed" : "");
    if (!claimed) label.setAttribute("for", `stmt_${item.id}`);

    const checked = !claimed && firstAvailable;
    if (checked) firstAvailable = false;

    label.innerHTML = `
      <input
        type="radio"
        name="selectedStatementId"
        id="stmt_${item.id}"
        value="${item.id}"
        class="stmt-card-radio"
        ${checked ? "checked" : ""}
        ${claimed ? "disabled" : ""}
      >

      <div class="stmt-card-inner">
        <div class="stmt-card-code">${escapeHtml(item.id)}</div>

        <div class="stmt-card-body">
          <h3 class="stmt-card-title">${escapeHtml(item.title)}</h3>
          <p class="stmt-card-desc">${escapeHtml(item.description)}</p>

          <div class="stmt-card-meta">
            <span class="stmt-tag">${escapeHtml(item.category)}</span>
            <span class="stmt-tag">${escapeHtml(item.level)}</span>
            ${
              claimed
                ? '<span class="stmt-tag stmt-tag--claimed">Already Selected</span>'
                : '<span class="stmt-tag stmt-tag--available">Available</span>'
            }
          </div>
        </div>

        <div class="stmt-card-radio-mark"></div>
      </div>
    `;

    stmtCardsGrid.appendChild(label);
  });

  if (firstAvailable) {
    const note = document.createElement("p");
    note.className = "stmt-availability-error";
    note.textContent =
      "All problem statements in this domain have already been selected by other teams.";
    stmtCardsGrid.appendChild(note);

    btnConfirmStatement.disabled = true;
  } else {
    btnConfirmStatement.disabled = false;
  }
}

/* ----------------------------------------------------------
   Submit Selected Statement
---------------------------------------------------------- */
const statementSelectForm = document.getElementById("statementSelectForm");
const btnConfirmStatement = document.getElementById("btnConfirmStatement");
const btnConfirmText      = document.getElementById("btnConfirmText");

statementSelectForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!selectedTeamData) return;

  const checkedRadio = document.querySelector('input[name="selectedStatementId"]:checked');
  if (!checkedRadio) {
    alert("Please select a problem statement.");
    return;
  }

  const stmtId = checkedRadio.value;
  const domain = selectedTeamData.domain || "AI";
  const statementsList = DOMAIN_STATEMENTS[domain] || DOMAIN_STATEMENTS.AI;
  const matchObj = statementsList.find(s => s.id === stmtId);

  if (!matchObj) return;

  // Extra client-side check for a better user experience.
  if (claimedStatementIds.has(stmtId)) {
    alert("This problem statement has already been selected by another team.");
    await renderStatementsForDomain(domain);
    return;
  }

  btnConfirmStatement.disabled = true;
  btnConfirmText.textContent = "Locking Selection…";

  try {
    /*
      The RPC is atomic on the database. Even if another team
      selects this same statement at the exact same moment,
      only one team can win the UNIQUE statement_id claim.
    */
    const { data, error } = await claimProblemStatement(
      selectedTeamData.id,
      stmtId,
      matchObj
    );

    if (error) throw error;

    const confirmedStatement = data || matchObj;
    showConfirmedPanel(confirmedStatement);

  } catch (err) {
    console.error("Statement claim failed:", err);

    const message = err?.message || "";

    if (message.toLowerCase().includes("already selected")) {
      alert("This problem statement has already been selected by another team. Please choose another one.");
      await renderStatementsForDomain(domain);
    } else {
      alert("Could not lock the statement: " + message);
    }

    btnConfirmStatement.disabled = false;
    btnConfirmText.textContent = "Confirm & Lock Selected Statement";
  }
});

function showConfirmedPanel(stmtObj) {
  document.getElementById("stmtLookupSection").hidden = true;
  document.getElementById("stmtListSection").hidden   = true;

  document.getElementById("confirmedTeamDisplay").textContent = selectedTeamData ? selectedTeamData.team_name : "";
  document.getElementById("confCode").textContent  = stmtObj.id;
  document.getElementById("confTitle").textContent = stmtObj.title;
  document.getElementById("confDesc").textContent  = stmtObj.description;

  document.getElementById("stmtSuccessBox").hidden = false;
  document.getElementById("stmtSuccessBox").scrollIntoView({ behavior: "smooth" });
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}
